import get from "lodash/get";

export const isRequestingListInventory = (state) => get(state, "inventoryList.requesting", false);

export const getListInventorySuccess = (state) => get(state, "inventoryList.items", null);

export const getListInventoryCount = (state) => get(state, "inventoryList.count", null);

export const getListInventoryError = (state) => get(state, "inventoryList.error", null);
