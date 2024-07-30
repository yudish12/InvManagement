import get from "lodash/get";

export const isRequestingListPartCode = (state) => get(state, "partCodeList.requesting", false);

export const getListPartCodeSuccess = (state) => get(state, "partCodeList.items", null);

export const getListPartCodeError = (state) => get(state, "partCodeList.error", null);
