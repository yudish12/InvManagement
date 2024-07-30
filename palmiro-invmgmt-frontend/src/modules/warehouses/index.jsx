import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";

import { withLayout } from "@layout/layout";
import AppBarTitle from "@components/app-bar-title";
import Title from "@components/title";
import WarehousesAddButton from "./add-btn";
import { getListWarehousesError, getListWarehousesSuccess, isRequestingListWarehouses } from "@state/warehouses/list/selectors";
import { listWarehouses, listWarehousesError, listWarehousesSuccess } from "@state/warehouses/list/slice";
import api from "@utils/api";
import { defaultFormErrorHandler } from "@utils/form-error-helper";
import Loading from "@components/loading";
import DocumentHead from "@components/document-head";

function Warehouses() {
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingListWarehouses);
  const rows = useSelector(getListWarehousesSuccess);
  const error = useSelector(getListWarehousesError);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    dispatch(listWarehouses());
    //   await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      const response = await api.get("/warehouses/list");
      dispatch(listWarehousesSuccess(response.data.output));
    } catch (err) {
      dispatch(listWarehousesError(defaultFormErrorHandler(err)));
    }
  };

  return (
    <>
      <DocumentHead title="Warehouses" />
      <AppBarTitle title="Warehouses" />
      <WarehousesAddButton refreshList={init} />
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Title>Warehouses</Title>
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
                    <TableCell>Sr. No.</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, k) => (
                    <TableRow key={k}>
                      <TableCell>{k + 1}</TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell>{row.desc}</TableCell>
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
        </Paper>
      </Grid>
    </>
  );
}

export default withLayout(Warehouses);
