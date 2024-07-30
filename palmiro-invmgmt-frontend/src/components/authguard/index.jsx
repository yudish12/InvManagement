import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { getUser } from "@state/user/selectors";

function AuthGuard({ component, usernames }) {
  const user = useSelector(getUser);

  if (!user) {
    return <Navigate to={"/login"} />;
  }

  if (
    Array.isArray(usernames) &&
    usernames.length > 0 &&
    !usernames.includes(user.username)
  ) {
    return <Navigate to={"/"} />;
  }

  return <>{component}</>;
}

export default AuthGuard;
