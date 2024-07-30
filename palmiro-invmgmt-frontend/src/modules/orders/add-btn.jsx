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
import FormControl from "@mui/material/FormControl";
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

function OrdersAddButton({ refreshList }) {
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
    bill_date: new Date(),
    credit_period: "0",
    credit_period_radio: "0",
    mode: "intransit",
    docket_number: "",
    inward_date: new Date(),
    warehouse: null,
    items: [lineItemInitialState],
  };
  const [formData, setFormData] = useState(initialState);
  const requesting = useSelector(isAdding);
  const success = useSelector(getAddSuccess);
  const error = useSelector(getAddError);

  const { account, mode, warehouse, docket_number, invoiceNo, credit_period_radio, credit_period, bill_date, inward_date, comments, items } =
    formData;

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
      const response = await api.post("/orders/add/purchase", _formData);
      dispatch(addSuccess());
      handleClose();
      setSnackbarOpen(true);
      refreshList();
    } catch (err) {
      dispatch(addError(defaultFormErrorHandler(err)));
    }
  };

  const isFormDataValid = () => {
    if (!invoiceNo || !invoiceNo.trim()) {
      dispatch(addError(generateFormError("INVOICENO_REQUIRED", "invoiceNo", "Invoice number is a required field")));
      return false;
    }

    if (!bill_date || isNaN(bill_date)) {
      dispatch(addError(generateFormError("BILL_DATE_REQUIRED", "bill_date", "Bill date is a required field")));
      return false;
    }

    if (!credit_period || !/\d+/.test(credit_period) || parseInt(credit_period) < 0) {
      dispatch(addError(generateFormError("CREDIT_PERIOD_INVALID", "credit_period", "Credit period is invalid")));
      return false;
    }

    if (!mode) {
      dispatch(addError(generateFormError("MODE_REQUIRED", "mode", "Mode is a required field")));
      return false;
    }

    if (mode === "intransit" && !docket_number.trim()) {
      dispatch(addError(generateFormError("DOCKETNO_REQUIRED", "docket_number", "Docket number is a required field")));
      return false;
    }

    if (mode === "inward" && (!inward_date || isNaN(inward_date))) {
      dispatch(addError(generateFormError("INWARD_DATE_REQUIRED", "inward_date", "Inward date is a required field")));
      return false;
    }

    if (!warehouse) {
      dispatch(addError(generateFormError("WAREHOUSE_REQUIRED", "warehouse", "Warehouse is a required field")));
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const { partcode, qty, price, warranty_period, serialNos } = items[i];
      if (!partcode) {
        dispatch(addError(generateFormError("PARTCODE_REQUIRED", `partcode-${i}`, "Part code is a required field")));
        return false;
      }
      if (!qty) {
        dispatch(addError(generateFormError("QTY_REQUIRED", `qty-${i}`, "Quantity is a required field")));
        return false;
      }

      if (!/\d+/.test(qty) || parseInt(qty) <= 0) {
        dispatch(addError(generateFormError("QTY_REQUIRED", `qty-${i}`, "Quantity is invalid, it must be positive number without decimals")));
        return false;
      }

      if (!price) {
        dispatch(addError(generateFormError("PRICE_REQUIRED", `price-${i}`, "Price is a required field")));
        return false;
      }

      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        dispatch(addError(generateFormError("PRICE_REQUIRED", `price-${i}`, "Price is invalid, it must be positive number")));
        return false;
      }

      if (!warranty_period || !/\d+/.test(warranty_period) || parseInt(warranty_period) < 0) {
        dispatch(addError(generateFormError("WARRANTY_PERIOD_INVALID", `warranty_period-${i}`, "Warranty period is invalid")));
        return false;
      }

      if (mode === "inward") {
        // Check if serial number count matches quantity
        // Check if there are no duplicate serial numbers
        // Check if there are any missing lines in serial numbers
        if (!serialNos || !serialNos.trim()) {
          dispatch(addError(generateFormError("SERIALNO_REQUIRED", `serialNos-${i}`, "Serial numbers is a required field")));
          return false;
        }
        const serialNoArr = serialNos.split("\n");
        if (serialNoArr.length !== parseInt(qty)) {
          dispatch(addError(generateFormError("SERIALNO_COUNT_MISMATCH", `serialNos-${i}`, "Serial numbers count does not match quantity")));
          return false;
        }
        const duplicateSerialNoArr = serialNoArr.filter((item, index) => serialNoArr.indexOf(item) !== index);
        if (duplicateSerialNoArr.length > 0) {
          dispatch(
            addError(
              generateFormError(
                "SERIALNO_DUPLICATES",
                `serialNos-${i}`,
                `Serial numbers contain following duplicates ${duplicateSerialNoArr.join(", ")}`
              )
            )
          );
          return false;
        }

        const emptySerialNumber = serialNoArr.find((e) => !e.trim());
        if (emptySerialNumber) {
          dispatch(addError(generateFormError("SERIALNO_DUPLICATES", `serialNos-${i}`, `Serial numbers contain blank value(s)`)));
          return false;
        }
      }
    }

    return true;
  };

  const onChange = (e) => {
    if (e.target.name === "credit_period" && !isNaN(parseInt(e.target.value)) && parseInt(e.target.value) < 0) {
      return;
    }

    if (e.target.name === "credit_period_radio" && e.target.value !== "custom") {
      setFormData((formData) => ({
        ...formData,
        [e.target.name]: e.target.value,
        credit_period: e.target.value,
      }));
      return;
    }

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
      <Button variant="outlined" sx={{ width: "250px", alignSelf: "center" }} onClick={handleOpen}>
        Add Purchase Order
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: onSubmit,
        }}
      >
        <DialogTitle>Add Purchase Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>To add a purchase order, enter below form details and click submit</DialogContentText>

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
            <FormControl>
              <FormLabel id="credit_period_radio">Credit Period</FormLabel>
              <RadioGroup row aria-labelledby="credit_period_radio" value={credit_period_radio} onChange={onChange} name="credit_period_radio">
                <FormControlLabel value="0" control={<Radio />} label="0 days" />
                <FormControlLabel value="30" control={<Radio />} label="30 days" />
                <FormControlLabel value="60" control={<Radio />} label="60 days" />
                <FormControlLabel value="90" control={<Radio />} label="90 days" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom" />
              </RadioGroup>
            </FormControl>
            {credit_period_radio === "custom" && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="credit_period"
                label="Enter Credit Period in Days"
                name="credit_period"
                value={credit_period}
                onChange={onChange}
                error={error?.field === "credit_period"}
                helperText={error?.field === "credit_period" && error?.message}
                disabled={requesting}
                autoComplete="credit_period"
                type="number"
              />
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControl>
              <FormLabel id="mode">Mode</FormLabel>
              <RadioGroup row aria-labelledby="mode" value={mode} onChange={onChange} name="mode">
                <FormControlLabel value="intransit" control={<Radio />} label="In Transit" />
                <FormControlLabel value="inward" control={<Radio />} label="Inward" />
              </RadioGroup>
            </FormControl>
            {mode === "intransit" && (
              <TextField
                margin="normal"
                required
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
            )}
          </Box>

          {mode === "inward" && (
            <Box sx={{ marginBottom: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Inward Date"
                  value={inward_date}
                  format="yyyy-MM-dd"
                  slotProps={{
                    textField: {
                      helperText: error?.field === "inward_date" && error.message ? error.message : "Date is in YYYY-MM-DD format",
                      error: error?.field === "inward_date" && !!error.message,
                      fullWidth: true,
                    },
                  }}
                  onChange={(newDate) => {
                    onChange({ target: { name: "inward_date", value: newDate } });
                  }}
                />
              </LocalizationProvider>
            </Box>
          )}

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
                  {mode === "inward" && (
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
                  )}

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

export default OrdersAddButton;
