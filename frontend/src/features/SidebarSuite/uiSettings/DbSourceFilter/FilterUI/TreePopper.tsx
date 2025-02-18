import React from "react";
import useDimensions from "react-cool-dimensions";
import { SearchableDbSourceTree } from "@components/db/SearchableDbSourceTree";
import { DbSourceTreeType } from "@components/db/SearchableDbSourceTree/types";
import { DbSourceFilterUISetting } from "@features/SidebarSuite/types";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { Box, Popper } from "@mui/material";

type DbSourceFilterTreePopperProps = {
  popperId: string | undefined;
  open: boolean;
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  filterSettingName: DbSourceFilterUISetting;
};

const DbSourceFilterTreePopper = ({
  popperId,
  open,
  anchorEl,
  handleClose,
  filterSettingName,
}: DbSourceFilterTreePopperProps) => {
  const { observe, height, width } = useDimensions();

  return (
    <Popper
      id={popperId}
      open={open}
      anchorEl={anchorEl}
      sx={{
        zIndex: 1400,
        maxHeight: "424px",
        width: "100%",
        maxWidth: "340px",
        overflow: "clip",
        boxShadow: 3,
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <ClickAwayListener onClickAway={handleClose}>
        <Box
          ref={observe}
          sx={{
            p: 1,
            minHeight: 400,
            width: "100%",
          }}
        >
          <SearchableDbSourceTree
            type={DbSourceTreeType.FILTER_SELECTOR}
            filterSettingName={filterSettingName}
            parentHeight={height}
            parentWidth={width}
            hasHeading={false}
            padding={0}
          />
        </Box>
      </ClickAwayListener>
    </Popper>
  );
};

export default DbSourceFilterTreePopper;
