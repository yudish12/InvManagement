import get from "lodash/get";

export const isDeletingOrder = (orderId) => (state) => get(state, ["deleteOrder", "requesting", orderId], false);

export const getDeleteOrderSuccess = (orderId) => (state) => get(state, ["deleteOrder", "success", orderId], false);

export const getDeleteOrderError = (orderId) => (state) => get(state, ["deleteOrder", "error", orderId], null);
