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

function InventoryAddButton({ refreshList }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const initialState = {
    name: "",
  };
  const [formData, setFormData] = useState(initialState);
  const requesting = useSelector(isAdding);
  const success = useSelector(getAddSuccess);
  const error = useSelector(getAddError);

  const { name } = formData;

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
      const response = await api.post("/brands/add", formData);
      dispatch(addSuccess());
      handleClose();
      setSnackbarOpen(true);
      refreshList();
    } catch (err) {
      dispatch(addError(defaultFormErrorHandler(err)));
    }
  };

  const isFormDataValid = () => {
    if (!name || !name.trim()) {
      dispatch(addError(generateFormError("NAME_REQUIRED", "name", "Brand name is a required field")));
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
            Add brand
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
        <DialogTitle>Add Brand</DialogTitle>
        <DialogContent>
          <DialogContentText>To add a brand, enter below form details and click submit</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Brand name"
            placeholder="E.g. Acer"
            type="text"
            fullWidth
            variant="standard"
            value={name}
            onChange={onChange}
            error={error?.field === "name"}
            helperText={error?.field === "name" && error?.message}
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
          Brand added successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default InventoryAddButton;
