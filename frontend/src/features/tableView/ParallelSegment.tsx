import React, { useCallback, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { textViewRightPaneFileNameAtom } from "@atoms";
import { DbLanguageChip } from "@components/common/DbLanguageChip";
import { Link } from "@components/common/Link";
import { useRightPaneActiveSegmentParam } from "@components/hooks/params";
import { createURLToSegment } from "@features/textView/utils";
import CopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PercentIcon from "@mui/icons-material/Percent";
import StraightenIcon from "@mui/icons-material/Straighten";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import type { APISchemas } from "@utils/api/types";
import { DbLanguage } from "@utils/api/types";
import { useSetAtom } from "jotai";

import { ParallelSegmentText } from "./ParallelSegmentText";

interface ParallelSegmentProps {
  id?: string;
  language: DbLanguage;
  displayName: string;
  length: number;
  isRowItem?: boolean;

  text: APISchemas["FullText"][];
  textSegmentNumber: string;
  textSegmentNumberRange: string;
  // component becomes active when this match is selected
  segmentIdToMatch?: string;

  score?: number;
  onHover?: (parallelId: string) => void;
  onClick?: (parallelId: string, textSegmentNumber: string) => void;
}

export const ParallelSegment = ({
  id,
  textSegmentNumber,
  textSegmentNumberRange,
  text,
  score,
  length,
  isRowItem,
  displayName,
  language,
  onHover,
  segmentIdToMatch,
  onClick,
}: ParallelSegmentProps) => {
  const { t } = useTranslation();

  const isActive = segmentIdToMatch === textSegmentNumber;
  const dbLanguageName = t(`language.${language}`);
  const infoToCopy = `${textSegmentNumberRange}: ${displayName}`;

  // Example of copied data: dn1:1.1.1_0–1.1.2_0: Brahmajāla Sutta
  const copyTextInfoToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(infoToCopy);
  }, [infoToCopy]);

  const urlToSegment = createURLToSegment({
    language,
    segmentNumber: textSegmentNumber,
  });

  // [warning] breaking separation of concerns a bit, since this data is only available here atm.
  // Only for the text view. Update the right pane title.
  const [rightPaneActiveSegmentId] = useRightPaneActiveSegmentParam();
  const setRightPaneFileName = useSetAtom(textViewRightPaneFileNameAtom);
  useEffect(
    function updateRightPaneFileName() {
      if (!segmentIdToMatch) return;
      if (rightPaneActiveSegmentId === textSegmentNumber) {
        setRightPaneFileName(displayName);
      }
    },
    [
      displayName,
      rightPaneActiveSegmentId,
      segmentIdToMatch,
      setRightPaneFileName,
      textSegmentNumber,
    ],
  );

  // the box component exists to improve hover actions (visual flash when hovering through parallel cards)
  return (
    <Box
      sx={{
        py: 1,
        maxWidth: isRowItem ? { xs: "100%", lg: "48%" } : undefined,
        width: "100%",
      }}
      onMouseEnter={() => id && onHover?.(id)}
      onMouseLeave={() => onHover?.("")}
    >
      <Card
        sx={{ flex: 1, wordBreak: "break-all" }}
        elevation={isActive ? 6 : 1}
      >
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            bgcolor: isActive ? "background.default" : "background.card",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap" }}>
            {/* Language name */}
            <DbLanguageChip label={dbLanguageName} language={language} />

            {/* File Name */}
            <Tooltip title={displayName} PopperProps={{ disablePortal: true }}>
              <Link
                href={urlToSegment}
                sx={{
                  display: "inline-block",
                  wordBreak: "break-word",
                  m: 0.5,
                }}
              >
                {textSegmentNumberRange}
              </Link>
            </Tooltip>
            <IconButton
              aria-label="copy"
              size="small"
              onClick={copyTextInfoToClipboard}
            >
              <CopyIcon fontSize="inherit" />
            </IconButton>

            <IconButton
              aria-label="Open in new tab"
              size="small"
              onClick={() => window.open(urlToSegment, "_blank")}
            >
              <OpenInNewIcon fontSize="inherit" />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: { xs: "start", sm: "end" },
              alignItems: "center",
            }}
          >
            {score && (
              <Tooltip
                title={`${t("db.score")}: ${Math.round(score * 100) / 100}`}
                PopperProps={{ disablePortal: true }}
              >
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<PercentIcon />}
                  label={score}
                  sx={{ m: 0.5, p: 0.5 }}
                />
              </Tooltip>
            )}

            <Tooltip
              title={`${t("db.length")}: ${length}`}
              PopperProps={{ disablePortal: true }}
            >
              <Chip
                size="small"
                label={length}
                icon={<StraightenIcon />}
                sx={{ m: 0.5, p: 0.5 }}
              />
            </Tooltip>
          </Box>
        </CardContent>

        <Divider />

        <CardContent onClick={() => id && onClick?.(id, textSegmentNumber)}>
          <ParallelSegmentText text={text} />
        </CardContent>
      </Card>
    </Box>
  );
};
