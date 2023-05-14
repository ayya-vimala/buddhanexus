import React from "react";
import type { GetStaticProps } from "next";
import { DbResultsPageHead } from "@components/db/DbResultsPageHead";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { useDbView } from "@components/hooks/useDbView";
import { useSourceFile } from "@components/hooks/useSourceFile";
import { PageContainer } from "@components/layout/PageContainer";
import { CircularProgress } from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SourceTextBrowserDrawer } from "features/sourceTextBrowserDrawer/sourceTextBrowserDrawer";
import TableView from "features/tableView/TableView";
import type { PagedResponse } from "types/api/common";
import type { TablePageData } from "types/api/table";
import { DbApi } from "utils/api/dbApi";
import { getI18NextStaticProps } from "utils/nextJsHelpers";

export { getDbViewFileStaticPaths as getStaticPaths } from "utils/nextJsHelpers";

export default function TablePage() {
  const { sourceLanguage, fileName, queryParams } = useDbQueryParams();
  const { isFallback } = useSourceFile();
  useDbView();

  const { data, fetchNextPage, fetchPreviousPage, isInitialLoading } =
    useInfiniteQuery<PagedResponse<TablePageData>>({
      queryKey: DbApi.TableView.makeQueryKey({ fileName, queryParams }),
      queryFn: ({ pageParam = 0 }) =>
        DbApi.TableView.call({
          fileName,
          queryParams,
          pageNumber: pageParam,
        }),
      getNextPageParam: (lastPage) => lastPage.pageNumber + 1,
      getPreviousPageParam: (lastPage) =>
        lastPage.pageNumber === 0 ? undefined : lastPage.pageNumber - 1,
      refetchOnWindowFocus: false,
    });

  if (isFallback) {
    return (
      <PageContainer maxWidth="xl" backgroundName={sourceLanguage}>
        <CircularProgress color="inherit" sx={{ flex: 1 }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth="xl"
      backgroundName={sourceLanguage}
      hasSidebar={true}
    >
      <DbResultsPageHead />

      {isInitialLoading || !data ? (
        <CircularProgress color="inherit" sx={{ flex: 1 }} />
      ) : (
        // TODO: clarify why this extra div is needed for display
        <div style={{ height: "100vh" }}>
          <TableView
            data={data.pages.flatMap((page) => page.data)}
            onEndReached={fetchNextPage}
            onStartReached={fetchPreviousPage}
          />
        </div>
      )}
      <SourceTextBrowserDrawer />
    </PageContainer>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const i18nProps = await getI18NextStaticProps(
    {
      locale,
    },
    ["settings"]
  );

  return {
    props: {
      ...i18nProps.props,
    },
  };
};
