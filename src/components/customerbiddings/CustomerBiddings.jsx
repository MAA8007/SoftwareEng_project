// src/components/customerbiddings/CustomerBiddings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, // Optional: if you want consistent max-width/centering
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
  CircularProgress, // For loading state
  Alert,          // For error messages
  Divider,        // To separate bid items visually
  createTheme,    // Reuse or import the theme
  ThemeProvider,  // Apply the theme
  CssBaseline
} from "@mui/material";

// --- Black and White Theme (Ideally import from a shared file) ---
// Reuse the exact same theme definition as in LoginPage.jsx for consistency
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#555555',
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h5: {
      fontWeight: 600,
    },
     h6: {
      fontWeight: 500, // Adjust title weight
    },
    button: {
      textTransform: 'none',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { // Ensure high contrast for primary contained button
          color: '#ffffff',
        }
      }
    },
    MuiPaper: { // Style for bid items
        styleOverrides: {
            root: {
                marginBottom: '16px', // theme.spacing(2)
                padding: '16px',     // theme.spacing(2)
            }
        }
    }
  }
});

// --- Customer Biddings Component ---
export default function CustomerBiddings() {
  const [bids, setBids] = useState([]);
  const [requestId, setRequestId] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  const [errorRequests, setErrorRequests] = useState(null);
  const [errorBids, setErrorBids] = useState(null);
  const [selectingBidId, setSelectingBidId] = useState(null); // Track which bid is being selected

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Effect to fetch active user request
  useEffect(() => {
    if (!userId) {
      setErrorRequests("User not identified. Please log in.");
      setLoadingRequests(false);
      // Optional: redirect to login
      // navigate('/login');
      return;
    }

    setLoadingRequests(true);
    setErrorRequests(null);
    fetch(`http://localhost:5001/api/requests/user/${userId}`) // Assuming endpoint structure
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch requests");
        return res.json();
        })
      .then((requests) => {
        const active = requests.find((req) => req.status === "active" || req.status === "pending"); // Check for active or pending requests
        if (active) {
          setRequestId(active._id);
          // Now trigger fetching bids inside another effect dependent on requestId
        } else {
          // Handle case where there's no active request
          setRequestId(null); // Ensure requestId is null if no active request found
          setBids([]); // Clear any previous bids
        }
      })
      .catch((err) => {
        console.error("Error fetching user requests", err);
        setErrorRequests(err.message || "Could not load your delivery requests.");
      })
      .finally(() => {
        setLoadingRequests(false);
      });
  }, [userId]); // Dependency: userId

  // Effect to fetch bids when requestId is available
  useEffect(() => {
    if (!requestId) {
      setLoadingBids(false); // Not loading if there's no request ID
      return; // Don't fetch if there's no active request ID
    }

    setLoadingBids(true);
    setErrorBids(null);
    setBids([]); // Clear previous bids before fetching new ones

    fetch(`http://localhost:5001/api/requests/${requestId}/bids`)
      .then((res) => {
           if (!res.ok) throw new Error("Failed to fetch bids");
           return res.json();
           })
      .then((data) => {
        setBids(data);
      })
      .catch((err) => {
        console.error("Error fetching bids", err);
        setErrorBids(err.message || "Could not load bids for your request.");
      })
      .finally(() => {
        setLoadingBids(false);
      });
  }, [requestId]); // Dependency: requestId

  const handleSelectBid = (bidId) => {
    if (!requestId || !userId) return;
    setSelectingBidId(bidId); // Set loading state for this specific button

    fetch("http://localhost:5001/api/requests/select-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, bidId }), // Ensure API expects userId or uses authentication context
    })
      .then((res) => {
          if (!res.ok) return res.json().then(err => {throw new Error(err.msg || "Failed to select bid")});
          return res.json();
      })
      .then((data) => {
        // Use a more user-friendly notification system if available (like Snackbar)
        alert("Bid selected successfully!"); // Replace with Snackbar later
        navigate("/customer-dashboard"); // Navigate to dashboard or relevant page
      })
      .catch((err) => {
        console.error("Error selecting bid:", err);
        // Use Snackbar or a better alert system
        alert(`Failed to select bid: ${err.message}`);
      })
      .finally(() => {
        setSelectingBidId(null); // Reset loading state for the button
      });
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (loadingRequests) {
      return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    }
    if (errorRequests) {
      return <Alert severity="error" sx={{ mt: 2 }}>{errorRequests}</Alert>;
    }
    if (!requestId) {
      return <Typography sx={{ mt: 2, textAlign: 'center' }}>You have no active delivery requests.</Typography>;
    }
    if (loadingBids) {
      return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    }
    if (errorBids) {
      return <Alert severity="error" sx={{ mt: 2 }}>{errorBids}</Alert>;
    }
    if (bids.length === 0) {
      return <Typography sx={{ mt: 2, textAlign: 'center' }}>No bids submitted for your request yet.</Typography>;
    }

    // Display Bids
    return (
      <List>
        {bids.map((bid) => (
          <Paper key={bid._id} elevation={2}> {/* Wrap each bid in Paper */}
             <ListItem
                secondaryAction={ // Place button on the right
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleSelectBid(bid._id)}
                    disabled={selectingBidId === bid._id} // Disable button while processing this bid
                  >
                    {selectingBidId === bid._id ? <CircularProgress size={20} color="inherit"/> : 'Accept Bid'}
                  </Button>
                }
             >
               <ListItemText
                  primary={`Bidder: ${bid.deliveryPersonId?.username || 'Unknown User'}`} // Display bidder username if available
                  secondary={
                    <>
                        <Typography component="span" variant="body2" color="text.primary">
                            Price: Rs {bid.price}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                            Estimated Time (ETA): {bid.eta}
                         </Typography>
                    </>
                    }
               />
             </ListItem>
           </Paper>
        ))}
      </List>
    );
  };

  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
         {/* Use Container if you want max-width and centering for the whole page */}
        {/* <Container maxWidth="md" sx={{ py: 4 }}> */}
            <Box sx={{ p: 3 }}> {/* Add padding around the content */}
              <Typography variant="h6" gutterBottom component="h2">
                📨 Incoming Bids for Your Request
              </Typography>
              {renderContent()}
            </Box>
        {/* </Container> */}
    </ThemeProvider>
  );
}