import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

import AuthGuard from "@components/authguard";
import UnAuthGuard from "@components/unauthguard";
import Dashboard from "@modules/dashboard";
import SignIn from "@modules/sign-in";
import Loading from "@components/loading";
import { getUserToken } from "@utils/token";
import api from "@utils/api";
import { userReceive } from "@state/user/slice";
import PartCodes from "@modules/partcodes";
import Brands from "@modules/brands";
import Inventory from "@modules/inventory";
import BadInventory from "@modules/inventory/bad";
import Warehouses from "@modules/warehouses";
import Orders from "@modules/orders";

function Boot() {
  const dispatch = useDispatch();
  const [appInitialized, setAppInitialized] = useState(false);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AuthGuard component={<Dashboard />} />,
    },
    {
      path: "/orders",
      element: <AuthGuard component={<Orders />} usernames={["admin"]} />,
    },
    {
      path: "/partcodes",
      element: <AuthGuard component={<PartCodes />} usernames={["admin"]} />,
    },
    {
      path: "/brands",
      element: <AuthGuard component={<Brands />} usernames={["admin"]} />,
    },
    {
      path: "/inventory",
      element: <AuthGuard component={<Inventory />} usernames={["admin"]} />,
    },
    {
      path: "/inventory/bad",
      element: <AuthGuard component={<BadInventory />} usernames={["admin"]} />,
    },
    {
      path: "/warehouses",
      element: <AuthGuard component={<Warehouses />} usernames={["admin"]} />,
    },
    {
      path: "/login",
      element: <UnAuthGuard component={<SignIn />} />,
    },
  ]);

  useEffect(() => {
    bootApp();
  }, []);

  const bootApp = async () => {
    // 1. Check if a token exists in local storage, set axios token
    // 2. Call /me endpoint to validate token and set user
    // 3. If invalid, delete token from local storage and axios
    // 4. If valid
    // 4.1 Set current user
    // 4.2 Set axios token
    // 4.3 Initialize app

    const authtoken = getUserToken();

    if (!authtoken) {
      setAppInitialized(true);
      return;
    }

    axios.defaults.headers.common["authtoken"] = authtoken;

    try {
      const response = await api.get("/me");
      dispatch(userReceive(response.data.output));
      setAppInitialized(true);
    } catch (err) {
      console.log(err);
      setAppInitialized(true);
      delete axios.defaults.headers.common["authtoken"];
      return;
    }
  };

  return appInitialized ? <RouterProvider router={router} /> : <Loading />;
}

export default Boot;
