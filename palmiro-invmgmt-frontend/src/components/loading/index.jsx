import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";

function Loading() {
  return (
    <Grid container p={2} alignItems={"center"} justifyContent={"center"}>
      <CircularProgress />
    </Grid>
  );
}

export default Loading;
