import React, { useContext, useEffect } from "react";

import { LayoutContext } from "@layout/layout";

function AppBarTitle({ title }) {
  const { setAppBarTitle } = useContext(LayoutContext);
  useEffect(() => {
    setAppBarTitle(title);
  }, []);
  return false;
}

export default AppBarTitle;
