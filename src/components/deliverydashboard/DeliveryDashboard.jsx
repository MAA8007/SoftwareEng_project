// src/components/deliverydashboard/DeliveryDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  IconButton, // Keep if needed, but Button is used for refresh
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

import BidModal from "./BidModal";

// Import Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckIcon from '@mui/icons-material/Check';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// --- Socket Setup ---
const socket = io("http://localhost:5001", { /* options */ });

// --- Black and White Theme (Assume provided globally or import) ---
const theme = createTheme({
    palette: { /* ...theme palette... */
        mode: 'light', primary: { main: '#000000' }, secondary: { main: '#ffffff' },
        background: { default: '#f5f5f5', paper: '#ffffff' }, text: { primary: '#000000', secondary: '#555555' },
        error: { main: '#d32f2f' }, success: { main: '#2e7d32'}, warning: { main: '#ed6c02'}, info: { main: '#0288d1'},
        action: { active: 'rgba(0, 0, 0, 0.54)' }
     },
    typography: { /* ...theme typography... */
        fontFamily: 'Roboto, Arial, sans-serif', h5: { fontWeight: 600 }, h6: { fontWeight: 600 }, button: { textTransform: 'none' },
     },
    components: { /* ...theme components... */
        MuiButton: { styleOverrides: { root: { '&.MuiButton-containedPrimary': { color: '#ffffff' }, padding: '6px 12px', } } },
        MuiPaper: { styleOverrides: { root: { padding: '24px', marginBottom: '24px', borderRadius: '8px', } } },
        MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
        MuiListItem: { styleOverrides: { root: { paddingTop: '16px', paddingBottom: '16px', } } }
    }
  });

