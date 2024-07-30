import get from "lodash/get";

export const isRequestingListBrands = (state) => get(state, "brandsList.requesting", false);

export const getListBrandsSuccess = (state) => get(state, "brandsList.items", null);

export const getListBrandsError = (state) => get(state, "brandsList.error", null);
