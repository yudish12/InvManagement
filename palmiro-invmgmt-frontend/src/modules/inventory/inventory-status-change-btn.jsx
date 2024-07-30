import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReturnIcon from "@mui/icons-material/KeyboardReturnOutlined";
import ReturnIntransitIcon from "@mui/icons-material/LocalShippingOutlined";
import WarehouseIcon from "@mui/icons-material/WarehouseOutlined";
import InwardIcon from "@mui/icons-material/InventoryOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
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

function InventoryStatusChangeButton({ serialNumber, refreshList, status }) {
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingChangeInventoryStatus(serialNumber));
  const success = useSelector(getChangeInventoryStatusSuccess(serialNumber));
  const error = useSelector(getChangeInventoryStatusError(serialNumber));
  const statusOptions = {
    "return-pending": {
      newStatus: "return-intransit",
      dialogTitle: "Mark status as Return in transit",
      dialogMessage:
        'You are about to mark this inventory\'s status as "Return In Transit" which indicates that return has been picked up from customer and is in transit to warehouse. Click confirm button to perform this action.',
      icon: <ReturnIntransitIcon />,
    },
    "return-intransit": {
      newStatus: "returned",
      dialogTitle: "Mark status as Returned",
      dialogMessage:
        'You are about to mark this inventory\'s status as "Returned" which indicates that return has been received at warehouse. Click confirm button to perform this action.',
      icon: <WarehouseIcon />,
    },
    returned: {
      newStatus: "inward",
      dialogTitle: "Mark status as Inward",
      dialogMessage:
        'You are about to mark this inventory\'s status as "Inward" which indicates that returned inventory is in good condition now and can be shipped to a new customer. Click confirm button to perform this action.',
      icon: <InwardIcon />,
    },
  };
  const [formData, setFormData] = useState({
    serial_number: serialNumber,
    status: statusOptions[status].newStatus,
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

  return (
    <>
      {requesting ? (
        <CircularProgress color="primary" size={14} />
      ) : (
        <Tooltip title={statusOptions[status]?.dialogTitle}>
          <IconButton onClick={openDialog}>{statusOptions[status]?.icon}</IconButton>
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
        <DialogTitle>{statusOptions[status].dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{statusOptions[status].dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button type="submit">Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default InventoryStatusChangeButton;
