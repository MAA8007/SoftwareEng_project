// src/components/customerrequests/CustomerRequests.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Box,
  Typography,
  TextField, // Replaces input/textarea
  Button,
  Paper,
  CircularProgress, // For loading state
  Alert,          // For error display
  InputAdornment, // To add icons inside TextFields
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

// Import Icons
import MyLocationIcon from '@mui/icons-material/MyLocation'; // For Pickup
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'; // For Dorm/Destination
import DescriptionIcon from '@mui/icons-material/Description'; // For Description
import SendIcon from '@mui/icons-material/Send'; // For Submit Button
import EditNoteIcon from '@mui/icons-material/EditNote'; // For Page Title

// --- Black and White Theme (Ideally import from a shared file) ---
// Reuse the exact same theme definition for consistency
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#000000' },
    secondary: { main: '#ffffff' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#000000', secondary: '#555555' },
    error: { main: '#d32f2f' },
    success: { main: '#2e7d32'},
    warning: { main: '#ed6c02'},
    info: { main: '#0288d1'},
    action: { active: 'rgba(0, 0, 0, 0.54)' }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none' },
  },
  components: {
    MuiButton: {
        styleOverrides: {
            root: {
                 '&.MuiButton-containedPrimary': { color: '#ffffff' },
                 paddingTop: '10px',
                 paddingBottom: '10px',
            }
        }
    },
    MuiPaper: {
        styleOverrides: {
             root: {
                 padding: '32px', // theme.spacing(4) increased padding
                 marginBottom: '24px',
                 borderRadius: '8px',
             }
        }
    },
    MuiTextField: { // Ensure consistent margin for TextFields
        defaultProps: {
            margin: "normal", // Applies margin="normal" by default
            variant: "outlined", // Use outlined variant by default
        }
    }
  }
});

// --- Customer Requests Component ---
function CustomerRequests() {
  const [pickup, setPickup] = useState("");
  const [dorm, setDorm] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for submission

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Start loading

    if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
    }

    // Basic validation
    if (!pickup || !dorm || !description) {
        setError("All fields are required.");
        setLoading(false);
        return;
    }


    try {
      const res = await fetch("http://localhost:5001/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          pickup,
          destination: dorm, // API expects 'destination'
          description
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Try to use the error message from the backend response
        throw new Error(data.msg || `Request failed with status ${res.status}`);
      }

      toast.success("Delivery request submitted successfully!");
      navigate("/customer-dashboard"); // Navigate back to dashboard on success

    } catch (err) {
      console.error("Submit request error:", err);
      // Display specific error from backend if available, otherwise generic
      setError(err.message || "Failed to submit request. Please try again.");
      toast.error(err.message || "Failed to submit request."); // Also show toast error
    } finally {
        setLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="sm" sx={{ py: 4 }}> {/* Use 'sm' for forms */}
        <Paper elevation={4}> {/* Increased elevation */}
           <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EditNoteIcon color="action" sx={{ mr: 1.5 }} />
               <Typography component="h1" variant="h5" color='black'>
                   Place a Delivery Request
               </Typography>
           </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate> {/* Add noValidate to rely on custom/backend validation */}
            <TextField
              // margin="normal" // Applied by default via theme
              required
              fullWidth
              id="pickup"
              label="Pickup Location"
              name="pickup"
              placeholder="e.g. Library Café, Admin Building Entrance" // Keep placeholder as extra hint
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              autoFocus // Focus the first field
              InputProps={{ // Add icon adornment
                startAdornment: (
                  <InputAdornment position="start">
                    <MyLocationIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              id="dorm"
              label="Destination (e.g., Dorm & Room)"
              name="dorm"
              placeholder="e.g. Smith Hall B-202, Main Quad Bench"
              value={dorm}
              onChange={(e) => setDorm(e.target.value)}
               InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MeetingRoomIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              id="description"
              label="Item Description"
              name="description"
              placeholder="e.g. 1 Large Coffee (Black), 2 Textbooks from reserve desk"
              multiline // Make it a textarea
              rows={4} // Set default height
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {error}
                </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading} // Disable button when loading
              sx={{ mt: 3, mb: 2 }}
              startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SendIcon />} // Show icon or spinner
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default CustomerRequests;