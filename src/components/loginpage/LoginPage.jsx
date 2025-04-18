// src/components/loginpage/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Alert // Optional: for better error display
} from "@mui/material";

// --- Black and White Theme ---
const theme = createTheme({
  palette: {
    mode: 'light', // Or 'dark' if you prefer a dark background
    primary: {
      main: '#000000', // Black
    },
    secondary: {
      main: '#ffffff', // White (might be used for contrast text on primary buttons)
    },
    background: {
      default: '#f5f5f5', // Light grey background for the page
      paper: '#ffffff', // White background for the form card
    },
    text: {
      primary: '#000000', // Black text
      secondary: '#555555', // Grey text for subtitles/links
    },
    error: {
      main: '#d32f2f', // Standard MUI error red
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Example font
    h5: {
        fontWeight: 600, // Make title a bit bolder
    },
    button: {
        textTransform: 'none', // Keep button text casing as is
    }
  },
  components: {
    MuiButton: {
        styleOverrides: {
            root: { // Ensure high contrast for primary button
                color: '#ffffff', // White text on black button
            }
        }
    }
  }
});

// --- Login Page Component ---
function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Optional: loading state for button

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error on input change
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Try to provide specific error messages
        throw new Error(data.msg || "Login failed. Please check your credentials.");
      }

      // Consider using sessionStorage if token/session should expire with browser tab
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("username", data.user.username); // ✅ Save username

      navigate("/select-role"); // Or wherever your post-login destination is

    } catch (err) {
      setError(err.message);
    } finally {
        setLoading(false); // Reset loading state
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures background color applies correctly */}
      <Container
        component="main"
        maxWidth="xs" // Limits the width of the login box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh', // Center vertically
        }}
      >
        <Paper
          elevation={3} // Adds a subtle shadow
          sx={{
            padding: 4, // Add padding inside the paper
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%', // Take full width of the container (maxWidth: 'xs')
            borderRadius: 2, // Slightly rounded corners
          }}
        >
          <Typography component="h1" variant="h5" color= "black" sx={{ mb: 1 }}>
            Welcome Back!
          </Typography>
          <Typography component="p" variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Log in to continue using Campus Cart
          </Typography>

          {/* Optional: Display error message prominently */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus // Focus the email field on load
              value={form.email}
              onChange={handleChange}
              error={!!error} // Highlight field if there's a general error (optional)
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              error={!!error} // Highlight field if there's a general error (optional)
            />
            {/* Consider adding a "Forgot Password?" link here */}
            <Button
              type="submit"
              fullWidth
              variant="contained" // Contained makes it prominent
              color="primary" // Uses the black color defined in the theme
              disabled={loading} // Disable button while loading
              sx={{ mt: 3, mb: 2, py: 1.5 }} // Add margin top/bottom and padding vertical
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don’t have an account?{' '}
                <Link
                  component={RouterLink} // Use React Router's Link
                  to="/signup"
                  variant="body2"
                  underline="hover" // Underline on hover
                  sx={{ color: 'primary.main' }} // Use primary color (black) for link
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default LoginPage;