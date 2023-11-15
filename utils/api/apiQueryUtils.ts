import { QueryClient } from "@tanstack/react-query";
import { DbApi } from "utils/api/dbApi";
import type { SourceLanguage } from "utils/constants";

export const queryCacheTimeDefaults = {
  // 1 hour
  staleTime: 60 * 60 * 1000,
  // 2 days
  gcTime: 2 * 24 * 60 * 60 * 1000,
};

export async function prefetchDefaultDbPageData(
  sourceLanguage: SourceLanguage,
): Promise<QueryClient> {
  const queryClient = new QueryClient({
    // https://www.codemzy.com/blog/react-query-cachetime-staletime
    defaultOptions: {
      queries: {
        ...queryCacheTimeDefaults,
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: DbApi.SidebarSourceTexts.makeQueryKey(sourceLanguage),
    queryFn: () => DbApi.SidebarSourceTexts.call(sourceLanguage),
  });

  return queryClient;
}

// TODO: confirm spect for multi_lingal query param. For discussion see: https://github.com/BuddhaNexus/buddhanexus-frontend-next/pull/90#discussion_r1375272080
export async function prefetchDbResultsPageData(
  sourceLanguage: SourceLanguage,
  fileName: string,
): Promise<QueryClient> {
  const queryClient = new QueryClient({
    // https://www.codemzy.com/blog/react-query-cachetime-staletime
    defaultOptions: {
      queries: {
        ...queryCacheTimeDefaults,
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: DbApi.SidebarSourceTexts.makeQueryKey(sourceLanguage),
    queryFn: () => DbApi.SidebarSourceTexts.call(sourceLanguage),
  });

  await queryClient.prefetchQuery({
    queryKey: DbApi.AvailableLanguagesData.makeQueryKey(fileName),
    queryFn: () => DbApi.AvailableLanguagesData.call(fileName),
  });

  return queryClient;
}