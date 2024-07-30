import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { getUser } from "@state/user/selectors";

function UnAuthGuard({ component }) {
  const user = useSelector(getUser);

  if (user) {
    return <Navigate to={"/"} replace />;
  }

  return component;
}

export default UnAuthGuard;
