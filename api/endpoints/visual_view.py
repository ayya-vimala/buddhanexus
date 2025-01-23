from fastapi import APIRouter
from .endpoint_utils import execute_query
from ..queries import visual_view_queries
from typing import Any
from .models.visual_view_models import *
from ..cache_config import cached_endpoint, CACHE_TIMES
from ..utils import test_collection

router = APIRouter()


@router.post("/visual-view/", response_model=VisualViewOutput)
@cached_endpoint(expire=CACHE_TIMES["LONG"])
async def get_visual_graph_data(input: VisualViewInput) -> Any:
    """
    Endpoint for visual view.

    **Input is:**

    *inquiry*: A string with the required inquiry collection ("Suttas-Early-1"), category ("dn") or file ("PA_dn_1")
               (only one possibility)

    *hit*: And array with the required hit collection(s) and/or category(ies) ["Suttas-Early-1","Vinaya", "an", "mn"]

    *language*: pa, sa, bo or zh

    **Output is f.i.:**

    ```
    {
        "totalpages": 4,
        "graphdata": [
                [
                  "Khuddakapāṭha (kp)",
                  "Dīghanikāya_(dn)",
                  1094
                ],
                [
                  "Khuddakapāṭha (kp)",
                  "Majjhimanikāya_(mn)"
                  5042
                ],

                ...

                ]
              ]
    }
    ```

    Note that if a collection or file is selected, the total number of pages is always 1.

    """

    if test_collection(input.inquiry):
        query_visual_result = execute_query(
            visual_view_queries.QUERY_VISUAL_COLLECTION_VIEW,
            bind_vars={
                "inquiry_collection": input.inquiry,
                "hit_collection": input.hit,
                "lang": input.language,
            },
        )

    else:
        query_visual_result = execute_query(
            visual_view_queries.QUERY_VISUAL_CATEGORY_VIEW,
            bind_vars={
                "inquiry_collection": input.inquiry,
                "hit_collection": input.hit,
                "lang": input.language,
                "page": input.page,
            },
        )

    return query_visual_result.result[0]
