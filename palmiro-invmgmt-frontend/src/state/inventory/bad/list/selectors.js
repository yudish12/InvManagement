import get from "lodash/get";

export const isRequestingListBadInventory = (state) => get(state, "badInventoryList.requesting", false);

export const getListBadInventorySuccess = (state) => get(state, "badInventoryList.items", null);

export const getListBadInventoryError = (state) => get(state, "badInventoryList.error", null);
