import * as React from "react";
import Typography from "@mui/material/Typography";

function Title({ children, ...props }) {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom {...props}>
      {children}
    </Typography>
  );
}

export default Title;
