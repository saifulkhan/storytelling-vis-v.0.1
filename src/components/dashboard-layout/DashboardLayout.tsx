import { useCallback, useState } from "react";
import type { FC, ReactNode } from "react";
import { experimentalStyled } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayoutRoot = experimentalStyled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: "flex",
  height: "100%",
  overflow: "hidden",
  width: "100%",
}));

const DashboardLayoutWrapper = experimentalStyled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",
  paddingTop: "64px",
  [theme.breakpoints.up("md")]: {
    paddingLeft: "280px",
  },
}));

const DashboardLayoutContainer = experimentalStyled("div")({
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",
});

const DashboardLayoutContent = experimentalStyled("div")({
  flex: "1 1 auto",
  height: "100%",
  overflow: "auto",
  position: "relative",
  WebkitOverflowScrolling: "touch",
});

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] =
    useState<boolean>(false);

  const handleSidebarClose = useCallback(
    (): void => setIsSidebarMobileOpen(false),
    [],
  );

  return (
    <DashboardLayoutRoot>
      <Navbar onSidebarMobileOpen={(): void => setIsSidebarMobileOpen(true)} />
      <Sidebar
        onMobileClose={handleSidebarClose}
        openMobile={isSidebarMobileOpen}
      />
      <DashboardLayoutWrapper>
        <DashboardLayoutContainer>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </DashboardLayoutContainer>
      </DashboardLayoutWrapper>
    </DashboardLayoutRoot>
  );
};

export default DashboardLayout;
