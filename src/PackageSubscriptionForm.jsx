
import { Button, Container, Typography, Box, Card, CardContent, CardActions, Grid, createTheme, ThemeProvider, Divider } from "@mui/material";

// Create a Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue color for primary button and highlights
    },
    secondary: {
      main: "#f50057", // Secondary button color
    },
    background: {
      default: "#f4f6f8", // Light gray background
    },
    text: {
      primary: "#333", // Dark text for better readability
    },
  },
  typography: {
    h4: {
      fontWeight: 600, // Bold title
    },
    h5: {
      fontWeight: 500, // Subheading
    },
    h6: {
      fontWeight: 400, // Subtitle or text content
    },
    body2: {
      fontSize: "0.875rem", // Adjusted for list or description content
    },
  },
  spacing: 8, // Increase spacing across the app for more breathing room
});

const PackageSubscriptionForm = () => {
  const packages = [
    {
      name: "Basic",
      price: "$10/month",
      features: ["Feature 1", "Feature 2"],
      description: "Basic subscription with essential features.",
    },
    {
      name: "Premium",
      price: "$25/month",
      features: ["Feature 1", "Feature 2", "Feature 3", "Priority Support"],
      description: "Premium subscription with extra features and priority support.",
    },
    {
      name: "Pro",
      price: "$50/month",
      features: ["All Features", "Feature 1", "Feature 2", "Feature 3", "Pro Support", "Advanced Analytics"],
      description: "Pro subscription with all features and analytics tools.",
    },
  ];

  const handleCheckout = (pkg) => {
    alert(`Proceeding with the ${pkg.name} package. Price: ${pkg.price}`);
    // Here, integrate payment gateway or other logic to handle the checkout
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ paddingTop: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h4" gutterBottom>
            Choose Your Subscription Package
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {packages.map((pkg) => (
              <Grid item key={pkg.name} xs={12} sm={4} md={4}>
                <Card sx={{ width: "300px", display: "flex", flexDirection: "column", height: "100%" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="div">
                      {pkg.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {pkg.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {pkg.description}
                    </Typography>

                    {/* Divider for separating features section */}
                    <Divider sx={{ margin: "16px 0" }} />

                    <Typography variant="body2" color="text.secondary">
                      <strong>Features:</strong>
                      <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0 }}>
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} style={{ textAlign: "left" }}>{feature}</li>
                        ))}
                      </ul>
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleCheckout(pkg)}
                      fullWidth
                      sx={{ marginTop: "auto" }} // Push the button to the bottom of the card
                    >
                      Proceed to Checkout
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default PackageSubscriptionForm;
