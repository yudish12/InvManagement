import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardCalcFinanceCostSuccess, isRequestingDashboardCalcFinanceCost } from "@state/dashboard/calculate-finance-cost/selectors";
import {
  dashboardCalcFinanceCost,
  dashboardCalcFinanceCostError,
  dashboardCalcFinanceCostSuccess,
} from "@state/dashboard/calculate-finance-cost/slice";
import { defaultFormErrorHandler } from "@utils/form-error-helper";
import api from "@utils/api";

function CalculateFinanceCost() {
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingDashboardCalcFinanceCost);
  const success = useSelector(getDashboardCalcFinanceCostSuccess);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const refreshFinanceCost = async () => {
    dispatch(dashboardCalcFinanceCost());
    try {
      const response = await api.get("/dashboard/calculate-finance-cost");
      dispatch(dashboardCalcFinanceCostSuccess("ok"));
      setSnackbarOpen(true);
    } catch (err) {
      dispatch(dashboardCalcFinanceCostError(defaultFormErrorHandler(err)));
    }
  };

  const handleSnackbarClose = (e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", width: "100%", mt: 4 }}>
        {requesting ? (
          <CircularProgress color="primary" size={14} />
        ) : (
          <Button variant="outlined" onClick={refreshFinanceCost}>
            Refresh Finance Cost
          </Button>
        )}
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" variant="filled" sx={{ width: "100%" }}>
          Finance costs refreshed successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default CalculateFinanceCost;
