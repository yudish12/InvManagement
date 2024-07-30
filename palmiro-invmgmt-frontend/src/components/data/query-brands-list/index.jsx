import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function QueryBrandsList() {
  const dispatch = useDispatch();
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    dispatch(listBrands());
    try {
      const response = await api.get("/brands/list");
      dispatch(listBrandsSuccess(response.data.output));
    } catch (err) {
      dispatch(listBrandsError(defaultFormErrorHandler(err)));
    }
  };
  return false;
}

export default QueryBrandsList;
