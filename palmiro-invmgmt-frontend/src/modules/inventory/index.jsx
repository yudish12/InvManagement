import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import { useDispatch, useSelector } from "react-redux";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";

import { withLayout } from "@layout/layout";
import AppBarTitle from "@components/app-bar-title";
import Title from "@components/title";
import api from "@utils/api";
import { defaultFormErrorHandler } from "@utils/form-error-helper";
import Loading from "@components/loading";
import {
  getListInventoryCount,
  getListInventoryError,
  getListInventorySuccess,
  isRequestingListInventory,
} from "@state/inventory/list/selectors";
import {
  listInventory,
  listInventoryError,
  listInventorySuccess,
} from "@state/inventory/list/slice";
import DocumentHead from "@components/document-head";
import ReturnInventoryButton from "./return-inventory-button";
import InventoryStatusChangeButton from "./inventory-status-change-btn";
import InventoryRevertStatusToOutwardButton from "./revert-status-to-outward-btn";
import { TablePagination } from "@mui/material";

export const inventoryStatusOptions = {
  inward: "Inward",
  outward: "Sold",
  "return-pending": "Pick up Return",
  "return-intransit": "Return Picked",
  returned: "Returned in Warehouse",
};

const LIMIT_PER_PAGE = 10;

function Inventory() {
  const [formData, setFormData] = useState({
    search: "",
    limit: LIMIT_PER_PAGE,
    page: 1,
  });
  const [urlParams, setUrlParams] = useState({
    search: "",
    limit: LIMIT_PER_PAGE,
    page: 1,
  });
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingListInventory);
  const rows = useSelector(getListInventorySuccess);
  const error = useSelector(getListInventoryError);
  const count = useSelector(getListInventoryCount);
  const { search, limit, page } = formData;

  useEffect(() => {
    init();
    console.log(urlParams, formData);
  }, [urlParams, formData]);

  const init = async () => {
    dispatch(listInventory());
    try {
      const response = await api.get(generateUrl());
      dispatch(listInventorySuccess(response.data.output));
    } catch (err) {
      dispatch(listInventoryError(defaultFormErrorHandler(err)));
    }
  };

  const generateUrl = () => {
    const params = {};
    if (urlParams.search.trim()) {
      params.search = urlParams.search.trim();
    }
    if (urlParams.page && urlParams.limit) {
      params.skip = (urlParams.page - 1) * urlParams.limit;
      params.limit = urlParams.limit;
    }
    let url = "/inventory/list";
    const keys = Object.keys(params);
    for (let i = 0; i < keys.length; i++) {
      url += i === 0 ? `?` : `&`;
      url += `${keys[i]}=${params[keys[i]]}`;
    }
    return url;
  };

  const handleSearchClick = (e) => {
    setUrlParams((params) => ({
      ...params,
      search: search,
      page: 1,
    }));
  };

  const onChange = (e) => {
    setFormData((formData) => ({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePageChange = (e, val) => {
    setFormData((formData) => ({
      ...formData,
      page: Number(val),
    }));
    setUrlParams((params) => ({
      ...params,
      page: Number(val),
    }));
  };

  const showRowActionButton = (row) => {
    const { status } = row;
    if (status === "outward") {
      return (
        <ReturnInventoryButton
          serialNumber={row.serial_number}
          refreshList={init}
        />
      );
    }
    if (["return-pending", "return-intransit", "returned"].includes(status)) {
      return (
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <InventoryRevertStatusToOutwardButton
            serialNumber={row.serial_number}
            refreshList={init}
          />
          <InventoryStatusChangeButton
            serialNumber={row.serial_number}
            refreshList={init}
            status={row.status}
          />
        </Box>
      );
    }
    return false;
  };

  return (
    <>
      <DocumentHead title="Inventory" />
      <AppBarTitle title="Inventory" />
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Title>Inventory</Title>
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
                label="Search Inventory by Serial Number"
                placeholder="E.g. UXVWNSI548320027180700"
                type="text"
                fullWidth
                variant="outlined"
                value={search}
                onChange={onChange}
                error={error?.field === "search"}
                helperText={error?.field === "search" && error?.message}
                disabled={requesting}
              />
              <Button
                variant="contained"
                onClick={handleSearchClick}
                sx={{ alignSelf: "center" }}
              >
                Search
              </Button>
            </Box>
          </Paper>
          {requesting && <Loading />}
          {error?.code === "FORM_ERROR" && (
            <Alert sx={{ mt: 3 }} severity="error">
              {error?.message ? error.message : "Something went wrong"}
            </Alert>
          )}
          {Array.isArray(rows) && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Actions</TableCell>
                    <TableCell>Sr. No</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell>Part Code</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Purchase Order Inv Number</TableCell>
                    <TableCell>Sales Order Inv Number</TableCell>
                    <TableCell>Returned from Inv Number</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, k) => (
                    <TableRow key={k}>
                      <TableCell>{showRowActionButton(row)}</TableCell>
                      <TableCell>{row.serial_number}</TableCell>
                      <TableCell>{row.warehouse?.label}</TableCell>
                      <TableCell>{row.partcode?.code}</TableCell>
                      <TableCell>{row.brand?.label}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>
                        {inventoryStatusOptions[row.status] || "-"}
                      </TableCell>
                      <TableCell>
                        {row.purchase_order?.invoice_number || "-"}
                      </TableCell>
                      <TableCell>
                        {row.sale_order?.invoice_number || "-"}
                      </TableCell>
                      <TableCell>
                        {row.sale_order_returned?.invoice_number || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
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
        </Paper>
      </Grid>
    </>
  );
}

export default withLayout(Inventory);
