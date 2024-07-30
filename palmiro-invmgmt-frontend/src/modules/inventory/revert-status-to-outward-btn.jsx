import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReturnIcon from "@mui/icons-material/History";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import {
  getChangeInventoryStatusError,
  getChangeInventoryStatusSuccess,
  isRequestingChangeInventoryStatus,
} from "@state/inventory/change-status/selectors";
import { changeInventoryStatus, changeInventoryStatusError, changeInventoryStatusSuccess } from "@state/inventory/change-status/slice";
import api from "@utils/api";
import { defaultFormErrorHandler } from "@utils/form-error-helper";

function InventoryRevertStatusToOutwardButton({ serialNumber, refreshList }) {
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingChangeInventoryStatus(serialNumber));
  const success = useSelector(getChangeInventoryStatusSuccess(serialNumber));
  const error = useSelector(getChangeInventoryStatusError(serialNumber));
  const [formData, setFormData] = useState({
    serial_number: serialNumber,
    status: "outward",
    showDialog: false,
  });

  const { showDialog } = formData;

  const setShowDialog = (val) => {
    setFormData((formData) => ({
      ...formData,
      showDialog: !!val,
    }));
  };

  const openDialog = () => {
    setShowDialog(true);
  };

  const closeDialog = () => setShowDialog(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    dispatch(changeInventoryStatus({ serialNumber }));
    try {
      const response = await api.post("/inventory/status/change", formData);
      dispatch(changeInventoryStatusSuccess({ serialNumber, data: response.data.output }));
      refreshList();
    } catch (err) {
      dispatch(changeInventoryStatusError(defaultFormErrorHandler(err)));
    }
    closeDialog();
  };

  const onChange = (e) => {
    setFormData((formData) => ({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {requesting ? (
        false
      ) : (
        <Tooltip title="Revert status to Outward">
          <IconButton onClick={openDialog}>
            <ReturnIcon />
          </IconButton>
        </Tooltip>
      )}
      <Dialog
        open={showDialog}
        onClose={closeDialog}
        PaperProps={{
          component: "form",
          onSubmit: onSubmit,
        }}
      >
        <DialogTitle>Change Inventory Status to Outward</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are marking inventory status as Outward. This will mark this inventory as sold and associate the sales order which is under returned
            as the primary sales order. Please click confirm to perform this action.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button type="submit">Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default InventoryRevertStatusToOutwardButton;
