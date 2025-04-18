// src/components/customerdashboard/CustomerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  // Divider, // Divider import seems unused currently
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Grid,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

// Import Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// --- Socket Setup ---
const socket = io("http://localhost:5001", { /* options */ });

// --- Black and White Theme (Ideally import from a shared file) ---
const theme = createTheme({
    palette: { /* ...theme palette... */
        mode: 'light', primary: { main: '#000000' }, secondary: { main: '#ffffff' },
        background: { default: '#f5f5f5', paper: '#ffffff' }, text: { primary: '#000000', secondary: '#555555' },
        error: { main: '#d32f2f' }, success: { main: '#2e7d32'}, warning: { main: '#ed6c02'}, info: { main: '#0288d1'},
        action: { active: 'rgba(0, 0, 0, 0.54)' }
     },
    typography: { /* ...theme typography... */
        fontFamily: 'Roboto, Arial, sans-serif', h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { textTransform: 'none' }, body1: { }, body2: { fontSize: '0.875rem' },
     },
    components: { /* ...theme components... */
        MuiButton: { styleOverrides: { root: { '&.MuiButton-containedPrimary': { color: '#ffffff' }, paddingTop: '10px', paddingBottom: '10px', } } },
        MuiPaper: { styleOverrides: { root: { padding: '24px', marginBottom: '24px', borderRadius: '8px', } } },
        MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
        MuiListItem: { styleOverrides: { root: { paddingTop: '16px', paddingBottom: '16px', } } }
    }
});

