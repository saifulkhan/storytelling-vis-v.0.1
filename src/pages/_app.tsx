import React, { ReactElement, ReactNode, StrictMode } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import type { NextPage } from "next";
import {
  CssBaseline,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";
import { Toaster } from "react-hot-toast";
import { CacheProvider } from "@emotion/react";

import useSettings from "src/hooks/useSettings";
import { createCustomTheme } from "src/mui/theme";
import { createEmotionCache } from "src/mui/createEmotionCache";
import useScrollReset from "src/hooks/useScrollReset";
import useAuth from "src/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import { SettingsProvider } from "src/contexts/SettingsContext";
import { AuthProviderJWT } from "src/contexts/AuthProviderJWT";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

// Import all the css files created, e.g.,
// import "src/components/storyboards/tables/KeyValueTable.css";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { settings } = useSettings();
  const auth = useAuth();

  useScrollReset();

  const theme = createCustomTheme({
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    roundedCorners: settings.roundedCorners,
    theme: settings.theme,
  });

  const getLayout =
    Component.getLayout ??
    ((page) => {
      return page;
    });

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Storytelling</title>
      </Head>
      <StrictMode>
        <HelmetProvider>
          <StyledEngineProvider injectFirst>
            {/* <LocalizationProvider dateAdapter={AdapterDateFns}> */}
            <SettingsProvider>
              <AuthProviderJWT>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <Toaster position="top-center" />
                  {getLayout(<Component {...pageProps} />)}
                </ThemeProvider>
              </AuthProviderJWT>
            </SettingsProvider>
            {/* </LocalizationProvider> */}
          </StyledEngineProvider>
        </HelmetProvider>
      </StrictMode>
    </CacheProvider>
  );
}

export default MyApp;
