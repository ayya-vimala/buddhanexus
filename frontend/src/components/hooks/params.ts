import {
  allUIComponentParamNames,
  DEFAULT_LANGUAGE,
  DEFAULT_PARAM_VALUES,
  sortMethods,
} from "@features/SidebarSuite/uiSettings/config";
import { dbLanguages } from "@utils/api/constants";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";

import { useNullableDbRouterParams } from "./useDbRouterParams";

export const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value ?? undefined;
};

export const useScoreParam = () => {
  return useQueryState(allUIComponentParamNames.score, {
    ...parseAsInteger.withDefault(DEFAULT_PARAM_VALUES.score),
  });
};

export const useParLengthParam = () => {
  const { dbLanguage } = useNullableDbRouterParams();
  return useQueryState(allUIComponentParamNames.par_length, {
    ...parseAsInteger.withDefault(
      DEFAULT_PARAM_VALUES.par_length[dbLanguage ?? DEFAULT_LANGUAGE],
    ),
  });
};

export const useExcludeCollectionsParam = () => {
  return useQueryState(allUIComponentParamNames.exclude_collections, {
    ...parseAsArrayOf(parseAsString).withDefault([]),
  });
};

export const useExcludeCategoriesParam = () => {
  return useQueryState(allUIComponentParamNames.exclude_categories, {
    ...parseAsArrayOf(parseAsString).withDefault([]),
  });
};

export const useExcludeFilesParam = () => {
  return useQueryState(allUIComponentParamNames.exclude_files, {
    ...parseAsArrayOf(parseAsString).withDefault([]),
  });
};

export const useIncludeCollectionsParam = () => {
  return useQueryState(allUIComponentParamNames.include_collections, {
    ...parseAsArrayOf(parseAsString).withDefault([]),
  });
};

export const useIncludeCategoriesParam = () => {
  return useQueryState(allUIComponentParamNames.include_categories, {
    ...parseAsArrayOf(parseAsString).withDefault([]),
  });
};

export const useIncludeFilesParam = () => {
  return useQueryState(allUIComponentParamNames.include_files, {
    ...parseAsArrayOf(parseAsString).withDefault([]),
  });
};

const parseAsDbLanguage = parseAsStringLiteral([
  ...dbLanguages,
  DEFAULT_LANGUAGE,
]);

export const useLanguageParam = () => {
  return useQueryState(allUIComponentParamNames.language, {
    ...parseAsDbLanguage.withDefault(DEFAULT_PARAM_VALUES.language),
  });
};

export const useLanguagesParam = () => {
  return useQueryState(allUIComponentParamNames.languages, {
    ...parseAsArrayOf(parseAsDbLanguage).withDefault([DEFAULT_LANGUAGE]),
  });
};

export const useActiveSegmentParam = () => {
  return useQueryState(allUIComponentParamNames.active_segment, {
    ...parseAsString.withDefault(DEFAULT_PARAM_VALUES.active_segment),
    history: "push",
  });
};

export const useActiveSegmentIndexParam = () => {
  return useQueryState(
    allUIComponentParamNames.active_segment_index,
    parseAsInteger,
  );
};

export const useRightPaneActiveSegmentParam = () => {
  return useQueryState(allUIComponentParamNames.right_pane_active_segment, {
    ...parseAsString.withDefault(DEFAULT_PARAM_VALUES.active_segment),
    history: "push",
  });
};

export const useRightPaneActiveSegmentIndexParam = () => {
  return useQueryState(
    allUIComponentParamNames.right_pane_active_segment_index,
    parseAsInteger,
  );
};

export const useLeftPaneActiveMatchParam = () => {
  return useQueryState(
    allUIComponentParamNames.active_match_id,
    parseAsString.withDefault(DEFAULT_PARAM_VALUES.active_match),
  );
};

export const useRightPaneActiveMatchParam = () => {
  return useQueryState(
    allUIComponentParamNames.right_pane_active_match,
    parseAsString.withDefault(DEFAULT_PARAM_VALUES.active_match),
  );
};

const parseAsSortMethod = parseAsStringLiteral(sortMethods);

export const useSortMethodParam = () => {
  return useQueryState(allUIComponentParamNames.sort_method, {
    ...parseAsSortMethod.withDefault(DEFAULT_PARAM_VALUES.sort_method),
  });
};

export const useFolioParam = () => {
  return useQueryState(allUIComponentParamNames.folio, {
    ...parseAsString,
  });
};

export const useSearchStringParam = () => {
  return useQueryState(allUIComponentParamNames.search_string, {
    ...parseAsString.withDefault(""),
    history: "push",
  });
};

// for visual view
export const useVisualCollectionStringParam = () => {
  return useQueryState(allUIComponentParamNames.collection, {
    ...parseAsString.withDefault(""),
    history: "push",
  });
};
export const useVisualHitCollectionsStringParam = () => {
  return useQueryState(allUIComponentParamNames.hit_collections, {
    ...parseAsArrayOf(parseAsString).withDefault([]),
    history: "push",
  });
};
