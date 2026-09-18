import re
import time
from datetime import datetime, timezone as dt_timezone
from email.utils import parsedate_to_datetime
from html import unescape
from html.parser import HTMLParser
from typing import Optional
from xml.etree import ElementTree as ET

import requests
from django.utils import timezone

from apps.regions.models import Region

from .constants import CATEGORY_LABEL_TO_CODE, RSS_FEEDS
from .models import Article, canonical_category

IMG_TAG_RE = re.compile(r"<img[^>]+src=[\"']([^\"']+)[\"']", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")
USER_AGENT = "Canada247Bot/1.0 (+https://canada247.local)"
MEDIA_NAMESPACE = "{http://search.yahoo.com/mrss/}"
DC_NAMESPACE = "{http://purl.org/dc/elements/1.1/}"
CONTENT_NAMESPACE = "{http://purl.org/rss/1.0/modules/content/}"
ATOM_NAMESPACE = "{http://www.w3.org/2005/Atom}"

# WordPress/Jetpack feeds auto-append this attribution line to excerpt-only
# content; it's boilerplate, not part of the story.
_APPEARED_FIRST_ON_RE = re.compile(r"\s*The post .*? appeared first on .*?\.\s*$", re.IGNORECASE | re.DOTALL)


def text_or_blank(element):
    return (element.text or "").strip() if element is not None else ""


class _TextExtractor(HTMLParser):
    """Pulls out only the text nodes, ignoring tags entirely.

    A naive strip via unescape() + regex breaks on WordPress image markup:
    attributes like data-image-caption embed *escaped* HTML
    (data-image-caption="&lt;p&gt;caption&lt;/p&gt;"), and unescaping the
    whole string before stripping tags turns that into a literal <p> mid
    attribute — which fools a bracket-matching regex into thinking the
    surrounding <img ...> tag already closed, spilling the rest of its
    attributes into the visible body. A real parser respects attribute
    quoting and never has this problem.
    """

    def __init__(self):
        super().__init__()
        self.chunks: list[str] = []

    def handle_data(self, data):
        self.chunks.append(data)


def strip_html(value):
    if not value:
        return ""
    try:
        parser = _TextExtractor()
        parser.feed(value)
        parser.close()
        text = "".join(parser.chunks)
    except Exception:
        text = unescape(value)
        text = TAG_RE.sub(" ", text)
    text = _APPEARED_FIRST_ON_RE.sub("", text)
    return re.sub(r"\s+", " ", text).strip()


_JUNK_IMAGE_DOMAINS = {"example.com", "placeholder.com", "via.placeholder.com", "lorempixel.com"}


def _is_absolute_url(url: str) -> bool:
    if not url.startswith(("http://", "https://")):
        return False
    try:
        from urllib.parse import urlparse
        host = urlparse(url).netloc.lower().lstrip("www.")
        return host not in _JUNK_IMAGE_DOMAINS
    except Exception:
        return True


def extract_image_url(item, raw_description):
    for tag_name in (f"{MEDIA_NAMESPACE}content", f"{MEDIA_NAMESPACE}thumbnail"):
        media = item.find(tag_name)
        if media is not None:
            url = media.attrib.get("url", "").strip()
            if url and _is_absolute_url(url):
                return url

    enclosure = item.find("enclosure")
    if enclosure is not None:
        url = enclosure.attrib.get("url", "").strip()
        if url and _is_absolute_url(url):
            return url

    match = IMG_TAG_RE.search(raw_description or "")
    if match:
        url = match.group(1).strip()
        if _is_absolute_url(url):
            return url
    return ""


class _OpenGraphMetaParser(HTMLParser):
    """Pulls og:image/twitter:image out of a page's <meta> tags without needing a full HTML parser dependency."""

    def __init__(self):
        super().__init__()
        self.meta: dict[str, str] = {}
        self.head_closed = False

    def handle_starttag(self, tag, attrs):
        if tag == "head":
            return
        if self.head_closed:
            return
        if tag != "meta":
            return
        attrs_dict = dict(attrs)
        key = (attrs_dict.get("property") or attrs_dict.get("name") or "").lower()
        content = attrs_dict.get("content")
        if key and content and key not in self.meta:
            self.meta[key] = content

    def handle_endtag(self, tag):
        if tag == "head":
            self.head_closed = True


def fetch_og_image(url: str, timeout: int = 10) -> str:
    if not url:
        return ""
    try:
        response = requests.get(
            url,
            timeout=timeout,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
        )
        response.raise_for_status()
    except requests.RequestException:
        return ""

    parser = _OpenGraphMetaParser()
    try:
        # Meta tags always live in <head>, so this stops parsing as soon as it closes
        # rather than churning through the full article body.
        parser.feed(response.text)
    except Exception:
        pass

    image_url = parser.meta.get("og:image") or parser.meta.get("twitter:image", "")
    return image_url if _is_absolute_url(image_url) else ""


# Some sources (wire-service style feeds, teaser-only WordPress configs) never
# put more than one or two sentences in the feed itself. For those, the only
# way to get real depth is to fetch the article's own page and pull the body
# out of the surrounding template. Kept intentionally conservative: this is
# only ever used to *replace a too-short body*, never to add content that
# doesn't come from the source's own published page, and it always degrades
# to the short RSS body on any failure rather than raising.
MIN_BODY_LENGTH_FOR_FULL_FETCH = 400

_VOID_TAGS = {"img", "input", "meta", "link", "hr", "source", "track", "wbr", "area", "base", "col", "embed"}
_DROP_SUBTREE_TAGS = {
    "script", "style", "form", "button", "iframe", "svg", "nav", "footer",
    "header", "aside", "select", "noscript", "video", "audio", "object", "canvas",
}
_BLOCK_TAGS = {"p", "div", "section", "article", "li", "blockquote", "h1", "h2", "h3", "h4"}
_BOILERPLATE_RE = re.compile(
    r"(sign up|newsletter|subscribe|terms (and|&) conditions|privacy policy|"
    r"advertisement|related stor(y|ies)|read more|click here|follow us on|"
    r"get daily|delivered to your inbox|never miss|^©|all rights reserved|division of)",
    re.IGNORECASE,
)


class _ArticleBodyHtmlCleaner(HTMLParser):
    """Reduces a readability-extracted article DOM to plain <p>/<a>/<strong>/<em>
    markup, dropping non-content subtrees (nav, forms, embeds, ...) and any
    paragraph that reads like boilerplate (newsletter prompts, copyright lines).
    """

    def __init__(self):
        super().__init__()
        self.paragraphs: list[str] = []
        self._skip_depth = 0
        self._current: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in _VOID_TAGS:
            return
        if self._skip_depth > 0:
            if tag in _DROP_SUBTREE_TAGS:
                self._skip_depth += 1
            return
        if tag in _DROP_SUBTREE_TAGS:
            self._skip_depth += 1
        elif tag == "a":
            href = dict(attrs).get("href") or "#"
            self._current.append(f'<a href="{href}">')
        elif tag in ("strong", "b"):
            self._current.append("<strong>")
        elif tag in ("em", "i"):
            self._current.append("<em>")
        elif tag == "br":
            self._current.append("<br/>")

    def handle_endtag(self, tag):
        if tag in _VOID_TAGS:
            return
        if self._skip_depth > 0:
            if tag in _DROP_SUBTREE_TAGS:
                self._skip_depth -= 1
            return
        if tag == "a":
            self._current.append("</a>")
        elif tag in ("strong", "b"):
            self._current.append("</strong>")
        elif tag in ("em", "i"):
            self._current.append("</em>")
        elif tag in _BLOCK_TAGS:
            html = "".join(self._current).strip()
            plain = TAG_RE.sub("", html).strip()
            if plain and len(plain) > 20 and not _BOILERPLATE_RE.search(plain):
                if not self.paragraphs or self.paragraphs[-1] != html:
                    self.paragraphs.append(html)
            self._current = []

    def handle_data(self, data):
        if self._skip_depth == 0:
            self._current.append(data)


def fetch_full_article_body(url: str, timeout: int = 12) -> str:
    """Fetch `url` and extract its main article text as clean paragraph HTML.

    Returns "" on any failure (network error, no article-like content found,
    the `readability` heuristic misfiring) — callers must treat that as
    "couldn't improve on what we already have," not as an error to surface.
    """
    if not url:
        return ""
    try:
        from readability import Document
    except ImportError:
        return ""

    try:
        response = requests.get(
            url,
            timeout=timeout,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
        )
        response.raise_for_status()
    except requests.RequestException:
        return ""

    try:
        summary_html = Document(response.text).summary()
    except Exception:
        return ""

    cleaner = _ArticleBodyHtmlCleaner()
    try:
        cleaner.feed(summary_html)
    except Exception:
        return ""

    return "\n".join(f"<p>{p}</p>" for p in cleaner.paragraphs)


def parse_published_at(value):
    if not value:
        return timezone.now()
    try:
        parsed = parsedate_to_datetime(value)
        if parsed is None:
            raise ValueError("Unable to parse datetime")
        if timezone.is_naive(parsed):
            parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
        return parsed
    except Exception:
        return timezone.now()


def normalize_category(default_category, item):
    if default_category:
        return canonical_category(default_category)

    category_text = text_or_blank(item.find("category")).lower()
    raw = CATEGORY_LABEL_TO_CODE.get(category_text, Article.Category.GENERAL)
    return canonical_category(raw)


def parse_atom_date(value: str):
    """Parse ISO 8601 date used in Atom feeds."""
    if not value:
        return timezone.now()
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt_timezone.utc)
        return parsed
    except Exception:
        return timezone.now()


