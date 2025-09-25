import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
} from "@mui/material";

export default function ConsentDialog({ open, onClose, onAccept }) {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    if (checked) {
      onAccept();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Terms and Conditions</DialogTitle>
      <DialogContent dividers>
        {/* Scrollable terms section */}
        <Box
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" paragraph>
            Welcome to our service! By subscribing, you agree to the following terms:
          </Typography>
          <Typography variant="body2" paragraph>
            1. Subscriptions renew automatically unless canceled before the renewal date.
          </Typography>
          <Typography variant="body2" paragraph>
            2. You are responsible for keeping your payment information up to date.
          </Typography>
          <Typography variant="body2" paragraph>
            3. Refunds are handled according to our refund policy.
          </Typography>
          <Typography variant="body2" paragraph>
            4. We reserve the right to update these terms, and you will be notified of changes.
          </Typography>
          {/* Add more paragraphs as needed */}
        </Box>

        <FormControlLabel
          sx={{ mt: 2 }}
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
          }
          label="I have read and agree to the Terms and Conditions"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAccept}
          disabled={!checked}
          variant="contained"
          color="primary"
        >
          Accept & Subscribe
        </Button>
      </DialogActions>
    </Dialog>
  );
}
