from pydantic import BaseModel
from typing import List, Union, Optional
from .general_models import Limits, FullText


class TextParallelsInput(BaseModel):
    file_name: str = ""
    active_segment: str = "none"
    score: int = 0
    par_length: int = 0
    limits: Optional[Limits]
    multi_lingual: list = []


class FullMatchText(FullText):
    matches: list = []


class TextItem(BaseModel):
    segnr: str
    segtext: List[FullMatchText]


class TextViewLeftOutput(BaseModel):
    __root__: List[TextItem]


class TextViewMiddleInput(BaseModel):
    parallel_ids: list


"""
The middle view has a problem with null integers being returned
for Pali as long as the wrong dataset still exists.
par_offset_beg and par_offset_end can be removed as soon as this is better.
par_fulltext can then be made un-optional
"""


class Segment(BaseModel):
    par_segnr: list
    display_name: Union[str, None] = None
    tgt_lang: str
    par_offset_beg: Optional[int]
    par_offset_end: Optional[int]
    par_segtext: list = []
    file_name: str
    score: int
    length: int
    par_fulltext: Optional[List[FullText]]


class TextViewMiddleOutput(BaseModel):
    __root__: List[Segment]