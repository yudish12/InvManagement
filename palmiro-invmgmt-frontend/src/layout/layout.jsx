import React, { useState, useContext } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Toolbar from "@mui/material/Toolbar";

import AppBar from "./app-bar";
import Drawer from "./drawer";
import Copyright from "@components/copyright";

const LayoutContext = React.createContext(null);

const withLayout = (WrappedComponent) => (props) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [appBarTitle, setAppBarTitle] = useState("Palmiro");

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <LayoutContext.Provider value={{ isDrawerOpen, toggleDrawer, appBarTitle, setAppBarTitle }}>
      <Box sx={{ display: "flex" }}>
        <AppBar open={isDrawerOpen} appBarTitle={appBarTitle} toggleDrawer={toggleDrawer} />
        <Drawer open={isDrawerOpen} toggleDrawer={toggleDrawer} />
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) => (theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900]),
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              <WrappedComponent {...props} />
            </Grid>
            <Copyright />
          </Container>
        </Box>
      </Box>
    </LayoutContext.Provider>
  );
};

export { withLayout, LayoutContext };
