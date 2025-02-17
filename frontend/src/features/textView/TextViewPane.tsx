import React, {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { InfiniteLoadingSpinner } from "@components/common/LoadingSpinner";
import {
  EmptyPlaceholder,
  ListDivider,
  ListLoadingIndicator,
} from "@components/db/ListComponents";
import { TextSegment } from "@features/textView/TextSegment";
import { useTextViewPane } from "@features/textView/useTextViewPane";
import {
  findSegmentIndexInParallelsData,
  getTextViewColorScale,
} from "@features/textView/utils";
import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import {
  ParsedTextViewParallel,
  ParsedTextViewParallels,
} from "@utils/api/endpoints/text-view/text-parallels";
import debounce from "lodash/debounce";

export interface TextViewPaneProps {
  isRightPane: boolean;
  activeSegmentId: string;
  setActiveSegmentId: (id: string) => Promise<URLSearchParams>;
  activeSegmentIndex: number | null;
  setActiveSegmentIndex: (index: number) => Promise<URLSearchParams>;
}

const debounceEdgeReachedFunction =
  (callback: () => Promise<void>) => async (isReached: boolean) => {
    if (!isReached) return;
    const debouncedEdgeReachedFunction = debounce(
      async () => await callback(),
      1000,
      { leading: true },
    );
    await debouncedEdgeReachedFunction();
  };

export const TextViewPane = ({
  isRightPane,
  activeSegmentId,
  setActiveSegmentId,
  activeSegmentIndex,
  setActiveSegmentIndex,
}: TextViewPaneProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const wasDataJustAppended: RefObject<boolean> = useRef(false);

  const {
    // [TODO] add error handling
    // isError,
    // error,
    isFetching,
    allParallels,
    firstItemIndex,
    isFetchingPreviousPage,
    isFetchingNextPage,
    handleFetchingPreviousPage,
    handleFetchingNextPage,
    isLoading,
    clearActiveMatch,
  } = useTextViewPane({ activeSegment: activeSegmentId, isRightPane });

  // assign data to a ref to avoid re-running the effect when items are appended during endless loading.
  const allParallelsRef = useRef<ParsedTextViewParallels>(allParallels);

  useLayoutEffect(() => {
    allParallelsRef.current = allParallels;
  }, [allParallels]);

  const colorScale = useMemo(
    () => getTextViewColorScale(allParallels),
    [allParallels],
  );

  const scrollToActiveSegment = useCallback(() => {
    if (isLoading) return;
    const index = findSegmentIndexInParallelsData(
      allParallelsRef.current,
      activeSegmentId,
    );
    if (index === -1) return;
    virtuosoRef.current?.scrollToIndex({ index, align: "center" });
  }, [activeSegmentId, isLoading]);

  useEffect(() => {
    scrollToActiveSegment();

    // [workaround/hack] - it doesn't always consistently scroll to the activeSegment, even with this hack, but it helps
    setTimeout(() => scrollToActiveSegment(), 1000);
  }, [scrollToActiveSegment]);

  const handleStartReached = useCallback(async () => {
    wasDataJustAppended.current = true;
    await handleFetchingPreviousPage();
    // fixes issue with scrolling to segment automatically on endless scrolling
    setTimeout(() => (wasDataJustAppended.current = false));
  }, [handleFetchingPreviousPage]);

  const handleBottomReached = useCallback(async () => {
    wasDataJustAppended.current = true;
    await handleFetchingNextPage();
    // fixes issue with scrolling to segment automatically on endless scrolling
    setTimeout(() => (wasDataJustAppended.current = false));
  }, [handleFetchingNextPage]);

  const itemContent = useCallback(
    (index: number, dataSegment: ParsedTextViewParallel) => (
      <TextSegment
        data={dataSegment}
        colorScale={colorScale}
        activeSegmentId={activeSegmentId}
        setActiveSegmentId={setActiveSegmentId}
        activeSegmentIndex={activeSegmentIndex}
        setActiveSegmentIndex={setActiveSegmentIndex}
        clearActiveMatch={clearActiveMatch}
        isRightPane={isRightPane}
      />
    ),
    [
      activeSegmentId,
      activeSegmentIndex,
      clearActiveMatch,
      colorScale,
      isRightPane,
      setActiveSegmentId,
      setActiveSegmentIndex,
    ],
  );

  return (
    <Card sx={{ height: "100%" }}>
      <Box sx={{ height: "100%", py: 0, px: 2 }}>
        <Virtuoso<ParsedTextViewParallel>
          ref={virtuosoRef}
          firstItemIndex={firstItemIndex}
          increaseViewportBy={1000}
          skipAnimationFrameInResizeObserver={true}
          components={{
            Header: isFetchingPreviousPage ? ListLoadingIndicator : ListDivider,
            Footer: isFetchingNextPage ? ListLoadingIndicator : ListDivider,
            EmptyPlaceholder: isFetching
              ? InfiniteLoadingSpinner
              : EmptyPlaceholder,
          }}
          itemContent={itemContent}
          data={allParallels}
          atTopStateChange={debounceEdgeReachedFunction(handleStartReached)}
          atBottomStateChange={debounceEdgeReachedFunction(handleBottomReached)}
        />
      </Box>
    </Card>
  );
};
