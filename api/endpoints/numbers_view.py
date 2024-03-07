from fastapi import APIRouter, Query
import re
from ..utils import (
    get_language_from_file_name,
    get_sort_key,
    collect_segment_results,
    get_folio_regex,
    create_cleaned_limit_collection,
    shorten_segment_names,
)
from .endpoint_utils import execute_query
from ..queries import main_queries, menu_queries
from .models.shared import GeneralInput


router = APIRouter()


def create_numbers_view_data(table_results):
    """
    This function converts the table-view output into a format 
    that is usable for the numbers-view.
    """
    result_dic = {}
    for result in table_results:
        par_segnr = shorten_segment_names(result["par_segnr"])[0]
        match = result["par_full_names"]
        match["segmentnr"] = par_segnr
        for segnr in result["root_segnr"]:
            print(segnr)
            if not segnr in result_dic:
                result_dic[segnr] = [match]
            else:
                result_dic[segnr] += [match]

    return(result_dic)


@router.post("/numbers")
async def get_numbers_view(input: GeneralInput):
    """
    Endpoint for numbers view.
    """

    limitcollection_include = create_cleaned_limit_collection(
        input.limits.category_include + input.limits.file_include
    )
    limitcollection_exclude = create_cleaned_limit_collection(
        input.limits.category_exclude + input.limits.file_exclude
    )

    query_result = execute_query(
        main_queries.QUERY_NUMBERS_VIEW,
        bind_vars={
            "file_name": input.file_name,
            "score": input.score,
            "parlength": input.par_length,
            "limitcollection_include": limitcollection_include,
            "limitcollection_exclude": limitcollection_exclude,
            "page": input.page,
            "folio": input.folio,
        },
    )

    segments_result = create_numbers_view_data(query_result.result)

    return {"segments": segments_result}


@router.get("/collections/")
async def get_collections_for_numbers_view(
    file_name: str = Query(..., description="filename to be used")
):
    """
    Endpoint that returns list of collections for the given language
    """
    language = get_language_from_file_name(file_name)
    query_result = execute_query(
        main_queries.QUERY_COLLECTION_NAMES_PER_LANGUAGE,
        bind_vars = {"language": language},
    )
    return {"results": query_result}
