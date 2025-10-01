import React, { useState } from "react";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

export default function ConfirmDialog({ title, content, open, onCancel, onConfirm }) {
  const [loading, setLoading] = useState(false);
  
  return (
    <Dialog open={open} onClose={() => onCancel()}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onCancel()}>Cancel</Button>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Button
            color="error"
            onClick={() => {
              try {
                setLoading(true);
                onDelete()
              } finally {
                setLoading(false);
              }
            }}
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
