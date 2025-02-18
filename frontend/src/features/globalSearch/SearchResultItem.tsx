import React, { useCallback } from "react";
import { useTranslation } from "next-i18next";
import { DbLanguageChip } from "@components/common/DbLanguageChip";
import { Link } from "@components/common/Link";
import { createURLToSegment } from "@features/textView/utils";
import CopyIcon from "@mui/icons-material/ContentCopy";
import DifferenceIcon from "@mui/icons-material/Difference";
import { CardContent, Chip, Divider, IconButton, Tooltip } from "@mui/material";
import type { ParsedSearchResult } from "@utils/api/endpoints/search";

import {
  SearchResultCard,
  SearchResultHeaderChips,
  SearchResultHeaderTitleRow,
} from "./GlobalSearchStyledMuiComponents";
import { SearchResultItemText } from "./SearchResultItemText";

interface Props {
  result: ParsedSearchResult;
}

export const SearchResultItem = ({ result }: Props) => {
  const { t } = useTranslation();

  const {
    id,
    language,
    segmentNumber,
    displayName,
    similarity,
    matchTextParts,
  } = result;

  const copyTextInfoToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(`${segmentNumber}: ${displayName}`);
  }, [segmentNumber, displayName]);

  const roundedSimilarity =
    similarity % 1 === 0 ? similarity : similarity.toFixed(2);

  const urlToSegment = createURLToSegment({
    language,
    segmentNumber,
  });

  return (
    <SearchResultCard>
      <CardContent
        sx={{
          bgcolor: "background.card",
        }}
      >
        <SearchResultHeaderChips>
          <DbLanguageChip
            label={t(`language.${language}`)}
            language={language}
          />

          <Tooltip
            title={`Similarity: ${roundedSimilarity}/100`}
            PopperProps={{ disablePortal: true }}
          >
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              icon={<DifferenceIcon />}
              label={roundedSimilarity}
              sx={{ mr: 0.5, my: 0.5, p: 0.5 }}
            />
          </Tooltip>
        </SearchResultHeaderChips>

        <SearchResultHeaderTitleRow>
          <Tooltip title={displayName} PopperProps={{ disablePortal: true }}>
            <Link
              href={urlToSegment}
              sx={{
                display: "inline-block",
                wordBreak: "break-word",
                m: 0.5,
              }}
            >
              {segmentNumber}
            </Link>
          </Tooltip>

          <IconButton
            aria-label="copy"
            size="small"
            onClick={copyTextInfoToClipboard}
          >
            <CopyIcon fontSize="inherit" />
          </IconButton>
        </SearchResultHeaderTitleRow>
      </CardContent>

      <Divider />

      <CardContent>
        <SearchResultItemText
          id={id}
          textParts={matchTextParts}
          language={language}
        />
      </CardContent>
    </SearchResultCard>
  );
};
