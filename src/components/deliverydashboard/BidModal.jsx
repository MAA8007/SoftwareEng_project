// src/components/deliverydashboard/BidModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  InputAdornment,
  Box,
  IconButton,
  createTheme,     // Only needed if theme is NOT provided by parent
  ThemeProvider,   // Only needed if theme is NOT provided by parent
  CssBaseline      // Only needed if theme is NOT provided by parent
} from "@mui/material";

// Import Icons
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import GavelIcon from '@mui/icons-material/Gavel';
import CloseIcon from '@mui/icons-material/Close';

// --- Black and White Theme (SHOULD BE PROVIDED BY PARENT/APP) ---
// Define it here ONLY if the parent component doesn't wrap this modal in a ThemeProvider
// It's better practice to have a single ThemeProvider higher up in your App.
const theme = createTheme({
    palette: {
      mode: 'light', primary: { main: '#000000' }, secondary: { main: '#ffffff' },
      background: { default: '#f5f5f5', paper: '#ffffff' }, text: { primary: '#000000', secondary: '#555555' },
      error: { main: '#d32f2f' }, success: { main: '#2e7d32'}, warning: { main: '#ed6c02'}, info: { main: '#0288d1'},
      action: { active: 'rgba(0, 0, 0, 0.54)' }
    },
    typography: { fontFamily: 'Roboto, Arial, sans-serif', h6: { fontWeight: 600 }, button: { textTransform: 'none' },},
    components: {
      MuiButton: { styleOverrides: { root: { '&.MuiButton-containedPrimary': { color: '#ffffff' }, paddingTop: '8px', paddingBottom: '8px', } } },
      MuiDialogTitle: { styleOverrides: { root: { borderBottom: '1px solid #e0e0e0', paddingBottom: '12px' } } },
      MuiDialogActions: { styleOverrides: { root: { borderTop: '1px solid #e0e0e0', paddingTop: '16px', padding: '16px 24px' } } },
       MuiTextField: { defaultProps: { margin: "dense", variant: "outlined", } }
    }
  });

// --- Bid Modal Component ---
// Props: open (boolean), onClose (function), request (object), deliveryPersonId (string)
export default function BidModal({ open, onClose, request, deliveryPersonId }) {
  const [price, setPrice] = useState("");
  const [eta, setEta] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when the modal opens or request changes
  useEffect(() => {
    if (open) {
      setPrice("");
      setEta("");
      setLoading(false);
    }
  }, [open]);

  // Handle bid submission
  const handleSubmit = async () => {
    // Basic Validation
    if (!price || !eta) {
      toast.warn("Please enter both price and ETA.");
      return;
    }
     if (isNaN(price) || Number(price) <= 0) {
         toast.warn("Please enter a valid positive price.");
         return;
     }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5001/api/requests/${request._id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            deliveryPerson: deliveryPersonId,
            price: Number(price), // Ensure price is sent as a number
            eta
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Bid submitted successfully!");
        onClose(); // Close modal on success
      } else {
        toast.error(data.msg || "Error submitting bid. Please try again.");
      }
    } catch (err) {
      console.error("Submit bid error:", err);
      toast.error("An unexpected error occurred while submitting the bid.");
    } finally {
      setLoading(false);
    }
  };

  // Render null if request object isn't ready (prevents errors)
  if (!request) {
      // Keep the modal structure but show an error or loading inside?
      // Or simply return null if the parent shouldn't have opened it without a request.
      return null;
  }

  return (
    // Remove this ThemeProvider if your App already provides one globally
    <ThemeProvider theme={theme}>
        {/* <CssBaseline /> */} {/* Usually not needed inside a modal if app has it */}
      <Dialog
        open={open}
        onClose={onClose} // Allows closing by clicking backdrop
        aria-labelledby="bid-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="bid-dialog-title">
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <Box sx={{ display: 'flex', alignItems: 'center'}}>
                Place Your Bid
             </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers> {/* Add dividers prop for content separators */}
          <DialogContentText sx={{ mb: 2 }}> {/* Add margin bottom */}
            For request: <strong>{request.pickup}</strong> → <strong>{request.destination}</strong>
          </DialogContentText>

          {/* Form Fields */}
          <TextField
            required
            fullWidth
            id="price"
            label="Your Bid Price (Rs)"
            name="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOfferIcon color="action" />
                </InputAdornment>
              ),
              inputProps: { min: 0.01, step: "0.01" } // Example: allow cents, prevent zero/negative
            }}
          />
          <TextField
            required
            fullWidth
            id="eta"
            label="Estimated Time of Arrival (ETA)"
            name="eta"
            type="text"
            placeholder="e.g., 15 mins, 1 hour"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions> {/* Actions are automatically spaced */}
          <Button
             onClick={onClose}
             variant="outlined"
             color="primary"
             startIcon={<CancelIcon />}
             disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            {loading ? "Submitting..." : "Submit Bid"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}