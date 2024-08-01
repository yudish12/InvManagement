import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from "react-redux";

import { getDeleteOrderError, getDeleteOrderSuccess, isDeletingOrder } from "@state/orders/delete/selectors";
import api from "@utils/api";
import { deleteOrder, deleteOrderError, deleteOrderSuccess } from "@state/orders/delete/slice";
import { defaultFormErrorHandler } from "@utils/form-error-helper";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DeleteOrderButton({ orderId, refreshList, mode}) {
  const [showDialog, setShowDialog] = useState(false);
  const dispatch = useDispatch();
  const deleting = useSelector(isDeletingOrder(orderId));
  const success = useSelector(getDeleteOrderSuccess(orderId));
  const error = useSelector(getDeleteOrderError(orderId));

  const onClickDeleteOrder = async (e) => {
    e.preventDefault();
    if (deleting) {
      return;
    }
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  const handleConfirmDelete = async () => {
    handleClose();
    console.log(orderId);
    dispatch(deleteOrder({ orderId }));
    try {
      const response = await api.get(`/orders/delete/${orderId}?mode=${mode}`);
      dispatch(deleteOrderSuccess({ orderId}));
      refreshList();
    } catch (err) {
      dispatch(deleteOrderError({ orderId, error: defaultFormErrorHandler(err) }));
    }
  };

  return (
    <>
      {deleting && <CircularProgress color="primary" size={14} />}
      {!deleting && (
        <Tooltip title="Delete Order">
          <IconButton onClick={onClickDeleteOrder}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
      <Dialog open={showDialog} TransitionComponent={Transition} keepMounted onClose={handleClose} aria-describedby="alert-dialog-delete-order">
        <DialogTitle>{"Confirm Delete?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-delete-order">Are you sure you want to delete this order?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteOrderButton;
