import React, { useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import store from "@app/state/store";
import Boot from "./boot";

const defaultTheme = createTheme();

function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Boot />
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default App;
