import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { getAddError, getAddSuccess, isAdding } from "@state/common/add/selectors";
import api from "@utils/api";
import { add, addError, addInit, addSuccess } from "@state/common/add/slice";
import { defaultFormErrorHandler, generateFormError } from "@utils/form-error-helper";

function BadInventoryAddButton({ refreshList }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const initialState = {
    serial_no: "",
    reason: "Bad condition",
  };
  const [formData, setFormData] = useState(initialState);
  const requesting = useSelector(isAdding);
  const success = useSelector(getAddSuccess);
  const error = useSelector(getAddError);

  const { serial_no, reason } = formData;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (e, reason) => {
    if (reason && reason === "backdropClick" && requesting) {
      return;
    }
    setOpen(false);
  };

  const handleSnackbarClose = (e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(addInit());
    const isValid = isFormDataValid();
    if (!isValid) {
      return;
    }
    dispatch(add());
    try {
      const response = await api.post("/inventory/bad/add", formData);
      dispatch(addSuccess());
      handleClose();
      setSnackbarOpen(true);
      refreshList();
    } catch (err) {
      dispatch(addError(defaultFormErrorHandler(err)));
    }
  };

  const isFormDataValid = () => {
    if (!serial_no || !serial_no.trim()) {
      dispatch(addError(generateFormError("SERIAL_NO_REQUIRED", "serial_no", "Serial number is a required field")));
      return false;
    }

    if (!reason || !reason.trim()) {
      dispatch(addError(generateFormError("REASON_REQUIRED", "reason", "Reason is a required field")));
      return false;
    }
    return true;
  };

  const onChange = (e) => {
    setFormData((formData) => ({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    if (open) {
      setFormData(initialState);
      setSnackbarOpen(false);
    }
  }, [open]);

  useEffect(() => {
    return () => dispatch(addInit());
  }, []);

  return (
    <>
      <Grid container sx={{ mt: 2 }} justifyContent={"flex-end"}>
        <Grid item>
          <Button variant="contained" sx={{ mr: 1 }} onClick={handleOpen}>
            Add Bad Inventory Item
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: onSubmit,
        }}
      >
        <DialogTitle>Add Bad Inventory Item</DialogTitle>
        <DialogContent>
          <DialogContentText>To add a bad inventory, enter below form details and click submit</DialogContentText>
          <TextField
            autoFocus
            required
            margin="normal"
            id="serial_no"
            name="serial_no"
            label="Enter serial number of the item"
            placeholder="E.g. UXVWNSI548320027140700"
            type="text"
            fullWidth
            variant="outlined"
            value={serial_no}
            onChange={onChange}
            error={error?.field === "serial_no"}
            helperText={error?.field === "serial_no" && error?.message}
            disabled={requesting}
          />

          <TextField
            autoFocus
            required
            margin="normal"
            id="reason"
            name="reason"
            label="Specify Reason / Issue with Inventory"
            placeholder="E.g. Bad condition"
            type="text"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={onChange}
            error={error?.field === "reason"}
            helperText={error?.field === "reason" && error?.message}
            disabled={requesting}
          />
          {error?.code === "FORM_ERROR" && (
            <Alert sx={{ mt: 3 }} severity="error">
              {error?.message ? error.message : "Something went wrong"}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={requesting}>
            Cancel
          </Button>
          <Button type="submit" disabled={requesting}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" variant="filled" sx={{ width: "100%" }}>
          Item added successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default BadInventoryAddButton;
