import get from "lodash/get";

export const isRequestingDashboardCalcFinanceCost = (state) => get(state, "dashboardCalcFinanceCost.requesting", false);

export const getDashboardCalcFinanceCostSuccess = (state) => get(state, "dashboardCalcFinanceCost.items", null);

export const getDashboardCalcFinanceCostError = (state) => get(state, "dashboardInstockStats.error", null);
