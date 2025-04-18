// src/components/homepage/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack // For arranging buttons
} from "@mui/material";

// Ensure the path to your image is correct relative to this file
import campusCartImage from "../../assets/1.png";

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container component="section" maxWidth="md"> {/* Use section for semantics */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 128px)', // Adjust height calculation based on Navbar/Footer height if known, otherwise use vh and accept potential overlap/scroll
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4, // Add some vertical padding
        }}
      >
        {/* Image */}
        <Box
          component="img"
          src={campusCartImage}
          alt="Campus Cart Illustration" // More descriptive alt text
          sx={{
            maxWidth: '80%', // Responsive max width
            height: 'auto', // Maintain aspect ratio
            maxHeight: '300px', // Limit max height
            mb: 4, // Margin bottom
          }}
        />

        {/* Title */}
        <Typography
          variant="h2" // Use a relevant heading level
          component="h1" // Keep h1 for SEO if it's the main page title
          gutterBottom
          sx={{
            fontWeight: 'bold', // Make title bolder
            color: 'text.primary', // Uses black from theme
            letterSpacing: '0.1em' // Add slight letter spacing
          }}
        >
          CAMPUS CART
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6" // Subtitle size
          component="p"
          gutterBottom
          sx={{ color: 'text.primary', mb: 4 }} // Uses black from theme, add margin bottom
        >
          Your Campus, Your Delivery, Your Way!
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}> {/* Arrange buttons horizontally with space */}
          <Button
            variant="outlined" // Secondary action style (white bg, black text/border)
            color="primary"    // Uses black from theme for border/text
            size="large"
            onClick={() => navigate("/login")}
            sx={{ px: 4, py: 1 }} // Add padding
          >
            Log In
          </Button>
          <Button
            variant="contained" // Primary action style (black bg, white text)
            color="primary"     // Uses black from theme for background
            size="large"
            onClick={() => navigate("/signup")}
             sx={{ px: 4, py: 1 }} // Add padding
          >
            Sign Up
          </Button>
        </Stack>

        {/* Local footer removed - rely on global Footer.jsx */}

      </Box>
    </Container>
  );
}

export default HomePage;