import React, { useEffect, useState } from "react";
import cloneDeep from "lodash/cloneDeep";
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
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { getAddError, getAddSuccess, isAdding } from "@state/common/add/selectors";
import api from "@utils/api";
import { add, addError, addInit, addSuccess } from "@state/common/add/slice";
import { defaultFormErrorHandler, generateFormError } from "@utils/form-error-helper";
import FormAsyncSelect from "@components/form-async-select";
import { loadPartCodeOptions, loadWarehouseOptions } from "@utils/lookups";
import DisableInputChangeOnScroll from "@components/disable-input-change-on-scroll";

function OrdersSellButton({ refreshList }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const lineItemInitialState = {
    partcode: null,
    qty: "",
    serialNos: "",
    price: "",
    warranty_period: "12",
    warranty_period_radio: "12",
  };
  const initialState = {
    account: "palmiro",
    invoiceNo: "",
    po_number: "",
    bill_date: new Date(),
    credit_period: "0",
    credit_period_radio: "0",
    mode: "outward",
    docket_number: "",
    inward_date: new Date(),
    warehouse: null,
    items: [lineItemInitialState],
  };
  const [formData, setFormData] = useState(initialState);
  const requesting = useSelector(isAdding);
  const success = useSelector(getAddSuccess);
  const error = useSelector(getAddError);

  const {
    account,
    mode,
    po_number,
    warehouse,
    docket_number,
    invoiceNo,
    credit_period_radio,
    credit_period,
    bill_date,
    inward_date,
    comments,
    items,
  } = formData;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (e, reason) => {
    if (reason && reason === "backdropClick" && requesting) {
      return;
    }
    setFormData(initialState);
    setOpen(false);
  };

  useEffect(() => {
    if (success) {
      refreshList();
    }
  }, [success]);

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
      const _formData = cloneDeep(formData);
      for (let i = 0; i < _formData.items.length; i++) {
        _formData.items[i].serialNos = _formData.items[i].serialNos.trim();
      }
      const response = await api.post("/orders/add/sale", _formData);
      dispatch(addSuccess());
      handleClose();
      setSnackbarOpen(true);
      refreshList();
    } catch (err) {
      dispatch(addError(defaultFormErrorHandler(err)));
    }
  };

  const isFormDataValid = () => {
    return true;
  };

  const onChange = (e) => {
    setFormData((formData) => ({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  const trimSerialNumbers = (key) => (e) => {
    setFormData((formData) => {
      const _formData = cloneDeep(formData);
      const _items = cloneDeep(formData.items);
      _items[key]["serialNos"] = _items[key]["serialNos"].trim();
      _formData.items = _items;
      return _formData;
    });
  };

  const onChangeLineItem = (key) => (e) => {
    if (["qty", "warranty_period"].includes(e.target.name) && !isNaN(parseInt(e.target.value)) && parseInt(e.target.value) < 0) {
      return;
    }

    setFormData((formData) => {
      const _formData = cloneDeep(formData);
      const _items = cloneDeep(formData.items);
      if (e.target.name === "warranty_period_radio" && e.target.value !== "custom") {
        _items[key][e.target.name] = e.target.value;
        _items[key]["warranty_period"] = e.target.value;
        _formData.items = _items;
        return _formData;
      }
      _items[key][e.target.name] = e.target.value;
      _formData.items = _items;
      return _formData;
    });
  };

  const handleAddLineItem = () => {
    setFormData((formData) => {
      const _formData = cloneDeep(formData);
      const _items = cloneDeep(formData.items);
      _items.push(lineItemInitialState);
      _formData.items = _items;
      return _formData;
    });
  };

  const handleDeleteLineItem = (idx) => {
    setFormData((formData) => {
      const _formData = cloneDeep(formData);
      const _items = cloneDeep(formData.items);
      _items.splice(idx, 1);
      _formData.items = _items;
      return _formData;
    });
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
      <DisableInputChangeOnScroll />
      <Button variant="contained" sx={{ width: "250px", alignSelf: "center" }} onClick={handleOpen}>
        Add Sale Order
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: onSubmit,
        }}
      >
        <DialogTitle>Add Sale Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>To add a sale order, enter below form details and click submit</DialogContentText>
          <Box>
            <FormControl>
              <FormLabel id="account">Account</FormLabel>
              <RadioGroup row aria-labelledby="account" value={account} onChange={onChange} name="account">
                <FormControlLabel value="palmiro" control={<Radio />} label="Palmiro" />
                <FormControlLabel value="qvent" control={<Radio />} label="Qvent" />
                <FormControlLabel value="trioline" control={<Radio />} label="Trioline" />
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="invoiceNo"
              label="Enter Invoice Number"
              name="invoiceNo"
              value={invoiceNo}
              onChange={onChange}
              error={error?.field === "invoiceNo"}
              helperText={error?.field === "invoiceNo" && error?.message}
              disabled={requesting}
              autoComplete="invoiceNo"
            />
            <TextField
              margin="normal"
              fullWidth
              id="po_number"
              label="Enter PO Number"
              name="po_number"
              value={po_number}
              onChange={onChange}
              error={error?.field === "po_number"}
              helperText={error?.field === "po_number" && error?.message}
              disabled={requesting}
              autoComplete="po_number"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Bill Date"
                value={bill_date}
                format="yyyy-MM-dd"
                slotProps={{
                  textField: {
                    error: error?.field === "bill_date",
                    helperText: error?.field === "bill_date" && error?.message ? error.message : "Date is in YYYY-MM-DD format",
                    fullWidth: true,
                  },
                }}
                onChange={(newDate) => onChange({ target: { name: "bill_date", value: newDate } })}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              id="docket_number"
              label="Enter Docket Number"
              name="docket_number"
              value={docket_number}
              onChange={onChange}
              error={error?.field === "docket_number"}
              helperText={error?.field === "docket_number" && error?.message}
              disabled={requesting}
              autoComplete="docket_number"
            />
          </Box>

          <FormAsyncSelect
            id="warehouse"
            getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
            label="Select Warehouse"
            onChange={(e, option) => setFormData((formData) => ({ ...formData, warehouse: option }))}
            value={warehouse}
            loadOptions={loadWarehouseOptions}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            required
            sx={{ mb: 2 }}
          />

          {items.map((item, key) => {
            const { partcode, qty, price, serialNos, warranty_period, warranty_period_radio } = item;
            return (
              <Box component="fieldset" sx={{ p: 2, mb: 2 }} key={key}>
                <legend>{`Line Item ${key + 1}`}</legend>
                <FormAsyncSelect
                  id={`partcode-${key}`}
                  getOptionLabel={(option) => (typeof option === "string" ? option : option.code)}
                  label="Search and select part code"
                  onChange={(e, option) => onChangeLineItem(key)({ target: { name: "partcode", value: option } })}
                  value={partcode}
                  loadOptions={loadPartCodeOptions}
                  isOptionEqualToValue={(option, value) => option.code === value.code}
                  error={error?.field === `partcode-${key}`}
                  helperText={error?.field === `partcode-${key}` && error?.message}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.code}>
                        <Grid container alignItems="center">
                          <Grid item sx={{ display: "flex", width: 44 }}>
                            <SettingsSuggestIcon sx={{ color: "text.secondary" }} />
                          </Grid>
                          <Grid item sx={{ width: "calc(100% - 44px)", wordWrap: "break-word" }}>
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              {option.code}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {option.model}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.desc}
                            </Typography>
                          </Grid>
                        </Grid>
                      </li>
                    );
                  }}
                  required
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id={`qty-${key}`}
                  label="Quantity"
                  name="qty"
                  value={qty}
                  onChange={onChangeLineItem(key)}
                  error={error?.field === `qty-${key}`}
                  helperText={error?.field === `qty-${key}` && error?.message}
                  disabled={requesting}
                  autoComplete="qty"
                  type="number"
                  min="1"
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id={`price-${key}`}
                  label="Price"
                  name="price"
                  value={price}
                  onChange={onChangeLineItem(key)}
                  error={error?.field === `price-${key}`}
                  helperText={error?.field === `price-${key}` && error?.message}
                  disabled={requesting}
                  autoComplete="price"
                  type="number"
                  min="1"
                />

                <Box sx={{ my: 2 }}>
                  <FormControl>
                    <FormLabel id="warranty_period_radio">Warranty Period</FormLabel>
                    <RadioGroup
                      aria-labelledby="warranty_period_radio"
                      value={warranty_period_radio}
                      onChange={onChangeLineItem(key)}
                      name="warranty_period_radio"
                    >
                      <FormControlLabel value="0" control={<Radio />} label="No warranty" />
                      <FormControlLabel value="12" control={<Radio />} label="12 months" />
                      <FormControlLabel value="18" control={<Radio />} label="18 months" />
                      <FormControlLabel value="24" control={<Radio />} label="24 months" />
                      <FormControlLabel value="36" control={<Radio />} label="36 months" />
                      <FormControlLabel value="60" control={<Radio />} label="60 months" />
                      <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                    </RadioGroup>
                  </FormControl>
                  {warranty_period_radio === "custom" && (
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id={`warranty_period-${key}`}
                      label="Enter Warranty Period in Months"
                      name="warranty_period"
                      value={warranty_period}
                      onChange={onChangeLineItem(key)}
                      error={error?.field === `warranty_period-${key}`}
                      helperText={error?.field === `warranty_period-${key}` && error?.message}
                      disabled={requesting}
                      autoComplete="warranty_period"
                      type="number"
                    />
                  )}
                </Box>

                <Box sx={{ marginTop: 2 }}>
                  <TextField
                    margin="normal"
                    multiline
                    required
                    fullWidth
                    id={`serialNos-${key}`}
                    label="Enter Serial Numbers"
                    placeholder={`Enter each serial number on new line, number of lines should match the quantity`}
                    name="serialNos"
                    minRows={qty && !isNaN(parseInt(qty)) && parseInt(qty) > 0 ? parseInt(qty) : 3}
                    maxRows={qty && !isNaN(parseInt(qty)) && parseInt(qty) > 0 ? parseInt(qty) : 3}
                    value={serialNos}
                    onBlur={trimSerialNumbers(key)}
                    onChange={onChangeLineItem(key)}
                    error={error?.field === `serialNos-${key}`}
                    helperText={error?.field === `serialNos-${key}` && error?.message}
                    disabled={requesting}
                    autoComplete="serialNos"
                  />

                  {key > 0 && (
                    <Box sx={{ display: "flex", mt: 2, justifyContent: "center", alignItems: "center" }}>
                      <Button variant="outlined" color="error" onClick={(e) => handleDeleteLineItem(key)}>
                        Delete this line item
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}

          <Button variant="outlined" sx={{ mb: 2 }} onClick={handleAddLineItem}>
            Add another line item
          </Button>

          <TextField
            margin="normal"
            multiline
            fullWidth
            id={`comments`}
            label="Enter Comments"
            placeholder={`Enter comments, if any`}
            name="comments"
            minRows={3}
            value={comments}
            onChange={onChange}
            error={error?.field === `comments`}
            helperText={error?.field === `comments` && error?.message}
            disabled={requesting}
            autoComplete="comments"
          />
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
          Order(s) added successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default OrdersSellButton;
