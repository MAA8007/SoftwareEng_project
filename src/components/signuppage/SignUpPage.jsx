// src/components/signuppage/SignUpPage.jsx
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
  Alert // For displaying errors consistently
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
    button: {
        textTransform: 'none',
    }
  },
  components: {
    MuiButton: {
        styleOverrides: {
            root: {
                color: '#ffffff', // White text on black button
            }
        }
    }
  }
});

// --- SignUp Page Component ---
function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for button

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);

    // Basic validation (Optional but recommended)
    if (!form.username || !form.email || !form.password) {
        setError("All fields are required.");
        setLoading(false);
        return;
    }
    // Add more specific validation (e.g., password strength, email format) here if needed

    try {
      const res = await fetch("http://localhost:5001/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form), // Send the whole form state
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Signup failed. Please try again.");
      }

      // Optional: Store user info if backend returns it and you want to auto-login
      // localStorage.setItem("userId", data.user._id);
      // localStorage.setItem("username", data.user.username);

      // Navigate to login page after successful signup
      // Or navigate directly to '/select-role' or dashboard if signup includes auto-login
      navigate("/login");

    } catch (err) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="xs" // Consistent width with Login page
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" color="black" sx={{ mb: 1 }}>
            Create an Account
          </Typography>
          <Typography component="p" variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Join Campus Cart today!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Full Name" // Changed from placeholder
              name="username"
              autoComplete="name" // Helps browser autofill
              autoFocus // Focus the first field
              value={form.username}
              onChange={handleChange}
              error={!!error} // Basic error indication on all fields
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password" // Hint for password managers
              value={form.password}
              onChange={handleChange}
              error={!!error}
            />
            {/* Consider adding a Password Confirmation field here */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink} // Use React Router's Link
                  to="/login"
                  variant="body2"
                  underline="hover"
                  sx={{ color: 'primary.main' }}
                >
                  Log in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default SignUpPage;