// --- Customer Dashboard Component ---
function CustomerDashboard() {
  const [activeRequest, setActiveRequest] = useState(null);
  const [pastRequests, setPastRequests] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedBidDetails, setSelectedBidDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingBidId, setAcceptingBidId] = useState(null);

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // *** MODIFIED fetchRequests ***
  const fetchRequests = useCallback(async () => {
    setError(null);
    if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
    }
    try {
        const res = await fetch(`http://localhost:5001/api/requests/user/${userId}`);
        if (!res.ok) throw new Error(`Failed to fetch requests (${res.status})`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid data format received.");

        // ----- CORRECTED LOGIC START -----
        // Define statuses considered "finished" from the customer's view
        const finishedStatuses = ["completed", "canceled", "delivered"];

        // Find the first request whose status is NOT in the finished list
        const currentActive = data.find((r) => !finishedStatuses.includes(r.status));

        // Filter for requests whose status IS in the finished list (or just completed if preferred)
        // Let's include delivered and canceled in the past list for completeness
        const finishedList = data.filter((r) => finishedStatuses.includes(r.status));
        // ----- CORRECTED LOGIC END -----


        setActiveRequest(currentActive);
        setPastRequests(finishedList); // Use the new filtered list
        setBids([]); // Reset bids specific to active request
        setSelectedBidDetails(null); // Reset selected bid specific to active request

        // Only fetch bids / set selected bid if there IS an active request
        if (currentActive) {
            // Check if a bid is selected in the active request
            if (currentActive.selectedBid && currentActive.bids?.length > 0) {
                const foundSelectedBid = currentActive.bids.find(b => b._id === currentActive.selectedBid);
                setSelectedBidDetails(foundSelectedBid || null);
            }
            // If no bid is selected in the active request, fetch incoming bids for it
            if (!currentActive.selectedBid) {
                try {
                    const bidRes = await fetch(`http://localhost:5001/api/requests/${currentActive._id}/bids`);
                    if (!bidRes.ok) throw new Error(`Failed to fetch bids (${bidRes.status})`);
                    const bidData = await bidRes.json();
                    setBids(Array.isArray(bidData) ? bidData : []);
                } catch (bidErr) { console.error("Error fetching bids:", bidErr); setBids([]); }
            }
        }
    } catch (err) {
        console.error("Error fetching requests:", err);
        setError(err.message || "Could not load dashboard data.");
        setActiveRequest(null); setPastRequests([]); setBids([]); setSelectedBidDetails(null);
    } finally {
        if (loading) setLoading(false);
    }
  }, [userId, loading]);


  const handleAcceptBid = async (bidId) => { /* ... accept bid logic (unchanged) ... */
    if (!activeRequest?._id || !userId) return;
    setAcceptingBidId(bidId);
    try {
        const res = await fetch("http://localhost:5001/api/requests/select-bid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, bidId }), });
        const data = await res.json();
        if (res.ok) { toast.success("Bid accepted!"); fetchRequests(); }
        else { toast.error(data.msg || "Failed to accept bid"); }
    } catch (err) { toast.error("Error accepting bid. Please try again."); console.error("Accept bid error:", err); }
    finally { setAcceptingBidId(null); }
  };

  // --- useEffect for socket listeners (unchanged) ---
  useEffect(() => {
    fetchRequests();
    const handleUpdate = () => { console.log("Socket event received, re-fetching requests..."); fetchRequests(); };
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));
    socket.on("connect_error", (err) => console.error("Socket connection error:", err));
    socket.on("new_bid", handleUpdate);
    socket.on("request_status_updated", handleUpdate);
    return () => {
        console.log("Cleaning up socket listeners");
        socket.off("connect"); socket.off("disconnect"); socket.off("connect_error");
        socket.off("new_bid", handleUpdate); socket.off("request_status_updated", handleUpdate);
    };
  }, [fetchRequests]); // Dependency only on fetchRequests

  // --- getStatusChipColor (unchanged) ---
  const getStatusChipColor = (status) => {
      switch (status) { /* ... case statements ... */
          case 'pending': return 'warning'; case 'active': return 'info'; case 'in_progress': return 'info'; // Assuming in_progress exists
          case 'delivered': return 'success'; case 'completed': return 'success'; case 'canceled': return 'error'; default: return 'default';
      }
  };

  // --- Loading/Error Render (unchanged) ---
  if (loading) { /* ... loading JSX ... */
     return ( <ThemeProvider theme={theme}> <CssBaseline /> <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}> <CircularProgress /> <Typography sx={{ mt: 2 }}>Loading your dashboard...</Typography> </Container> </ThemeProvider> );
   }
  if (error) { /* ... error JSX ... */
      return ( <ThemeProvider theme={theme}> <CssBaseline /> <Container maxWidth="md" sx={{ py: 4 }}> <Alert severity="error">{error}</Alert> </Container> </ThemeProvider> );
  }

  // --- Main Render ---
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Main dashboard title commented out, restore if needed */}
        {/* <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>Your Dashboard</Typography> */}

        {/* Active Request Section */}
        <Paper elevation={4}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3 }}>
            {/* Title changes based on whether there IS an active request */}
            {activeRequest ? "Active Delivery Request" : "Make a New Request"}
          </Typography>
          {activeRequest ? (
            // Display active request details
            <Box>
                {/* ... Location/Destination/Status details ... */}
                <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon color="action" sx={{ mr: 1.5 }} />
                    <strong style={{ minWidth: '50px' }}>From:</strong> {activeRequest.pickup}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DirectionsIcon color="action" sx={{ mr: 1.5 }} />
                    <strong style={{ minWidth: '50px' }}>To:</strong> {activeRequest.destination}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}><strong style={{ minWidth: '50px' }}>Status:</strong></Typography>
                    <Chip label={activeRequest.status.replace(/_/g, ' ').toUpperCase()} color={getStatusChipColor(activeRequest.status)} size="small" />
                </Box>

              {/* Accepted Bid Display or Incoming Bids Display */}
              {selectedBidDetails ? (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2.5, mt: 3, backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900] }}>
                  {/* ... Accepted Bid details ... */}
                   <Typography variant="subtitle1" component="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2 }}>
                       <CheckCircleIcon color="success" sx={{ mr: 1 }}/> Accepted Bid
                   </Typography>
                   {/* ... Person/Price/ETA lines ... */}
                   <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> <PersonIcon fontSize="small" color="action" sx={{ mr: 1.5 }} /> <strong>Delivery Person:</strong>&nbsp;{selectedBidDetails.deliveryPersonId?.username || 'N/A'} </Typography>
                   <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> <LocalOfferIcon fontSize="small" color="action" sx={{ mr: 1.5 }} /> <strong>Price:</strong>&nbsp;Rs {selectedBidDetails.price} </Typography>
                   <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}> <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1.5 }} /> <strong>ETA:</strong>&nbsp;{selectedBidDetails.eta} </Typography>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                   {/* ... Incoming Bids List ... */}
                    <Typography variant="subtitle1" component="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}> <ReceiptLongIcon color="action" sx={{ mr: 1 }} /> Incoming Bids </Typography>
                    {bids.length === 0 ? ( <Typography color="text.secondary" sx={{ pl: 1, pt: 1 }}>No bids submitted yet.</Typography> ) : (
                        <List disablePadding sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            {bids.map((bid, index) => (
                                <ListItem key={bid._id} divider={index < bids.length - 1} secondaryAction={ <Button variant="outlined" size="small" color="primary" onClick={() => handleAcceptBid(bid._id)} disabled={acceptingBidId === bid._id} sx={{ ml: 1}}> {acceptingBidId === bid._id ? <CircularProgress size={20} color="inherit" /> : 'Accept'} </Button> } >
                                    <ListItemText primary={ <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}> <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} /> <Typography variant="body2" component="span"> {bid.deliveryPersonId?.username || 'Unknown Bidder'} </Typography> </Box> } secondary={ <Stack direction="row" spacing={2} sx={{ pl: 4 }}> <Box sx={{ display: 'flex', alignItems: 'center' }}> <LocalOfferIcon fontSize="small" color="action" sx={{ mr: 0.5 }} /> <Typography component="span" variant="body2" color="text.primary"> Rs {bid.price} </Typography> </Box> <Box sx={{ display: 'flex', alignItems: 'center' }}> <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} /> <Typography component="span" variant="body2" color="text.secondary"> {bid.eta} </Typography> </Box> </Stack> } />
                                </ListItem>
                            ))}
                        </List>
                     )}
                </Box>
              )}
            </Box>
          ) : (
            // No Active Request - Show Button
            <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    You don't have any active delivery requests right now.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => navigate("/customer-requests")} // Ensure route exists
                >
                    Make a Delivery Request
                </Button>
            </Box>
          )}
        </Paper>

        {/* Past Deliveries Section */}
        <Paper elevation={4}>
           {/* ... Past Deliveries Title ... */}
            <Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}> <HistoryIcon color="action" sx={{ mr: 1 }} /> Past Deliveries </Typography>
          {pastRequests.length === 0 ? (
             // ... No past deliveries message ...
              <Typography color="text.secondary" sx={{ pl: 1, pt: 1 }}>No past deliveries found.</Typography>
          ) : (
              // ... Past deliveries list ...
            <List disablePadding>
              {pastRequests.map((req, index) => (
                <ListItem key={req._id} divider={index < pastRequests.length - 1}>
                  <ListItemText
                    primary={`${req.pickup} → ${req.destination}`}
                    // Display status clearly (e.g., Delivered, Completed, Canceled)
                    secondary={`Status: ${req.status.charAt(0).toUpperCase() + req.status.slice(1)} on ${new Date(req.updatedAt || req.createdAt).toLocaleDateString()}`}
                  />
                   <Chip label={req.status.charAt(0).toUpperCase() + req.status.slice(1)} color={getStatusChipColor(req.status)} size="small" icon={<CheckCircleIcon fontSize="small" />} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

      </Container>
    </ThemeProvider>
  );
}

export default CustomerDashboard;