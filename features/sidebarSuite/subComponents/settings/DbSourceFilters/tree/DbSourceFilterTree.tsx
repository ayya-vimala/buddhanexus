import { memo } from "react";
import { Tree } from "react-arborist";
import { useRouter } from "next/router";
import type {
  DbSourceFilterSelectorTreeProps,
  DbSourceTreeBaseProps,
} from "@components/db/SearchableDbSourceTree/types";
import { dbSourceFiltersSelectedIdsAtom } from "features/atoms";
import { useAtomValue } from "jotai";

import { DbSourceFilterTreeNode } from "./DbSourceFilterTreeNode";

export const DbSourceFilterSelectorTree = memo(
  function DbSourceFilterSelectorTree({
    data,
    height,
    width,
    searchTerm,
    filterSettingName,
  }: DbSourceTreeBaseProps & Omit<DbSourceFilterSelectorTreeProps, "type">) {
    const router = useRouter();

    const dbSourceFiltersSelectedIds = useAtomValue(
      dbSourceFiltersSelectedIdsAtom,
    );

    return (
      <Tree
        key={router.asPath}
        searchTerm={searchTerm}
        initialData={data}
        openByDefault={false}
        disableDrag={true}
        rowHeight={46}
        disableDrop={true}
        disableEdit={true}
        disableMultiSelection={false}
        padding={12}
        height={height}
        width={width}
        indent={16}
      >
        {(props) => (
          <DbSourceFilterTreeNode
            {...props}
            filterSettingName={filterSettingName}
            selectionIds={dbSourceFiltersSelectedIds[filterSettingName]}
          />
        )}
      </Tree>
    );
  },
);
