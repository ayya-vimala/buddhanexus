import type { components } from "codegen/api/v2.d.ts";

// TODO: most endpoint query functions have a `if undefined` check, this is to match a temp fix for BE data issues. The check should be cleared onee Pali data is updated on the BE.

/** TODO: hit list
 * InfiniteFilePropApiQuery,
 * parseDbPageQueryParams
 */

/**
 * *********** !!! ***********
 * CODEGEN DERIVATE TYPES ONLY
 * Requests & responses mirror `operations` interface
 * from `codegen/api/v2.d.ts`
 * Sub-components taken directly from `components` interface
 * ************************** ¡¡¡ **************************
 */

export type APISchemas = components["schemas"];

/** COMMON */

export type Limits = APISchemas["Limits"];
export type FullText = APISchemas["FullText"];

/** SEARCH */

export type APISearchRequestBody = APISchemas["SearchInput"];
export type APISearchResponseData = APISchemas["SearchOutput"];

/** NUMBERS VIEW */

export type NumbersParallel = APISchemas["Parallel"];
export type NumbersSegment =
  APISchemas["api__endpoints__models__numbers_view_models__Segment"];

export type APINumbersViewRequestBody = APISchemas["GeneralInput"];
export type APINumbersViewResponseData =
  components["schemas"]["NumbersViewOutput"];

/** MENUS */

export type APIMenuData = components["schemas"]["MenuOutput"];
