import React, { useRef } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import {
  type InputKeyDown,
  useGlobalSearch,
} from "@components/hooks/useGlobalSearch";
import { useSettingsDrawer } from "@components/hooks/useSettingsDrawer";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";

import {
  SearchBoxInput,
  SearchBoxWrapper,
} from "./GlobalSearchStyledMuiComponents";

const GlobalSearchMobile = () => {
  const router = useRouter();
  const { t } = useTranslation("settings");
  const inputRef = useRef<HTMLInputElement>(null);

  const isHomePage = router.asPath === "/";
  const isQueryPage = /^\/(search|db.{6,})/.test(router.asPath);
  const { handleOnSearch } = useGlobalSearch();

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isEmpty = inputRef.current?.value === "";

  const { mainWidth } = useSettingsDrawer();

  const boxSx = isQueryPage
    ? { width: { xs: 1, md: mainWidth }, px: { xs: 0, sm: 1, lg: 0 } }
    : {
        width: { xs: 1, md: 1 },
        ...(!isHomePage && {
          background: { xs: grey[200], sm: "transparent" },
        }),
      };

  // linked to components/layout/PageContainer.tsx
  const mdContainerSx = {
    px: { xs: 4, sm: 1, md: 2 },
    pb: { xs: 4, sm: 0 },
  };

  return (
    <Box
      sx={{
        px: { xs: 0, sm: 1, lg: 0 },
        ...boxSx,
      }}
    >
      <Container
        maxWidth={isQueryPage ? "xl" : "md"}
        sx={{
          display: { lg: "none" },
          width: 1,
          mt: 4,
          ...(!isHomePage && !isQueryPage && mdContainerSx),
        }}
      >
        <Box position="relative">
          <SearchBoxWrapper>
            <SearchBoxInput
              inputRef={inputRef}
              placeholder={t("search.placeholder")}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <IconButton
                    onClick={() =>
                      handleOnSearch(inputRef.current?.value ?? "")
                    }
                  >
                    <SearchIcon fontSize="inherit" />
                  </IconButton>
                ),
                endAdornment: !isEmpty && (
                  <IconButton onClick={handleClear}>
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                ),
              }}
              fullWidth
              onKeyDown={(e: InputKeyDown) =>
                handleOnSearch(inputRef.current?.value ?? "", e)
              }
            />
          </SearchBoxWrapper>
        </Box>
      </Container>
    </Box>
  );
};

export default GlobalSearchMobile;
