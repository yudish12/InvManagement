import get from "lodash/get";

export const isRequestingListWarehouses = (state) => get(state, "warehousesList.requesting", false);

export const getListWarehousesSuccess = (state) => get(state, "warehousesList.items", null);

export const getListWarehousesError = (state) => get(state, "warehousesList.error", null);