// --- Delivery Dashboard Component ---
export default function DeliveryDashboard() {
  // --- State variables ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalRequest, setModalRequest] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const deliveryPersonId = localStorage.getItem("userId");

  // --- Callbacks and Effects (using corrected endpoint) ---
  const fetchRequests = useCallback(async () => { /* ...fetch logic... */
      setError(null);
      if (!deliveryPersonId) { setError("Delivery person ID not found..."); if(loading) setLoading(false); return; }
      try {
          const res = await fetch(`http://localhost:5001/api/requests/active?deliveryPersonId=${deliveryPersonId}`); // Corrected endpoint
          if (!res.ok) { throw new Error(`Failed to fetch requests (${res.status})`); }
          const data = await res.json();
          if (!Array.isArray(data)) { throw new Error("Invalid data format received."); }
          setRequests(data);
      } catch (err) { setError(err.message || "Could not load requests."); setRequests([]); }
      finally { if (loading) setLoading(false); }
  }, [deliveryPersonId, loading]);

  const updateStatus = async (requestId, newStatus) => { /* ...update status logic... */
      setUpdatingStatusId(requestId);
      try {
          const res = await fetch(`http://localhost:5001/api/requests/${requestId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus, deliveryPersonId: deliveryPersonId }), });
          const data = await res.json();
      }
      finally { setUpdatingStatusId(null); }
  };

  useEffect(() => { /* ...socket effect logic... */
      fetchRequests();
      const handleUpdate = () => fetchRequests();
      socket.on("connect", () => console.log("Socket connected:", socket.id)); socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason)); socket.on("connect_error", (err) => console.error("Socket connection error:", err));
      socket.on("new_request", handleUpdate); socket.on("bid_accepted", handleUpdate); socket.on("request_status_updated", handleUpdate);
      return () => { socket.off("connect"); socket.off("disconnect"); socket.off("connect_error"); socket.off("new_request", handleUpdate); socket.off("bid_accepted", handleUpdate); socket.off("request_status_updated", handleUpdate); };
  }, [fetchRequests]);

  const openModalForRequest = (request) => { setModalRequest(request); setShowModal(true); };
  const closeModal = () => { setModalRequest(null); setShowModal(false); fetchRequests(); };

  // --- Filtering Logic ---
  const assignedRequests = requests.filter( r => r.assignedDeliveryPerson === deliveryPersonId && r.status !== 'completed' && r.status !== 'canceled');
  const availableRequests = requests.filter( r => (r.status === 'pending' || r.status === 'active') && (!r.assignedDeliveryPerson || r.assignedDeliveryPerson !== deliveryPersonId));

  // --- Helper Functions ---
  const getStatusChipColor = (status) => { /* ...chip color logic... */
      switch (status) { case 'pending': return 'warning'; case 'active': return 'default'; case 'confirmed': return 'info'; case 'picked_up': return 'info'; case 'on_the_way': return 'info'; case 'delivered': return 'success'; case 'completed': return 'success'; case 'canceled': return 'error'; default: return 'default'; }
   };
  const getNextStatusButton = (req) => { /* ...status button logic... */
      const isLoading = updatingStatusId === req._id;
      const buttonProps = { variant: "contained", size: "small", disabled: isLoading, sx: { mt: 1 } };
      switch (req.status) {
          case "confirmed": return <Button {...buttonProps} startIcon={isLoading ? <CircularProgress size={16} color="inherit"/> : <CheckIcon fontSize="small" />} onClick={() => updateStatus(req._id, "picked_up")}>Mark Picked Up</Button>;
          case "picked_up": return <Button {...buttonProps} startIcon={isLoading ? <CircularProgress size={16} color="inherit"/> : <CheckIcon fontSize="small" />} onClick={() => updateStatus(req._id, "delivered")}>Mark Delivered</Button>;
          default: return null;
      }
   };

  // --- Render Logic ---
  if (loading) { /* ...loading indicator... */
    return ( <ThemeProvider theme={theme}> <CssBaseline /> <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}> <CircularProgress /> <Typography sx={{ mt: 2 }}>Loading delivery dashboard...</Typography> </Container> </ThemeProvider> );
  }
  if (error) { /* ...error alert... */
     return ( <ThemeProvider theme={theme}> <CssBaseline /> <Container maxWidth="lg" sx={{ py: 4 }}> <Alert severity="error">{error}</Alert> </Container> </ThemeProvider> );
  }

  // --- Main Render ---
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* ** HEADER with improved alignment ** */}
        <Box sx={{ display: 'flex', flexDirection: 'column',  justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
             {/* Wrap title and icon together for better alignment control */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DashboardIcon sx={{ mr: 1.5, fontSize: '2rem', color: 'action.active'}} />
                <Typography variant="h5" component="h1" color="black">
                    Delivery Dashboard
                </Typography>
            </Box>
            <Button
                variant="outlined"
                size="medium"
                onClick={fetchRequests}
                startIcon={<RefreshIcon />}
            >
                Refresh
            </Button>
        </Box>

        {/* Assigned Deliveries Section */}
        <Box mb={5}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentTurnedInIcon sx={{ mr: 1 }} /> Assigned Deliveries
            </Typography>
             {/* ** Grid container for equal height cards ** */}
             {assignedRequests.length === 0 ? (
                    <Grid item xs={12}> {/* Span full width if empty */}
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: theme.palette.grey[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <InfoOutlinedIcon sx={{ mr: 1, color: 'text.secondary'}} />
                            <Typography color="text.secondary">No deliveries currently assigned to you.</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    assignedRequests.map((req) => (
                        // ** Grid item **
                        <Grid item xs={12} sm={6} md={4} key={req._id}>
                            {/* ** Paper with flex column and height 100% ** */}
                            <Paper elevation={4} sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* ** Stack grows to push actions down ** */}
                                <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                        <LocationOnIcon fontSize="small" sx={{ mr: 1 }} /> {req.pickup} <DirectionsIcon fontSize="small" sx={{ mx: 1 }} /> {req.destination}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'start', minHeight: '40px' /* Add min-height to description */ }}>
                                        <DescriptionIcon fontSize="small" sx={{ mr: 1, mt: 0.2 }} /> {req.description || "No description"}
                                    </Typography>
                                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                         <Typography variant="body2" sx={{ mr: 1 }}><strong>Status:</strong></Typography>
                                         <Chip label={(req.status || 'N/A').replace(/_/g, ' ').toUpperCase()} color={getStatusChipColor(req.status)} size="small" />
                                     </Box>
                                </Stack>
                                {/* ** Action Button Box at the bottom ** */}
                                <Box sx={{ textAlign: 'right', mt: 2 }}>
                                    {getNextStatusButton(req)}
                                </Box>
                            </Paper>
                        </Grid>
                    ))
                )}
        </Box>

        {/* Available Requests Section */}
        <Box>
            <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ListAltIcon sx={{ mr: 1 }} /> Available Requests for Bidding
            </Typography>
             {/* ** Grid container for equal height cards ** */}
             {availableRequests.length === 0 ? (
                     <Grid item xs={12}> {/* Span full width if empty */}
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: theme.palette.grey[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <InfoOutlinedIcon sx={{ mr: 1, color: 'text.secondary'}} />
                           <Typography color="text.secondary">No available requests matching your area right now.</Typography>
                       </Paper>
                    </Grid>
                ) : (
                    availableRequests.map((req) => (
                         // ** Grid item **
                         <Grid item xs={12} sm={6} md={4} key={req._id}>
                             {/* ** Paper with flex column and height 100% ** */}
                             <Paper elevation={4} sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                 {/* ** Stack grows to push actions down ** */}
                                <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                                     <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                        <LocationOnIcon fontSize="small" sx={{ mr: 1 }} /> {req.pickup} <DirectionsIcon fontSize="small" sx={{ mx: 1 }} /> {req.destination}
                                    </Typography>
                                     <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'start', minHeight: '40px' /* Add min-height to description */ }}>
                                        <DescriptionIcon fontSize="small" sx={{ mr: 1, mt: 0.2 }} /> {req.description || "No description"}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                         <Typography variant="body2" sx={{ mr: 1 }}><strong>Status:</strong></Typography>
                                         <Chip label={(req.status || 'N/A').replace(/_/g, ' ').toUpperCase()} color={getStatusChipColor(req.status)} size="small" />
                                     </Box>
                                </Stack>
                                 {/* ** Action Button Box at the bottom ** */}
                                <Box sx={{ textAlign: 'right', mt: 2 }}>
                                     <Button variant="outlined" size="small" color="primary" startIcon={<GavelIcon fontSize="small"/>} onClick={() => openModalForRequest(req)} >
                                        Place Bid
                                    </Button>
                                </Box>
                             </Paper>
                         </Grid>
                    ))
                )}
        </Box>

        {/* Render the Bid Modal */}
        {modalRequest && ( <BidModal open={showModal} onClose={closeModal} request={modalRequest} deliveryPersonId={deliveryPersonId} /> )}

      </Container>
    </ThemeProvider>
  );
}