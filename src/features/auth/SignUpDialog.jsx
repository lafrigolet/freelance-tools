import { useState, useRef } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from "@mui/material";
import PhoneNumberInput from "./PhoneNumberInput";
import { signUpUser } from "./users";
import { useAuthContext } from "./AuthContext";

const SignUpDialog = ({ size = "small" }) => {
  const [open, setOpen] = useState(false);

  // Estado único con estructura anidada para phone
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: { countryCode: "+34", phoneNumber: "" },
  });

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("Please enter your details to sign up.");
  const [severity, setSeverity] = useState("info");
  const unsubscribeRef = useRef(null);
  const timeoutRef = useRef(null);
  const { user, setUser } = useAuthContext();

  const [errors, setErrors] = useState({
    email: null,
    firstName: null,
    lastName: null,
    phone: null,
  });

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Manejo genérico para email, firstName y lastName
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "email" && value && !emailRegex.test(value)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address.",
      }));
    } else if (field === "email") {
      setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  // Manejo para teléfono (PhoneNumberInput debería darte countryCode y phoneNumber)
  const handlePhoneNumberChange = ({ countryCode, phoneNumber, isValid }) => {
    setFormData((prev) => ({
      ...prev,
      phone: {
        countryCode: countryCode || prev.phone.countryCode,
        phoneNumber,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      phone: isValid ? null : "Invalid phone number format",
    }));
  };

  const handleSignUp = async () => {
    const { email, firstName, lastName, phone } = formData;

    if (!email || !firstName || !lastName || !phone.countryCode || !phone.phoneNumber) {
      setInfo("All fields are required.");
      setSeverity("error");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      setInfo("Please enter a valid email.");
      setSeverity("error");
      return;
    }

    if (!phone.phoneNumber) {
      setErrors((prev) => ({ ...prev, phone: "Invalid phone number format" }));
      setInfo("Please enter a valid phone number.");
      setSeverity("error");
      return;
    }

    try {
      setLoading(true);
      setInfo(
        "If the user doesn't exist, search your email for a login link (try spam too)..."
      );
      setSeverity("warning");

      // Llamada a la API con la nueva estructura
      const result = await signUpUser({
        email,
        firstName,
        lastName,
        phone,
      });

      setInfo("User Signed Up.");
      setSeverity("info");

      setLoading(false);
      setTimeout(() => setOpen(false), 2000);
    } catch (error) {
      setInfo("Sign-up failed. Please try again.");
      setSeverity("error");
      console.log("Sign-up failed. Please try again.", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Sign Up
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent>
          {info && <Alert severity={severity}>{info}</Alert>}

          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange("email")}
                disabled={loading}
                error={!!errors.email}
                helperText={errors.email || "Please enter your email to sign up."}
                size={size}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1} alignItems="center">
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField
                margin="dense"
                label="First Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                disabled={loading}
                error={!!errors.firstName}
                helperText={errors.firstName && "First name is required"}
                size={size}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField
                margin="dense"
                label="Last Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                disabled={loading}
                error={!!errors.lastName}
                helperText={errors.lastName && "Last name is required"}
                size={size}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <PhoneNumberInput
            disabled={loading}
            onChange={handlePhoneNumberChange}
            value={formData.phone} // <-- pasamos countryCode y phoneNumber juntos
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSignUp}
            color="primary"
            disabled={
              loading || !formData.email || !formData.firstName || !formData.lastName
            }
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignUpDialog;
