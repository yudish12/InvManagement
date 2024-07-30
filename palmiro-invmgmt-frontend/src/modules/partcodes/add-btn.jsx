import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
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
import FormAsyncSelect from "@components/form-async-select";
import { loadBrandOptions } from "@utils/lookups";

function PartCodeAddButton({ refreshPartCodes }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const initialState = {
    code: "",
    model: "",
    desc: "",
    brand: null,
  };
  const [formData, setFormData] = useState(initialState);
  const requesting = useSelector(isAdding);
  const success = useSelector(getAddSuccess);
  const error = useSelector(getAddError);

  const { code, model, desc, brand } = formData;

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
      const response = await api.post("/partcodes/add", formData);
      dispatch(addSuccess());
      handleClose();
      setSnackbarOpen(true);
      refreshPartCodes();
    } catch (err) {
      dispatch(addError(defaultFormErrorHandler(err)));
    }
  };

  const isFormDataValid = () => {
    if (!code || !code.trim()) {
      dispatch(addError(generateFormError("CODE_REQUIRED", "code", "Part code is a required field")));
      return false;
    }

    if (!brand) {
      dispatch(addError(generateFormError("BRAND_REQUIRED", "brand", "Brand is a required field")));
      return false;
    }

    if (!model || !model.trim()) {
      dispatch(addError(generateFormError("MODEL_REQUIRED", "model", "Model is a required field")));
      return false;
    }

    if (!desc || !desc.trim()) {
      dispatch(addError(generateFormError("DESC_REQUIRED", "desc", "Description is a required field")));
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

  return (
    <>
      <Grid container sx={{ mt: 2 }} justifyContent={"flex-end"}>
        <Grid item>
          <Button variant="contained" sx={{ mr: 1 }} onClick={handleOpen}>
            Add part code
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
        <DialogTitle>Add Part Code</DialogTitle>
        <DialogContent>
          <DialogContentText>To add a part code, enter below form details and click submit</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="code"
            name="code"
            label="Part Code"
            placeholder="E.g. UX.VWNSI.C03"
            type="text"
            fullWidth
            value={code}
            onChange={onChange}
            error={error?.field === "code"}
            helperText={error?.field === "code" && error?.message}
            disabled={requesting}
          />

          <Box sx={{ mt: 2 }}>
            <FormAsyncSelect
              id="brand"
              getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
              label="Select Brand"
              onChange={(e, option) => setFormData((formData) => ({ ...formData, brand: option }))}
              value={brand}
              loadOptions={loadBrandOptions}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              required
              sx={{ marginBottom: 1 }}
            />
          </Box>

          <TextField
            autoFocus
            required
            margin="normal"
            id="model"
            name="model"
            label="Model"
            placeholder="E.g. I3 DESKTOP"
            type="text"
            fullWidth
            value={model}
            onChange={onChange}
            error={error?.field === "model"}
            helperText={error?.field === "model" && error?.message}
            disabled={requesting}
          />
          <TextField
            required
            margin="dense"
            id="desc"
            name="desc"
            label="Description"
            placeholder="E.g. VT/M/I/H510/CI3 10105/8D4/512 NVMe/K&M/ESHELL 3 yr"
            type="text"
            fullWidth
            value={desc}
            onChange={onChange}
            error={error?.field === "desc"}
            helperText={error?.field === "desc" && error?.message}
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
          Part code added successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default PartCodeAddButton;
