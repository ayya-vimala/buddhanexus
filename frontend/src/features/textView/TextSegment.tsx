import { useCallback, useLayoutEffect, useMemo } from "react";
import {
  activeSegmentMatchesAtom,
  hoveredOverParallelIdAtom,
  scriptSelectionAtom,
  shouldShowSegmentNumbersAtom,
  shouldUseMonochromaticSegmentColorsAtom,
  textViewIsMiddlePanePointingLeftAtom,
} from "@atoms";
import { useDbRouterParams } from "@components/hooks/useDbRouterParams";
import { sourceSans } from "@components/theme";
import { enscriptText } from "@features/SidebarSuite/utils";
import { TextViewPaneProps } from "@features/textView/TextViewPane";
import { useColorScheme } from "@mui/material/styles";
import { ParsedTextViewParallel } from "@utils/api/endpoints/text-view/text-parallels";
import type { Scale } from "chroma-js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { OLD_WEBSITE_SEGMENT_COLORS } from "./constants";
import styles from "./textSegment.module.scss";

export const TextSegment = ({
  isRightPane,
  data,
  colorScale,
  activeSegmentId,
  activeSegmentIndex,
  setActiveSegmentId,
  setActiveSegmentIndex,
}: {
  data?: ParsedTextViewParallel;
  colorScale: Scale;
  activeSegmentId: string;
} & TextViewPaneProps) => {
  const { mode } = useColorScheme();
  const isDarkTheme = mode === "dark";

  const { dbLanguage } = useDbRouterParams();

  const shouldUseMonochromaticSegmentColors = useAtomValue(
    shouldUseMonochromaticSegmentColorsAtom,
  );
  const shouldShowSegmentNumbers = useAtomValue(shouldShowSegmentNumbersAtom);
  const hoveredOverParallelId = useAtomValue(hoveredOverParallelIdAtom);
  const setSelectedSegmentMatches = useSetAtom(activeSegmentMatchesAtom);
  const isSegmentSelected = activeSegmentId === data?.segmentNumber;

  const [isMiddlePanePointingLeft, setIsMiddlePanePointingLeft] = useAtom(
    textViewIsMiddlePanePointingLeftAtom,
  );

  const scriptSelection = useAtomValue(scriptSelectionAtom);

  const updateSelectedLocationInGlobalState = useCallback(
    async (location: { id: string; index: number; matches: string[] }) => {
      setIsMiddlePanePointingLeft(isRightPane);
      await Promise.all([
        // todo: update what happens when a segment is clicked
        setActiveSegmentId(location.id),
        setActiveSegmentIndex(location.index),
      ]);
    },
    [
      isRightPane,
      setActiveSegmentId,
      setActiveSegmentIndex,
      setIsMiddlePanePointingLeft,
    ],
  );

  // find matches for the selected segment when the page is first rendered
  useLayoutEffect(
    function openMiddlePaneWithMatches() {
      if (!isSegmentSelected || typeof activeSegmentIndex !== "number") return;
      const segmentInData = data?.segmentText[activeSegmentIndex];
      if (!segmentInData) return;
      if (isRightPane && isMiddlePanePointingLeft) {
        setSelectedSegmentMatches(segmentInData.matches);
      } else if (!isRightPane && !isMiddlePanePointingLeft) {
        setSelectedSegmentMatches(segmentInData.matches);
      }
    },
    [
      isSegmentSelected,
      data?.segmentText,
      activeSegmentId,
      activeSegmentIndex,
      setSelectedSegmentMatches,
      isRightPane,
      isMiddlePanePointingLeft,
    ],
  );

  const matchSets = useMemo(() => {
    // optimisation - don't run the map function if there are no active segments (middle view is closed)
    if (activeSegmentId === "none") return undefined;
    return data?.segmentText.map((textChunk) => new Set(textChunk.matches));
  }, [activeSegmentId, data?.segmentText]);

  if (!data) return null;

  // segnr also contains the file name - we need to strip it away
  const [fileName, segmentNumber] = data.segmentNumber.split(":");

  return (
    <div className={styles.segmentWrapper}>
      <a
        className={`${styles.segmentNumber} ${
          isSegmentSelected && styles["segmentNumber--selected"]
        } ${!shouldShowSegmentNumbers && styles["segmentNumber--hidden"]}`}
        data-segmentnumber={segmentNumber}
        href={`/db/${dbLanguage}/${fileName}/text?active_segment=${data.segmentNumber}`}
        target="_blank"
        rel="noreferrer noopenner"
      />

      {data.segmentText.map(({ text, highlightColor, matches }, i) => {
        const segmentKey = segmentNumber ? segmentNumber + i : undefined;
        const textContent = enscriptText({
          text,
          script: scriptSelection,
          language: dbLanguage,
        });

        // [hack/workaround]: in the right pane, we don't know the correct segment index
        // because it is opened by clicking a parallel in the middle view. We highlight the whole segment instead.
        const isSegmentPartSelected =
          isSegmentSelected &&
          (activeSegmentIndex === null ||
            activeSegmentIndex === i ||
            activeSegmentIndex > data.segmentText.length);

        const isSegmentPartHoveredOverInMiddleView = matchSets
          ? matchSets[i]?.has(hoveredOverParallelId)
          : false;

        const segmentClassName = `${styles.segment} ${
          isDarkTheme && styles["segment--dark"]
        } ${isSegmentPartSelected && styles["segment--selected"]} ${isSegmentPartHoveredOverInMiddleView && styles["segment--parallel-hovered"]}`;

        if (matches.length === 0) {
          return (
            <span
              key={segmentKey}
              className={`${segmentClassName} ${styles["segment--noMatches"]}`}
            >
              {textContent}
            </span>
          );
        }

        const color: string = shouldUseMonochromaticSegmentColors
          ? colorScale(highlightColor).hex()
          : (OLD_WEBSITE_SEGMENT_COLORS[highlightColor] ??
            OLD_WEBSITE_SEGMENT_COLORS.at(-1) ??
            "");

        return (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <span
            key={segmentKey}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className={`${segmentClassName} ${styles.segment__button}`}
            style={{
              fontFamily: sourceSans.style.fontFamily,
              color,
            }}
            onClick={async () => {
              await updateSelectedLocationInGlobalState({
                id: data.segmentNumber,
                matches,
                index: i,
              });
            }}
            onKeyDown={async (event) => {
              // allow selecting the segments by pressing space or enter
              if (event.key !== " " && event.key !== "Enter") return;
              event.preventDefault();
              await updateSelectedLocationInGlobalState({
                id: data.segmentNumber,
                matches,
                index: i,
              });
            }}
          >
            {textContent}
          </span>
        );
      })}
    </div>
  );
};
