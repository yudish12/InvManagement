import get from "lodash/get";

export const isRequestingListOrders = (state) => get(state, "ordersList.requesting", false);

export const getListOrdersSuccess = (state) => get(state, "ordersList.items", null);

export const getListOrdersError = (state) => get(state, "ordersList.error", null);
