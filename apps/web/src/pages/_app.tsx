import React, { Suspense } from "react";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../styles/theme";
import "../styles/index.css";

import { ReactRelayContainer } from "../relay/ReactRelayContainer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback="loading">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ReactRelayContainer Component={Component} props={pageProps} />
      </ThemeProvider>
    </Suspense>
  );
}