def _atom_link(item) -> str:
    """Extract href from Atom <link rel='alternate' href='...'> or <link href='...'>."""
    for link_el in item.findall(f"{ATOM_NAMESPACE}link"):
        rel = link_el.attrib.get("rel", "alternate")
        href = link_el.attrib.get("href", "")
        if rel in ("alternate", "") and href:
            return href
    # fallback: non-namespaced link element inside Atom entry
    link_el = item.find("link")
    if link_el is not None:
        return link_el.attrib.get("href", "") or (link_el.text or "").strip()
    return ""


def _build_entry(item, feed_key, default_category, *, is_atom=False) -> dict | None:
    if is_atom:
        title = text_or_blank(item.find(f"{ATOM_NAMESPACE}title"))
        raw_description = (
            text_or_blank(item.find(f"{ATOM_NAMESPACE}content"))
            or text_or_blank(item.find(f"{ATOM_NAMESPACE}summary"))
        )
        link = _atom_link(item)
        guid = text_or_blank(item.find(f"{ATOM_NAMESPACE}id")) or link
        author_el = item.find(f"{ATOM_NAMESPACE}author")
        author = text_or_blank(author_el.find(f"{ATOM_NAMESPACE}name")) if author_el is not None else ""
        date_str = (
            text_or_blank(item.find(f"{ATOM_NAMESPACE}published"))
            or text_or_blank(item.find(f"{ATOM_NAMESPACE}updated"))
        )
        published_at = parse_atom_date(date_str)
    else:
        title = text_or_blank(item.find("title"))
        # WordPress/Jetpack feeds put a short teaser in <description> and the
        # full article HTML in <content:encoded>; other feeds only populate
        # one of the two. Take whichever actually has more text rather than
        # always preferring <description>, so full-text feeds aren't reduced
        # to a one-line teaser.
        desc_field = text_or_blank(item.find("description"))
        content_field = text_or_blank(item.find(f"{CONTENT_NAMESPACE}encoded"))
        raw_description = max((desc_field, content_field), key=lambda value: len(strip_html(value)))
        link = text_or_blank(item.find("link"))
        guid = text_or_blank(item.find("guid")) or link
        author = text_or_blank(item.find("author")) or text_or_blank(item.find(f"{DC_NAMESPACE}creator"))
        published_at = parse_published_at(text_or_blank(item.find("pubDate")))

    if not title:
        return None

    if not guid:
        guid = f"{feed_key}:{title}"

    body = strip_html(raw_description)
    category = normalize_category(default_category, item)
    img_url = extract_image_url(item, raw_description)
    title_lower = title.lower()
    body_lower = body.lower()

    return {
        "external_id": guid[:255],
        "headline": title,
        "body": body,
        "category": category,
        "img_url": img_url,
        "source_url": link,
        "author": author,
        "published_at": published_at,
        "is_live": "live" in title_lower or "live" in body_lower,
        "is_updated": "updated" in title_lower or "updated" in body_lower,
        "source": Article.Source.RSS,
        "feed_key": feed_key,
    }


