import os

DB_NAME = os.environ["ARANGO_BASE_DB_NAME"]
DEFAULT_SOURCE_URL = os.environ["SOURCE_FILES_URL"]

LANG_TIBETAN = "tib"
LANG_SANSKRIT = "skt"
LANG_CHINESE = "chn"
LANG_PALI = "pli"
DEFAULT_LANGS = (LANG_CHINESE, LANG_SANSKRIT, LANG_TIBETAN, LANG_PALI)

COLLECTION_SEGMENTS = "segments"
COLLECTION_PARALLELS = "parallels"
COLLECTION_FILES = "files"
COLLECTION_MENU_COLLECTIONS = "menu_collections"
COLLECTION_MENU_CATEGORIES = "menu_categories"
COLLECTION_SEGMENT_PARALLELS = "segment_parallels"

COLLECTION_NAMES = (
    COLLECTION_PARALLELS,
    COLLECTION_SEGMENTS,
    COLLECTION_FILES,
    COLLECTION_MENU_COLLECTIONS,
    COLLECTION_MENU_CATEGORIES,
    COLLECTION_SEGMENT_PARALLELS
)
