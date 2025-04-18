// src/components/roleselection/RoleSelectionPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stack, // Good for spacing elements like buttons
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

// --- Black and White Theme (Ideally import from a shared file) ---
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Black
    },
    secondary: {
      main: '#ffffff', // White
    },
    background: {
      default: '#f5f5f5', // Light grey background
      paper: '#ffffff', // White card background
    },
    text: {
      primary: '#000000', // Black text
      secondary: '#555555', // Grey text
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Keep button text case as is
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Style for contained primary button (black bg, white text)
          '&.MuiButton-containedPrimary': {
             color: '#ffffff',
          },
          // Add padding for better button size
          paddingTop: '10px',
          paddingBottom: '10px',
        }
      }
    },
     MuiPaper: { // Consistent paper styling
        styleOverrides: {
            root: {
                padding: '32px', // theme.spacing(4)
                borderRadius: '8px', // theme.shape.borderRadius * 2
            }
        }
    }
  }
});

// --- Role Selection Page Component ---
function RoleSelectionPage() {
  const navigate = useNavigate();

  // Function to handle role selection
  const handleSelect = (role) => {
    localStorage.setItem("role", role); // Store the selected role
    // Navigate based on the selected role
    if (role === "customer") {
      navigate("/customer-dashboard");
    } else if (role === "delivery") {
      navigate("/delivery-dashboard");
    }
  };

  // Retrieve username for greeting
  const username = localStorage.getItem("username");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="xs" // Keep it relatively narrow like login/signup
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh', // Center vertically
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%', // Take full width of container
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center' // Center text inside paper
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 1 }} color='black'>

          </Typography>

          <Typography component="h1" variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Please select your role to continue
          </Typography>

          <Stack direction="column" spacing={2} sx={{ width: '100%' }}> {/* Stack buttons vertically */}
            <Button
              variant="contained" // Primary action style
              color="primary"
              fullWidth // Make button take full width of stack
              size="large" // Make button larger
              onClick={() => handleSelect("customer")}
            >
              I need something delivered (Customer)
            </Button>

            <Button
              variant="outlined" // Secondary action style (optional, could be contained too)
              color="primary"    // Uses black border/text
              fullWidth
              size="large"
              onClick={() => handleSelect("delivery")}
            >
              I can deliver items (Delivery Person)
            </Button>
          </Stack>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default RoleSelectionPage;