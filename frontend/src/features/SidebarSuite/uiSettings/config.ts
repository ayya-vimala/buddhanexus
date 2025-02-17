import { DbLanguage } from "@utils/api/types";
import { exhaustiveStringTuple } from "@utils/helpers";
import {
  AllUIComponentParamNames,
  APIRequestFilterName,
  DBSourceFilePageFilterUISettingName,
  DisplayUISettingName,
  SearchPageFilterUISettingName,
  SortMethod,
  UtilityUIOptionName,
} from "src/features/SidebarSuite/types";

export const allRequestFilters = exhaustiveStringTuple<APIRequestFilterName>()(
  "languages",
  "include_files",
  "exclude_files",
  "include_categories",
  "exclude_categories",
  "include_collections",
  "exclude_collections",
  "par_length",
  "score",
  "language",
);

// order sets appearance in sidebar
export const dbSourceFileRequestFilters =
  exhaustiveStringTuple<DBSourceFilePageFilterUISettingName>()(
    "score",
    "par_length",
    "exclude_sources",
    "include_sources",
    "languages",
  );

export const searchRequestFilters =
  exhaustiveStringTuple<SearchPageFilterUISettingName>()(
    "language",
    "exclude_sources",
    "include_sources",
  );

export const displayUISettings = exhaustiveStringTuple<DisplayUISettingName>()(
  "folio",
  "sort_method",
  "script",
  "showSegmentNrs",
);

export const sortMethods = exhaustiveStringTuple<SortMethod>()(
  "position",
  "quotedtext",
  "length",
  "length2",
);

export const utilityUISettings = exhaustiveStringTuple<UtilityUIOptionName>()(
  "download_data",
  "copyResultInfo",
  "emailResultInfo",
);

export const allUIComponentParamNames: AllUIComponentParamNames = {
  score: "score",
  par_length: "par_length",
  languages: "languages",
  exclude_categories: "exclude_categories",
  exclude_collections: "exclude_collections",
  exclude_files: "exclude_files",
  include_categories: "include_categories",
  include_collections: "include_collections",
  language: "language",
  include_files: "include_files",
  folio: "folio",
  sort_method: "sort_method",
  script: "script",
  showSegmentNrs: "showSegmentNrs",
  download_data: "download_data",
  copyResultInfo: "copyResultInfo",
  emailResultInfo: "emailResultInfo",
  active_segment: "active_segment",
  active_segment_index: "active_segment_index",
  right_pane_active_segment: "right_pane_active_segment",
  right_pane_active_segment_index: "right_pane_active_segment_index",
  page: "page",
  filename: "filename",
  parallel_ids: "parallel_ids",
  search_string: "search_string",
  segmentnr: "segmentnr",
  filters: "filters",
  collection: "collection",
  hit_collections: "hit_collections",
  active_match_id: "active_match_id",
  left_pane_active_match: "left_pane_active_match",
  right_pane_active_match: "right_pane_active_match",
};

export const DEFAULT_LANGUAGE = "all";

export const DEFAULT_PARAM_VALUES = {
  score: 30,
  par_length: {
    zh: 7,
    pa: 30,
    sa: 30,
    bo: 14,
    all: 25,
  },
  sort_method: "position",
  language: DEFAULT_LANGUAGE,
  active_segment: "none",
  active_match: "",
} as const;

export const MIN_PAR_LENGTH_VALUES: Record<DbLanguage, number> = {
  zh: 5,
  pa: 25,
  sa: 25,
  bo: 7,
};
