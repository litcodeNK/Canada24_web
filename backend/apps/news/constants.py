SECTION_DEFINITIONS = [
    # ── News ────────────────────────────────────────────────────────────────────
    {"slug": "politics",            "label": "Politics",            "code": "POLITICS",         "rss_url": "https://globalnews.ca/politics/feed/"},
    {"slug": "world",               "label": "World",               "code": "WORLD",            "rss_url": "https://globalnews.ca/world/feed/"},
    {"slug": "indigenous",          "label": "Indigenous",          "code": "INDIGENOUS",       "rss_url": "https://www.aptnnews.ca/feed/"},
    # ── Life & Society ──────────────────────────────────────────────────────────
    {"slug": "business",            "label": "Business",            "code": "BUSINESS",         "rss_url": "https://globalnews.ca/money/feed/"},
    {"slug": "health",              "label": "Health",              "code": "HEALTH",           "rss_url": "https://globalnews.ca/health/feed/"},
    {"slug": "education-in-canada", "label": "Education in Canada", "code": "EDUCATION",        "rss_url": "https://www.universityaffairs.ca/feed/"},
    {"slug": "events",              "label": "Events",              "code": "EVENTS",           "rss_url": "https://globalnews.ca/tag/events/feed/"},
    # ── Tech, Auto & Aviation ───────────────────────────────────────────────────
    {"slug": "technology",          "label": "Technology",          "code": "TECHNOLOGY",       "rss_url": "https://mobilesyrup.com/feed/"},
    {"slug": "auto-news",           "label": "Auto News",           "code": "AUTO_NEWS",        "rss_url": "https://driving.ca/feed/"},
    {"slug": "aviation",            "label": "Aviation",            "code": "AVIATION",         "rss_url": "https://www.avweb.com/feed/"},
    # ── Immigration & Opportunities ─────────────────────────────────────────────
    {"slug": "immigration",         "label": "Immigration",         "code": "IMMIGRATION",      "rss_url": "https://www.cicnews.com/feed"},
    {"slug": "opportunities",       "label": "Opportunities",       "code": "OPPORTUNITIES",    "rss_url": ""},
    # ── Culture & Community ─────────────────────────────────────────────────────
    {"slug": "sports",              "label": "Sports",              "code": "SPORTS",           "rss_url": "https://www.sportsnet.ca/feed/"},
    {"slug": "entertainment",       "label": "Entertainment",       "code": "ENTERTAINMENT",    "rss_url": "https://nationalpost.com/category/entertainment/feed/"},
    {"slug": "blacks-in-canada",    "label": "Blacks in Canada",    "code": "BLACKS_IN_CANADA", "rss_url": ""},
]

