from whitenoise.storage import CompressedManifestStaticFilesStorage


class SilentCompressedManifestStaticFilesStorage(CompressedManifestStaticFilesStorage):
    """Same as whitenoise's manifest storage, but doesn't hard-fail collectstatic
    when a referenced file (e.g. django.contrib.admin's own widgets.css ->
    selector-icons.svg) isn't in the manifest yet due to processing order."""

    manifest_strict = False
