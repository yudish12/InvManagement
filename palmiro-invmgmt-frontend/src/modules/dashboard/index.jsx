import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import { withLayout } from "@layout/layout";
import AppBarTitle from "@components/app-bar-title";
import DocumentHead from "@components/document-head";
import DashboardInstockStats from "./instock-stats";
import CalculateFinanceCost from "./calculate-finance-cost";

function Dashboard() {
  return (
    <>
      <DocumentHead title="Dashboard" />
      <AppBarTitle title="Dashboard" />
      <CalculateFinanceCost />
      <DashboardInstockStats />
    </>
  );
}

export default withLayout(Dashboard);
