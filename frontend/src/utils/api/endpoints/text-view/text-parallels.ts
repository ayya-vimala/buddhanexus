import apiClient from "@api";
import { parseAPIRequestBody } from "@utils/api/apiQueryUtils";
import type { APIPostRequestBody, APIPostResponse } from "@utils/api/types";

function parseTextViewParallelsData(
  data: APIPostResponse<"/text-view/text-parallels/">,
) {
  return {
    page: data.page,
    totalPages: data.total_pages,
    items: data.items?.map(({ segnr, segtext }) => ({
      segmentNumber: segnr,
      segmentText: segtext.map(
        ({ text, highlightColor, matches, is_active_match }) => ({
          text,
          highlightColor,
          matches,
          isActiveMatch: is_active_match,
        }),
      ),
    })),
  };
}

export type ParsedTextViewParallelsData = ReturnType<
  typeof parseTextViewParallelsData
>;

export type ParsedTextViewParallels = ParsedTextViewParallelsData["items"];
export type ParsedTextViewParallel = ParsedTextViewParallelsData["items"][0];

export async function getTextViewParallelsData(
  body: APIPostRequestBody<"/text-view/text-parallels/">,
) {
  const { page = 0, ...params } = body;

  const { data } = await apiClient.POST("/text-view/text-parallels/", {
    body: {
      ...parseAPIRequestBody({ ...params, page }),
    },
  });

  if (!data) {
    throw new Error("[Parallels Data] no data returned");
  }

  return {
    data: parseTextViewParallelsData(data ?? []),
    pageNumber: page,
  };
}