# Additional multi-source RSS feeds for broader coverage
EXTRA_RSS_FEEDS = [
    # ── General / Top Stories ────────────────────────────────────────────────
    {"feed_key": "globalnews-top",      "label": "Global News",           "category": "GENERAL",         "url": "https://globalnews.ca/feed/"},
    {"feed_key": "nationalpost",        "label": "National Post",         "category": "GENERAL",         "url": "https://nationalpost.com/feed/"},

    # ── Politics ─────────────────────────────────────────────────────────────
    {"feed_key": "globalnews-politics", "label": "Global News Politics",  "category": "POLITICS",        "url": "https://globalnews.ca/politics/feed/"},
    {"feed_key": "nationalpost-politics","label": "NP Politics",          "category": "POLITICS",        "url": "https://nationalpost.com/category/news/politics/feed/"},

    # ── Business / Economy ───────────────────────────────────────────────────
    {"feed_key": "globalnews-money",    "label": "Global News Money",     "category": "BUSINESS",        "url": "https://globalnews.ca/money/feed/"},
    {"feed_key": "financialpost",       "label": "Financial Post",        "category": "BUSINESS",        "url": "https://financialpost.com/feed/"},

    # ── Health ───────────────────────────────────────────────────────────────
    {"feed_key": "globalnews-health",   "label": "Global News Health",    "category": "HEALTH",          "url": "https://globalnews.ca/health/feed/"},

    # ── Sports ───────────────────────────────────────────────────────────────
    {"feed_key": "globalnews-sports",   "label": "Global News Sports",    "category": "SPORTS",          "url": "https://globalnews.ca/sports/feed/"},
    {"feed_key": "sportsnet",           "label": "Sportsnet",             "category": "SPORTS",          "url": "https://www.sportsnet.ca/feed/"},

    # ── Technology ───────────────────────────────────────────────────────────
    {"feed_key": "mobilesyrup",         "label": "MobileSyrup",           "category": "TECHNOLOGY",      "url": "https://mobilesyrup.com/feed/"},
    {"feed_key": "itworldca",           "label": "IT World Canada",       "category": "TECHNOLOGY",      "url": "https://www.itworldcanada.com/feed"},

    # ── Immigration ──────────────────────────────────────────────────────────
    {"feed_key": "cicnews",             "label": "CIC News Immigration",  "category": "IMMIGRATION",     "url": "https://www.cicnews.com/feed"},

    # ── Aviation ─────────────────────────────────────────────────────────────
    {"feed_key": "avweb",               "label": "AVweb",                 "category": "AVIATION",        "url": "https://www.avweb.com/feed/"},

    # ── Education ────────────────────────────────────────────────────────────
    {"feed_key": "universityaffairs",   "label": "University Affairs",    "category": "EDUCATION",       "url": "https://www.universityaffairs.ca/feed/"},

    # ── Auto News ────────────────────────────────────────────────────────────
    {"feed_key": "driving-ca",          "label": "Driving.ca",            "category": "AUTO_NEWS",       "url": "https://driving.ca/feed/"},
    {"feed_key": "caranddriver",        "label": "Car and Driver",        "category": "AUTO_NEWS",       "url": "https://www.caranddriver.com/rss/all.xml"},



    # ── Indigenous ───────────────────────────────────────────────────────────
    {"feed_key": "aptn",                "label": "APTN National News",    "category": "INDIGENOUS",      "url": "https://www.aptnnews.ca/feed/"},

    # ── World ────────────────────────────────────────────────────────────────
    {"feed_key": "globalnews-world",    "label": "Global News World",     "category": "WORLD",           "url": "https://globalnews.ca/world/feed/"},
    {"feed_key": "nationalpost-world",  "label": "NP World",              "category": "WORLD",           "url": "https://nationalpost.com/category/news/world/feed/"},

    # ── Entertainment ────────────────────────────────────────────────────────
    {"feed_key": "np-entertainment",    "label": "NP Entertainment",      "category": "ENTERTAINMENT",   "url": "https://nationalpost.com/category/entertainment/feed/"},
]

RSS_FEEDS = [
    {"feed_key": "top-stories", "label": "Top Stories", "category": "GENERAL", "url": "https://globalnews.ca/feed/"},
    *[
        {
            "feed_key": item["slug"],
            "label": item["label"],
            "category": item["code"],
            "url": item["rss_url"],
        }
        for item in SECTION_DEFINITIONS
        if item["rss_url"]
    ],
    *EXTRA_RSS_FEEDS,
]

SECTION_BY_SLUG  = {item["slug"]: item for item in SECTION_DEFINITIONS}
SECTION_BY_CODE  = {item["code"]: item for item in SECTION_DEFINITIONS}
CATEGORY_LABEL_TO_CODE = {item["label"].lower(): item["code"] for item in SECTION_DEFINITIONS}
CATEGORY_LABEL_TO_CODE.update(
    {
        "top stories": "GENERAL",
        "canada": "GENERAL",
        "general": "GENERAL",
        "education": "EDUCATION",
        "auto": "AUTO_NEWS",
        "autos": "AUTO_NEWS",
        "automotive": "AUTO_NEWS",
        "aviation": "AVIATION",
        "black canadians": "BLACKS_IN_CANADA",
        "blacks in canada": "BLACKS_IN_CANADA",
        "opportunities": "OPPORTUNITIES",
        "jobs": "OPPORTUNITIES",
        "jobs & careers": "OPPORTUNITIES",
        "scholarships": "OPPORTUNITIES",
        "grants": "OPPORTUNITIES",
        "immigration": "IMMIGRATION",
        "nation": "POLITICS",
        "breaking-news": "GENERAL",
        "money": "BUSINESS",
        "arts": "ENTERTAINMENT",
        "science": "TECHNOLOGY",
    }
)
