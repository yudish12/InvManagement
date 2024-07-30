import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { withLayout } from "@layout/layout";
import AppBarTitle from "@components/app-bar-title";
import Title from "@components/title";
import OrdersAddButton from "./add-btn";
import {
  getListOrdersError,
  getListOrdersSuccess,
  isRequestingListOrders,
} from "@state/orders/list/selectors";
import {
  listOrders,
  listOrdersError,
  listOrdersSuccess,
} from "@state/orders/list/slice";
import api from "@utils/api";
import { defaultFormErrorHandler } from "@utils/form-error-helper";
import Loading from "@components/loading";
import DocumentHead from "@components/document-head";
import { TableContainer, TablePagination } from "@mui/material";
import OrdersSellButton from "./sell-btn";
import DeleteOrderButton from "./delete-order-btn";
import EditOrderButton from "./edit-btn";

const LIMIT_PER_PAGE = 10;

function Orders() {
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingListOrders);
  const rows = useSelector(getListOrdersSuccess);
  const error = useSelector(getListOrdersError);
  const [urlParams, setUrlParams] = useState({
    searchTerm: "",
    billDate: "",
    mode: ["intransit", "inward", "outward"],
    limit: LIMIT_PER_PAGE,
    page: 1,
  });
  const [formData, setFormData] = useState({
    search: "",
    billDate: "",
    mode: ["intransit", "inward", "outward"],
  });

  const { search, mode } = formData;

  useEffect(() => {
    init();
  }, [urlParams]);

  const generateUrl = () => {
    const params = {};
    if (urlParams.searchTerm.trim()) {
      params.search = urlParams.searchTerm.trim();
    }
    if (urlParams.mode.length !== 3) {
      params.mode = urlParams.mode.join(",");
    }
    if (urlParams.billDate) {
      params.billDate = urlParams.billDate;
    }
    if (urlParams.page && urlParams.limit) {
      params.skip = (urlParams.page - 1) * urlParams.limit;
      params.limit = urlParams.limit;
    }

    let url = "/orders/list";
    const keys = Object.keys(params);
    for (let i = 0; i < keys.length; i++) {
      url += i === 0 ? `?` : `&`;
      url += `${keys[i]}=${params[keys[i]]}`;
    }
    return url;
  };

  const init = async () => {
    dispatch(listOrders());
    try {
      const response = await api.get(generateUrl());
      dispatch(listOrdersSuccess(response.data.output));
    } catch (err) {
      dispatch(listOrdersError(defaultFormErrorHandler(err)));
    }
  };

  const onChange = (e) => {
    setFormData((formData) => ({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearchClick = (e) => {
    if (mode.length < 1) {
      alert(
        "Atleast 1 mode (In transit / Inward / Outward) needs to be selected"
      );
      return;
    }
    setUrlParams({
      searchTerm: search,
      mode: mode,
      billDate: formData.billDate ? formData.billDate.toISOString() : null,
      limit: LIMIT_PER_PAGE,
      page: 1,
    });
  };

  const toggleMode = (modeName) => (e) => {
    if (mode.includes(modeName)) {
      const _mode = mode.filter((e) => e !== modeName);
      setFormData((formData) => ({
        ...formData,
        mode: _mode,
      }));
      return;
    } else {
      setFormData((formData) => ({
        ...formData,
        mode: [...mode, modeName],
      }));
    }
  };

  return (
    <>
      <DocumentHead title="Orders" />
      <AppBarTitle title="Orders" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          width: "100%",
          justifyContent: "space-between",
          p: "24px",
        }}
      >
        <OrdersAddButton refreshList={init} />
        <OrdersSellButton refreshList={init} />
      </Box>
      <Grid item xs={12}>
        <Title style={{ paddingLeft: 3 }}>Orders</Title>
        {requesting && <Loading />}
        {error?.code === "FORM_ERROR" && (
          <Alert sx={{ mt: 3 }} severity="error">
            {error?.message ? error.message : "Something went wrong"}
          </Alert>
        )}
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            mb: 2,
          }}
        >
          <Typography variant="h6" color="secondary">
            Filters
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", gap: "16px" }}>
            <TextField
              margin="dense"
              id="search"
              name="search"
              label="Search Orders by Invoice Number"
              placeholder="E.g. X490131732"
              type="text"
              fullWidth
              variant="outlined"
              value={search}
              onChange={onChange}
              error={error?.field === "search"}
              helperText={error?.field === "search" && error?.message}
              disabled={requesting}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Bill Date"
                value={formData.billDate || null}
                format="yyyy-MM-dd"
                slotProps={{
                  textField: {
                    error: error?.field === "billDate",
                    helperText:
                      error?.field === "billDate" && error?.message
                        ? error.message
                        : "Date is in YYYY-MM-DD format",
                    fullWidth: true,
                  },
                }}
                onChange={(newDate) =>
                  onChange({ target: { name: "billDate", value: newDate } })
                }
              />
            </LocalizationProvider>
            <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
              <FormControlLabel
                control={<Checkbox checked={mode.includes("intransit")} />}
                label="Intransit"
                onClick={toggleMode("intransit")}
              />
              <FormControlLabel
                control={<Checkbox checked={mode.includes("inward")} />}
                label="Inward"
                onClick={toggleMode("inward")}
              />
              <FormControlLabel
                control={<Checkbox checked={mode.includes("outward")} />}
                label="Outward"
                onClick={toggleMode("outward")}
              />
            </FormGroup>
            <Button
              variant="contained"
              onClick={handleSearchClick}
              sx={{ alignSelf: "flex-start" }}
            >
              Search
            </Button>
          </Box>
        </Paper>
        {Array.isArray(rows) && (
          <TableContainer sx={{ overflowX: "auto" }} component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Actions
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Bill Date
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Company
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Invoice No
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    PO Number
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Credit Period
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Mode
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Docket Number
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Warehouse
                  </TableCell>
                  <TableCell
                    colSpan={7}
                    sx={{ textAlign: "center", whiteSpace: "nowrap" }}
                  >
                    Material
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }} rowSpan={2}>
                    Comments
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    Serial number
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>Part code</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    Brand Name
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>Model</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>Price</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    Warranty Period
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    Description
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, k) => {
                  const {
                    _id,
                    bill_date,
                    account,
                    po_number,
                    invoice_number,
                    mode,
                    docket_number,
                    credit_period,
                    warehouseDetails,
                    items,
                    comments,
                  } = row;
                  const totalRowCount = items.reduce((total, item) => {
                    return total + (item.serial_numbers.length || 1);
                  }, 0);
                  return items.map((item, k2) => {
                    const {
                      partcode,
                      brand,
                      price,
                      qty,
                      serial_numbers,
                      warranty_period,
                    } = item;

                    if (mode === "intransit") {
                      return (
                        <TableRow
                          key={`${k}${k2}`}
                          sx={{
                            backgroundColor: k % 2 === 0 ? "#fff" : "#f9faff",
                          }}
                        >
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <EditOrderButton
                                  order={row}
                                  refreshList={init}
                                />
                                <DeleteOrderButton
                                  orderId={_id}
                                  refreshList={init}
                                />
                              </Box>
                            </TableCell>
                          )}
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              {format(parseISO(bill_date), "dd-MMM-yyyy")}
                            </TableCell>
                          )}
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              {account.charAt(0).toUpperCase() +
                                account.slice(1)}
                            </TableCell>
                          )}
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              {invoice_number || ""}
                            </TableCell>
                          )}
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              {po_number || ""}
                            </TableCell>
                          )}
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >{`${credit_period} days`}</TableCell>
                          )}
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              {mode.toUpperCase()}
                            </TableCell>
                          )}
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              {docket_number || ""}
                            </TableCell>
                          )}
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              {warehouseDetails.label}
                            </TableCell>
                          )}
                          <TableCell>-</TableCell>
                          <TableCell sx={{ verticalAlign: "top" }}>
                            {partcode.code}
                          </TableCell>
                          <TableCell
                            style={{
                              whiteSpace: "nowrap",
                              verticalAlign: "top",
                            }}
                          >
                            {brand.label}
                          </TableCell>
                          <TableCell sx={{ verticalAlign: "top" }}>
                            {partcode.model}
                          </TableCell>
                          <TableCell sx={{ verticalAlign: "top" }}>
                            {price}
                          </TableCell>
                          <TableCell sx={{ verticalAlign: "top" }}>
                            {warranty_period} months
                          </TableCell>
                          <TableCell
                            sx={{ whiteSpace: "nowrap", verticalAlign: "top" }}
                          >
                            {partcode.desc}
                          </TableCell>
                          {k2 === 0 && (
                            <TableCell
                              sx={{ verticalAlign: "top" }}
                              rowSpan={totalRowCount}
                            >
                              {comments || ""}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    }

                    return serial_numbers.map((sno, k3) => (
                      <TableRow
                        key={`${k}${k2}${k3}`}
                        sx={{
                          backgroundColor: k % 2 === 0 ? "#fff" : "#f9faff",
                        }}
                      >
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          ></TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >
                            {format(parseISO(bill_date), "dd-MMM-yyyy")}
                          </TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >
                            {account.charAt(0).toUpperCase() + account.slice(1)}
                          </TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >
                            {invoice_number || ""}
                          </TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >
                            {po_number || ""}
                          </TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >{`${credit_period} days`}</TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >
                            {mode.toUpperCase()}
                          </TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >
                            {docket_number || ""}
                          </TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >
                            {warehouseDetails.label}
                          </TableCell>
                        )}
                        <TableCell>{sno}</TableCell>
                        {k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={qty}
                          >
                            {partcode.code}
                          </TableCell>
                        )}
                        {k3 === 0 && (
                          <TableCell
                            style={{
                              whiteSpace: "nowrap",
                              verticalAlign: "top",
                            }}
                            rowSpan={qty}
                          >
                            {brand.label}
                          </TableCell>
                        )}
                        {k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={qty}
                          >
                            {partcode.model}
                          </TableCell>
                        )}
                        {k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={qty}
                          >
                            {price}
                          </TableCell>
                        )}
                        {k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={qty}
                          >
                            {warranty_period} months
                          </TableCell>
                        )}
                        {k3 === 0 && (
                          <TableCell
                            sx={{ whiteSpace: "nowrap", verticalAlign: "top" }}
                            rowSpan={qty}
                          >
                            {partcode.desc}
                          </TableCell>
                        )}
                        {k2 === 0 && k3 === 0 && (
                          <TableCell
                            sx={{ verticalAlign: "top" }}
                            rowSpan={totalRowCount}
                          >
                            {comments}
                          </TableCell>
                        )}
                      </TableRow>
                    ));
                  });
                })}
                {!rows || rows.length < 1 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No records found</TableCell>
                  </TableRow>
                ) : (
                  false
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          count={-1}
          onPageChange={(_, page) =>
            setUrlParams((params) => ({ ...params, page: Number(page) + 1 }))
          }
          page={urlParams.page - 1}
          rowsPerPage={urlParams.limit}
        />
      </Grid>
    </>
  );
}

export default withLayout(Orders);
