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
import PartCodeAddButton from "./add-btn";
import { getListPartCodeError, getListPartCodeSuccess, isRequestingListPartCode } from "@state/partcode/list/selectors";
import { listPartCode, listPartCodeError, listPartCodeSuccess } from "@state/partcode/list/slice";
import api from "@utils/api";
import { defaultFormErrorHandler } from "@utils/form-error-helper";
import Loading from "@components/loading";
import DocumentHead from "@components/document-head";

function PartCodes() {
  const dispatch = useDispatch();
  const requesting = useSelector(isRequestingListPartCode);
  const rows = useSelector(getListPartCodeSuccess);
  const error = useSelector(getListPartCodeError);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    dispatch(listPartCode());
    //   await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      const response = await api.get("/partcodes/list");
      dispatch(listPartCodeSuccess(response.data.output));
    } catch (err) {
      dispatch(listPartCodeError(defaultFormErrorHandler(err)));
    }
  };

  return (
    <>
      <DocumentHead title="Part Codes" />
      <AppBarTitle title="Part Codes" />
      <PartCodeAddButton refreshPartCodes={init} />
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Title>Part Codes</Title>
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
                    <TableCell>Part Code</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Description</TableCell>
                    {/* <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, k) => (
                    <TableRow key={k}>
                      <TableCell>{row.code}</TableCell>
                      <TableCell>{row.brand}</TableCell>
                      <TableCell>{row.model}</TableCell>
                      <TableCell>{row.desc}</TableCell>
                      {/* <TableCell>{format(parseISO(row.created_at), "PPpp")}</TableCell>
                    <TableCell>{format(parseISO(row.updated_at), "PPpp")}</TableCell> */}
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

export default withLayout(PartCodes);
