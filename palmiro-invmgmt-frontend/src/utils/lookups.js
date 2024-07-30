import api from "./api";

export const loadPartCodeOptions = async (label) => {
  try {
    const response = await api.get(`/partcodes/list?label=${label}`);
    return response.data.output;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const loadWarehouseOptions = async (label) => {
  try {
    const response = await api.get(`/warehouses/list?label=${label}`);
    return response.data.output;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const loadBrandOptions = async (label) => {
  try {
    const response = await api.get(`/brands/list?label=${label}`);
    return response.data.output;
  } catch (err) {
    console.log(err);
    return [];
  }
};
