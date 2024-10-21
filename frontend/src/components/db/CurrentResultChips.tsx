import React from "react";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import ParallelsChip from "@components/db/ParallelsChip";
import SearchMatchesChip from "@components/db/SearchMatchesChip";
import {
  DBSourceFilePageFilterUISettingName,
  DisplayUISettingName,
  SearchPageFilterUISettingName,
} from "@features/SidebarSuite/types";
import {
  dbSoureFileRequestFilters,
  displayUISettings,
  searchRequestFilters,
} from "@features/SidebarSuite/uiSettings/config";
import Chip from "@mui/material/Chip";

const searchFilterSet = new Set(searchRequestFilters);
const dbSourceFileFilterSet = new Set(dbSoureFileRequestFilters);
const displayParamSet = new Set(displayUISettings);

function getSettingCounts({
  route,
  searchParams,
}: {
  route: "search" | "dbSourcePage";
  searchParams: ReadonlyURLSearchParams;
}) {
  let display = 0;
  let filter = 0;
  let isExcludeSet = false;
  let isIncludeSet = false;

  const params = Object.fromEntries(searchParams.entries());

  for (const key of Object.keys(params)) {
    if (key.startsWith("exclude_") && !isExcludeSet) {
      filter += 1;
      isExcludeSet = true;
      continue;
    }

    if (key.startsWith("include_") && !isIncludeSet) {
      filter += 1;
      isIncludeSet = true;
      continue;
    }

    if (
      route === "search" &&
      searchFilterSet.has(key as SearchPageFilterUISettingName)
    ) {
      filter += 1;
      continue;
    }

    if (
      route === "dbSourcePage" &&
      displayParamSet.has(key as DisplayUISettingName)
    ) {
      display += 1;
      continue;
    }

    if (
      route === "dbSourcePage" &&
      dbSourceFileFilterSet.has(key as DBSourceFilePageFilterUISettingName)
    ) {
      filter += 1;
    }
  }

  return { display, filter };
}

export default function CurrentResultChips({
  matches = 0,
}: {
  matches?: number;
}) {
  const router = useRouter();
  const { t } = useTranslation("settings");

  const isSearchRoute = router.route.startsWith("/search");
  const searchParams = useSearchParams();

  const count = React.useMemo(
    () =>
      getSettingCounts({
        route: isSearchRoute ? "search" : "dbSourcePage",
        searchParams,
      }),
    [isSearchRoute, searchParams],
  );

  return (
    <>
      {isSearchRoute ? (
        <SearchMatchesChip matches={matches} isSearchRoute />
      ) : (
        <ParallelsChip />
      )}

      {count.filter > 0 && (
        <Chip
          size="small"
          label={t("resultsHead.filters", { value: count.filter })}
          sx={{ mx: 0.5, p: 0.5 }}
        />
      )}
      {count.display > 0 && (
        <Chip
          size="small"
          label={t("resultsHead.options", { value: count.display })}
          sx={{ mx: 0.5, p: 0.5 }}
        />
      )}
    </>
  );
}
