import get from "lodash/get";

export const isRequestingDashboardInstockStats = (state) => get(state, "dashboardInstockStats.requesting", false);

export const getDashboardInstockStatsSuccess = (state) => get(state, "dashboardInstockStats.items", null);

export const getDashboardInstockStatsError = (state) => get(state, "dashboardInstockStats.error", null);