def parse_feed(xml_text, feed_key, default_category=None):
    root = ET.fromstring(xml_text)

    # Detect format: RSS 2.0 uses <item>, Atom uses <entry>
    rss_items = root.findall(".//item")
    atom_items = root.findall(f".//{ATOM_NAMESPACE}entry")

    if rss_items:
        raw_items = [(item, False) for item in rss_items]
    else:
        raw_items = [(item, True) for item in atom_items]

    entries = []
    for item, is_atom in raw_items:
        entry = _build_entry(item, feed_key, default_category, is_atom=is_atom)
        if entry:
            entries.append(entry)
    return entries


def upsert_feed(url, feed_key, default_category=None, region: Optional[Region] = None):
    for attempt in range(2):
        try:
            response = requests.get(
                url,
                timeout=30,
                headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8"},
            )
            response.raise_for_status()
            break
        except requests.RequestException:
            if attempt == 1:
                raise
            time.sleep(3)
    entries = parse_feed(response.text, feed_key=feed_key, default_category=default_category)

    created_count = 0
    updated_count = 0
    created_ids = []

    for entry in entries:
        defaults = entry.copy()
        article, created = Article.objects.get_or_create(external_id=entry["external_id"], defaults=defaults)
        update_fields = []
        if not created:
            for field, value in entry.items():
                if getattr(article, field) != value:
                    setattr(article, field, value)
                    update_fields.append(field)
            if update_fields:
                article.is_updated = True
                if "is_updated" not in update_fields:
                    update_fields.append("is_updated")
                article.save(update_fields=update_fields)
                updated_count += 1
        else:
            created_count += 1
            created_ids.append(article.pk)

        if region is not None:
            article.regions.add(region)

    return {"feed_key": feed_key, "created": created_count, "updated": updated_count, "total": len(entries), "created_ids": created_ids}


def fetch_all_feeds():
    summary = []

    for feed in RSS_FEEDS:
        try:
            summary.append(
                upsert_feed(
                    url=feed["url"],
                    feed_key=feed["feed_key"],
                    default_category=feed["category"],
                )
            )
        except Exception as exc:
            summary.append({"feed_key": feed["feed_key"], "error": str(exc)})

    for region in Region.objects.exclude(rss_url=""):
        try:
            summary.append(
                upsert_feed(
                    url=region.rss_url,
                    feed_key=region.slug,
                    default_category=Article.Category.GENERAL,
                    region=region,
                )
            )
        except Exception as exc:
            summary.append({"feed_key": region.slug, "error": str(exc)})

    return summary
