import "allotment/dist/style.css";

import React, { useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import { activeSegmentMatchesAtom } from "@atoms";
import {
  EmptyPlaceholder,
  ListLoadingIndicator,
} from "@components/db/ListComponents";
import {
  useActiveSegmentParam,
  useRightPaneActiveSegmentParam,
} from "@components/hooks/params";
import { DEFAULT_PARAM_VALUES } from "@features/SidebarSuite/uiSettings/config";
import { TextViewRightPane } from "@features/textView/TextViewRightPane";
import { getTextViewColorScale } from "@features/textView/utils";
import { Paper } from "@mui/material";
import { ParsedTextViewParallels } from "@utils/api/endpoints/text-view/text-parallels";
import { Allotment } from "allotment";
import { useAtomValue } from "jotai/index";

import { TextSegment } from "./TextSegment";
import TextViewMiddleParallels from "./TextViewMiddleParallels";

interface Props {
  data: ParsedTextViewParallels;
  onEndReached: () => void;
  onStartReached: () => Promise<void>;
  firstItemIndex?: number;
  isFetchingPreviousPage?: boolean;
  isFetchingNextPage?: boolean;
}

// todo: check other elements in segmentText
export const TextView = ({
  data,
  onEndReached,
  onStartReached,
  firstItemIndex,
  isFetchingPreviousPage,
  isFetchingNextPage,
}: Props) => {
  const [activeSegmentId] = useActiveSegmentParam();
  const [rightPaneActiveSegmentId] = useRightPaneActiveSegmentParam();
  const activeSegmentMatches = useAtomValue(activeSegmentMatchesAtom);

  const shouldShowMiddlePane =
    activeSegmentId !== "none" && activeSegmentMatches.length > 0;

  const shouldShowRightPane =
    rightPaneActiveSegmentId !== DEFAULT_PARAM_VALUES.active_segment;

  const colorScale = useMemo(() => getTextViewColorScale(data), [data]);

  // make sure the selected segment is at the top when the page is opened
  const activeSegmentIndexInData = useMemo(() => {
    if (data.length <= 0) return 0;
    const index = data.findIndex(
      (element) => element.segmentNumber === activeSegmentId,
    );
    if (index === -1) return 0;
    return index;
  }, [data, activeSegmentId]);

  return (
    <Paper sx={{ flex: 1, py: 1, pl: 2, my: 1 }}>
      <Allotment>
        {/* Left pane - text (main view) */}
        <Allotment.Pane>
          <Virtuoso
            firstItemIndex={firstItemIndex}
            initialTopMostItemIndex={activeSegmentIndexInData}
            data={data.length > 0 ? data : undefined}
            startReached={onStartReached}
            endReached={onEndReached}
            totalCount={data.length}
            overscan={900} // pixel value
            increaseViewportBy={500} // solves empty content at start/end of list issue
            initialItemCount={5} // for SSR
            components={{
              Header: isFetchingPreviousPage ? ListLoadingIndicator : undefined,
              Footer: isFetchingNextPage ? ListLoadingIndicator : undefined,
              EmptyPlaceholder,
            }}
            itemContent={(_, dataSegment) => (
              <TextSegment data={dataSegment} colorScale={colorScale} />
            )}
          />
        </Allotment.Pane>

        {/* Middle pane - parallels for selected segment */}
        <Allotment.Pane visible={shouldShowMiddlePane}>
          <TextViewMiddleParallels />
        </Allotment.Pane>

        {/* Right Pane - shown after a parallel is selected in middle pane */}
        <Allotment.Pane visible={shouldShowRightPane}>
          <TextViewRightPane />
        </Allotment.Pane>
      </Allotment>
    </Paper>
  );
};

TextView.displayName = "TextView";
