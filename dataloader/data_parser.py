import gzip
import os
from urllib.request import urlopen

from pyArango.connection import *

from constants import (
    COLLECTION_PARALLELS,
    COLLECTION_SEGMENTS,
    COLLECTION_FILES,
    TIBETAN_MENU_URL,
    LANG_TIBETAN,
)
from models_dataloader import Parallel, Segment, MenuItem
from utils import get_remote_bytes, get_db_connection, get_database, execute_in_parallel


def load_parallels_into_db(json_parallels: [Parallel], connection: Connection) -> None:
    """
    Given an array of parallel objects, load them all into the `parallels` collection

    :param json_parallels: Array of parallel objects to be loaded as-they-are.
    :param connection: ArangoDB connection object
    """
    collection = connection[COLLECTION_PARALLELS]
    for parallel in json_parallels:
        doc = collection.createDocument()
        doc._key = parallel["id"]
        doc.set(parallel)
        try:
            doc.save()
        except CreationError as e:
            print(f"Could not save parallel {parallel}. Error: ", e)


def load_segment_into_db(json_segment: Segment, connection: Connection) -> str:
    """
    Given a single segment object, load it into the `segments` collection.

    :param json_segment: Segment JSON data
    :param connection: ArangoDB database object
    :return: Segment nr
    """
    collection = connection[COLLECTION_SEGMENTS]
    doc = collection.createDocument()
    try:
        doc._key = json_segment["segnr"]
        doc["segnr"] = json_segment["segnr"]
        doc["segtext"] = json_segment["segtext"]
        doc["lang"] = json_segment["lang"]
        doc["position"] = json_segment["position"]
    except KeyError as e:
        print("Could not load segment. Error: ", e)

    try:
        doc.save()
    except CreationError as e:
        print(f"Could not save segment {doc._key}. Error: ", e)

    return json_segment["segnr"]


def load_segments_into_db(segments: list, connection: Connection) -> list:
    """ Returns list of segment numbers. """
    segmentnrs = []
    for segment in segments:
        segmentnr = load_segment_into_db(segment, connection)
        segmentnrs.append(segmentnr)

    return segmentnrs


def load_file_into_db(file: MenuItem, segmentnrs: list, connection: Connection):
    collection = connection[COLLECTION_FILES]
    doc = collection.createDocument()
    doc._key = file["filename"]
    doc.set(file)
    doc["segmentnrs"] = segmentnrs
    try:
        doc.save()
    except CreationError as e:
        print("Could not load file. Error: ", e)


def parse_gzipfile(file_url: str) -> list:
    """
    Given a url to a .gz file:
    1. Download the file
    2. Unpack in memory
    3. Extract segments and parallels
    4. Load into appropriate collections

    :param file_url: URL to the gzipped file
    """
    file_bytes = get_remote_bytes(file_url)
    try:
        with gzip.open(file_bytes) as f:
            parsed = json.loads(f.read())
            segments, parallels = parsed
            f.close()
            return [segments, parallels]
    except OSError as os_error:
        print(f"Could not load the gzipped file {file_url}. Error: ", os_error)
        return [None, None]


def get_menu_file(url: str) -> [MenuItem]:
    with urlopen(url) as file:
        return json.loads(file.read().decode())


def should_download_file(file_lang: str, file_name: str) -> bool:
    """
    (temporary) Limit source file set size to speed up loading process
    Can be controlled with the `LIMIT` environment variable.
    """
    # if language == "chn" and file_name.startswith("T01_T0082"):
    #     return True
    if file_lang == "tib" and file_name.startswith("T06"):
        return True
    else:
        return False


def load_menu_item(menu_item, lang: str, root_url: str) -> None:
    if not should_download_file(lang, menu_item["filename"]):
        return

    file_url = f"{root_url}{lang}/{menu_item['filename']}.json.gz"
    db = get_database()

    print("Loading file: ", menu_item["filename"])

    if not file_url.endswith("gz"):
        print(f"{file_url} is not a gzip file. Ignoring.")
        return

    [segments, parallels] = parse_gzipfile(file_url)
    segmentnrs = []
    if segments:
        segmentnrs = load_segments_into_db(segments, db)
    load_file_into_db(menu_item, segmentnrs, db)
    load_parallels_into_db(parallels, db)


def populate_all_collections_from_menu_files(root_url: str, threads: int):
    tibetan_menu_data = get_menu_file(TIBETAN_MENU_URL)

    filtered_tibetan_menu_data = (
        [
            menu_item
            for menu_item in tibetan_menu_data
            if should_download_file(LANG_TIBETAN, menu_item["filename"])
        ]
        if os.environ["TESTING_LIMIT"]
        else tibetan_menu_data
    )

    execute_in_parallel(
        lambda item: load_menu_item(item, lang=LANG_TIBETAN, root_url=root_url),
        filtered_tibetan_menu_data,
        threads,
    )
    # TODO: Load Chinese and Sanskrit menu files