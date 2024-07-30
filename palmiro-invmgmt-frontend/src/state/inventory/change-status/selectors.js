import get from "lodash/get";

export const isRequestingChangeInventoryStatus = (serialNumber) => (state) =>
  get(state, ["changeInventoryStatus", "requesting", serialNumber], false);

export const getChangeInventoryStatusSuccess = (serialNumber) => (state) => get(state, ["changeInventoryStatus", "success", serialNumber], false);

export const getChangeInventoryStatusError = (serialNumber) => (state) => get(state, ["changeInventoryStatus", "error", serialNumber], null);
