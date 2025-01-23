"""
Various utilities for interacting with data in API queries.
"""

import re
from urllib.parse import unquote
from .queries import utils_queries
from .db_connection import get_db


def prettify_score(score):
    """
    if score is a floating point number <= 1, return it as an int scaled by 100
    """
    if isinstance(score, float) and score <= 1:
        return int(score * 100)
    return score


def get_filename_from_segmentnr(segnr):
    """
    Get the base filename from a segment number.
    Note that this function is also used in the dataloader and cannot be
    replaced by a query function.
    """
    segnr = segnr.replace(".json", "")
    if "ZH_" in segnr:
        segnr = re.sub("_[0-9]+:", ":", segnr)
    else:
        segnr = re.sub(r"\$[0-9]+", "", segnr)
    return segnr.split(":")[0]


def shorten_segment_names(segments):
    """
    Returns a shortened version of a range of segments
    """
    first_segment = re.sub("-[0-9]+", "", segments[0])
    last_segment = re.sub("-[0-9]+", "", segments[-1])
    shortened_segment = first_segment
    if not first_segment == last_segment:
        shortened_segment += "–" + last_segment.split(":")[1]
    return shortened_segment


def get_sort_key(sort_method) -> str:
    """
    Returns the correct sort_key for table and numbers queries
    """
    sort_key = "parallels_sorted_by_src_pos"
    if sort_method == "position":
        sort_key = "parallels_sorted_by_src_pos"
    elif sort_method == "quotedtext":
        sort_key = "parallels_sorted_by_tgt_pos"
    elif sort_method == "length":
        sort_key = "parallels_sorted_by_length_src"
    elif sort_method == "length2":
        sort_key = "parallels_sorted_by_length_tgt"
    return sort_key


def get_language_from_filename(filename) -> str:
    """
    Given the file ID, returns its language.
    :param filename: The key of the file
    :return: Language of the file
    """
    lang = "unknown"
    if filename.startswith("BO_"):
        lang = "bo"
    elif filename.startswith("PA_"):
        lang = "pa"
    elif filename.startswith("SA_"):
        lang = "sa"
    elif filename.startswith("ZH_"):
        lang = "zh"
    else:
        print("ERROR: Language not found for filename: ", filename)
    return lang


def get_page_for_segment(active_segment):
    """
    Gets the page number for a given segment.
    """
    active_segment = unquote(active_segment)
    page_for_segment = get_db().AQLQuery(
        query=utils_queries.QUERY_PAGE_FOR_SEGMENT,
        bindVars={"segmentnr": active_segment},
    )
    return page_for_segment.result[0]


def get_cat_from_segmentnr(segmentnr):
    """
    retrieves the category code from the segmentnumber
    Note that this function is also used in the dataloader and cannot be
    replaced by a query function.
    """
    return segmentnr.split("_")[1]


def test_collection(inputstring):
    """
    tests if the inputstring is a collection
    """
    collection = False

    if inputstring[0].isupper() and inputstring[1].islower():
        collection = True

    return collection


def arrange_filter_data(filters):
    """
    Stringify include and exclude filters for display
    in download table and numbers files.
    """
    filter_display_include = ""
    filter_display_exclude = ""
    filter_display = ""
    for item in filters:
        if item[0].startswith("i") and item[1]:
            filter_display_include += ", ".join(item[1]) + ", "
        if item[0].startswith("e") and item[1]:
            filter_display_exclude += ", ".join(item[1]) + ", "
    if filter_display_include:
        filter_display = "Include: " + filter_display_include[:-2]
        if filter_display_exclude:
            filter_display += ", Exclude: " + filter_display_exclude[:-2]
    elif filter_display_exclude:
        filter_display = "Exclude: " + filter_display_exclude[:-2]
    return filter_display
