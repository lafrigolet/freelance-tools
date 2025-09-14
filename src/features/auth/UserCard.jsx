import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  fetchUserData,
  saveUserData,
  deleteUser,
  disableUser,
  enableUser,
} from "./users";

export default function UserCard({ email }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!email) return;
    async function load() {
      setLoading(true);
      setError(null);
      setInfo(null);
      try {
        const { exists, data, claims } = await fetchUserData(email);
        if (!exists) {
          setError("User not found");
        } else {
          console.log("data ", data);
          console.log("role ", claims.role);
          setUser(data);
          setClaims(claims);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [email]);

  const handleChange = (field) => (e) => {
    setUser((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhoneChange = (field) => (e) => {
    setUser((prev) => ({
      ...prev,
      phone: {
        ...prev.phone,
        [field]: e.target.value,
      },
    }));
  };

  const handleSave = async () => {
    if (!email || !user) return;
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      await saveUserData(email, user, claims);
      setInfo("User updated successfully ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to save user ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!email || !user) return;
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      await deleteUser(email);
      setInfo("User updated successfully ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to save user ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!email || !user) return;
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      await disableUser(email);
      setInfo("User updated successfully ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to save user ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleEnable = async () => {
    if (!email || !user) return;
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      await enableUser(email);
      setInfo("User updated successfully ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to save user ❌");
    } finally {
      setSaving(false);
    }
  };

//  if (loading) return <CircularProgress />;
//  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return null;

  return (
    <Card sx={{ maxWidth: 600, margin: "1rem auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Manage User
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 8}}>
            <TextField
              label="Email"
              value={user.email || ""}
              fullWidth
              margin="dense"
              disabled
            />
          </Grid>
          <Grid size={{ xs: 2}}>
            <TextField
              label="Role"
              value={claims?.role || ""}
              onChange={handleChange("role")}
              fullWidth
              margin="dense"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6}}>
            <TextField
              label="First Name"
              value={user.firstName || ""}
              onChange={handleChange("firstName")}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid size={{ xs: 6}}>
            <TextField
              label="Last Name"
              value={user.lastName || ""}
              onChange={handleChange("lastName")}
              fullWidth
              margin="dense"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 3}}>
            <TextField
              label="Country Code"
              value={user.phone?.countryCode || ""}
              onChange={handlePhoneChange("countryCode")}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid size={{ xs: 4}}>
            <TextField
              label="Phone Number"
              value={user.phone?.phoneNumber || ""}
              onChange={handlePhoneChange("phoneNumber")}
              fullWidth
              margin="dense"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 4}}>
            <TextField
              label="Created At"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : ""
              }
              fullWidth
              margin="dense"
              disabled
            />
          </Grid>
        </Grid>
        {loading && <CircularProgress />}
        {info && <Alert severity="info" sx={{ mt: 2 }}>{info}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="contained"
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          onClick={handleDisable}
        >
          Disable
        </Button>
        <Button
          variant="contained"
          onClick={handleEnable}
        >
          Enable
        </Button>
      </CardActions>
    </Card>
  );
}
