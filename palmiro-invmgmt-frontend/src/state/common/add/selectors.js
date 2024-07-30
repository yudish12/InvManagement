import get from "lodash/get";

export const isAdding = (state) => get(state, "commonAdd.requesting", false);

export const getAddSuccess = (state) => get(state, "commonAdd.success", false);

export const getAddError = (state) => get(state, "commonAdd.error", null);
