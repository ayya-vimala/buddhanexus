import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStandardViewBaseQueryParams } from "@components/hooks/groupedQueryParams";
import {
  useLeftPaneActiveMatchParam,
  useRightPaneActiveMatchParam,
} from "@components/hooks/params";
import { useDbRouterParams } from "@components/hooks/useDbRouterParams";
import { useSetDbViewFromPath } from "@components/hooks/useDbView";
import { DEFAULT_PARAM_VALUES } from "@features/SidebarSuite/uiSettings/config";
import { PaginationState } from "@features/textView/utils";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { DbApi } from "@utils/api/dbApi";
import { ParsedTextViewParallels } from "@utils/api/endpoints/text-view/text-parallels";

// arbitrarily high number, as per virtuoso docs
const START_INDEX = 1_000_000;

interface UseTextPageReturn {
  allParallels: ParsedTextViewParallels;
  firstItemIndex: number;
  handleFetchingNextPage: () => Promise<void>;
  handleFetchingPreviousPage: () => Promise<void>;
  clearActiveMatch: () => Promise<void>;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  error: Error | null;
}

interface Props {
  activeSegment: string;
  isRightPane?: boolean;
}

export function useTextViewPane({
  activeSegment,
  isRightPane,
}: Props): UseTextPageReturn {
  useSetDbViewFromPath();
  const requestBodyBase = useStandardViewBaseQueryParams();

  const { fileName: fileNameUrlParam } = useDbRouterParams();
  const [leftPaneActiveMatchId, setLeftPaneActiveMatchId] =
    useLeftPaneActiveMatchParam();
  const [rightPaneActiveMatchId, setRightPaneActiveMatchId] =
    useRightPaneActiveMatchParam();

  const [fileNameFromActiveSegment] = activeSegment.split(":");

  const fileName = fileNameFromActiveSegment ?? fileNameUrlParam;
  const previousFileName = useRef(fileName);

  const initialPageParam =
    activeSegment === DEFAULT_PARAM_VALUES.active_segment ? 0 : undefined;

  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);

  const previouslySelectedSegmentsMap = useRef<Record<string, boolean>>({});
  const paginationState = useRef<PaginationState>([0, 0]);

  const hasSegmentBeenSelected = useCallback(
    (segmentId: string): boolean =>
      segmentId !== DEFAULT_PARAM_VALUES.active_segment &&
      Boolean(previouslySelectedSegmentsMap.current[segmentId]),
    [],
  );

  // in the right pane, everything is only filtered by active file
  const requestFilters = isRightPane
    ? { ...requestBodyBase.filters, include_files: [fileNameUrlParam] }
    : requestBodyBase.filters;

  const {
    data,
    isSuccess,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    isLoading,
    isFetchedAfterMount,
  } = useInfiniteQuery({
    enabled: Boolean(fileName),
    // when within the same file, keep previous data. Otherwise, discard it when user switches to new file.
    placeholderData:
      fileName === previousFileName.current ? keepPreviousData : undefined,
    initialPageParam,
    queryKey: DbApi.TextView.makeQueryKey({
      ...requestBodyBase,
      active_segment: activeSegment,
      filters: requestFilters,
    }),
    queryFn: async ({ pageParam }) => {
      // We pass the active_segment, but only on the first page load :/
      //
      // This is a bit of a workaround to enable scrolling up. Explanation:
      // When `active_segment` is inside a query param, the BE always responds with the page that includes the segment.
      // We pass it to the backend, and we assume the page is 0. In the BE response, it tells us that we're on page 1,
      // but there's no way to request page 0 when `active_segment` is included.
      //
      // A possible issue with this workaround is that it only runs on the client side.
      // We may need to revisit after moving to the Next.js App Router

      // if the `active_segment` param was already sent for this segment,
      // don't send it anymore. This is how the BE works with pagination, otherwise it will start from page 0 again.
      const hasActiveSegmentBeenSelected =
        hasSegmentBeenSelected(activeSegment);

      const activeSegmentParam = hasActiveSegmentBeenSelected
        ? DEFAULT_PARAM_VALUES.active_segment
        : activeSegment;

      let activeMatchIdParam: string;
      if (hasActiveSegmentBeenSelected) {
        activeMatchIdParam = DEFAULT_PARAM_VALUES.active_match;
      } else {
        activeMatchIdParam = isRightPane
          ? rightPaneActiveMatchId
          : leftPaneActiveMatchId;
      }

      return DbApi.TextView.call({
        ...requestBodyBase,
        page: pageParam ?? 0,
        filename:
          fileNameFromActiveSegment === "none"
            ? fileNameUrlParam
            : (fileNameFromActiveSegment ?? ""),
        active_segment: activeSegmentParam,
        active_match_id: activeMatchIdParam,

        filters: requestFilters,
      });
    },

    getPreviousPageParam: () => {
      // if it's the first page, don't fetch more
      const [startEdge] = paginationState.current;
      if (startEdge === undefined || startEdge === 0) return undefined;
      return startEdge - 1;
    },

    getNextPageParam: (lastPage) => {
      const [, endEdge] = paginationState.current;
      if (endEdge === undefined || endEdge === lastPage.data.totalPages - 1) {
        // last page, as indicated by the BE response
        return undefined;
      }
      return endEdge + 1;
    },
  });

  useEffect(() => {
    if (isFetchedAfterMount) {
      previousFileName.current = fileName;
    }
  }, [fileName, isFetchedAfterMount]);

  // see queryFn comment above
  useEffect(
    function updatePreviouslySelectedSegmentsMap() {
      if (isSuccess && activeSegment)
        previouslySelectedSegmentsMap.current[activeSegment] = true;
    },
    [isSuccess, activeSegment],
  );

  useEffect(
    function handleApiResponse() {
      if (!data?.pages[0]) {
        return;
      }
      const currentPageCount = data?.pages?.length;
      // when the first page is loaded, set the current page number to the one received from the BE
      if (currentPageCount === 1) {
        paginationState.current[0] = data?.pages[0].data.page;
        paginationState.current[1] = data?.pages[0].data.page;
      }
    },
    [data?.pages],
  );

  const handleFetchingPreviousPage = useCallback(async () => {
    // already on first page
    if (paginationState.current[0] === 0) return;

    const { data: responseData } = await fetchPreviousPage();

    paginationState.current = [
      responseData?.pages[0]?.data.page,
      paginationState.current[1],
    ];

    const fetchedPageSize = responseData?.pages[0]?.data.items?.length;
    if (!fetchedPageSize) return;

    // the user is scrolling up.
    // offset the new list items when prepending them to the page.
    setFirstItemIndex((prevState) => prevState - fetchedPageSize);
  }, [fetchPreviousPage]);

  const handleFetchingNextPage = useCallback(async () => {
    const response = await fetchNextPage();
    paginationState.current[1] = response.data?.pages.at(-1)?.data.page;
  }, [fetchNextPage]);

  const allParallels = useMemo(
    () => (data?.pages ? data.pages.flatMap((page) => page.data.items) : []),
    [data?.pages],
  );

  const clearActiveMatch = useCallback(async () => {
    if (isRightPane) {
      await setRightPaneActiveMatchId(DEFAULT_PARAM_VALUES.active_match);
    } else {
      await setLeftPaneActiveMatchId(DEFAULT_PARAM_VALUES.active_match);
    }
  }, [isRightPane, setLeftPaneActiveMatchId, setRightPaneActiveMatchId]);

  return {
    allParallels,
    firstItemIndex,
    handleFetchingNextPage,
    handleFetchingPreviousPage,
    clearActiveMatch,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    error,
  };
}
