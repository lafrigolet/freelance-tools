import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Switch,
  Typography,
  TextField,
} from "@mui/material";

import {
  Delete,
  Save,
} from "@mui/icons-material";

import {
  getUserData,
  setUserData,
  deleteUser,
  disableUser,
  enableUser,
} from "./users";

export default function UserCard({ uid }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [isEnabled, setIsEnabled] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setInfo(null);
      try {
        const res = await getUserData({ uid });
        const { exists, data, claims, disabled } = res.data;
        if (!exists) {
          setError("User not found");
        } else {
          setUser(data);
          setClaims(claims);
          setIsEnabled(!disabled);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to get user");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid]);

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
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      await setUserData({uid , userData:user, claims});
      setInfo("User updated successfully ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to save user ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      await deleteUser({ uid });
      setInfo("User updated successfully ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to save user ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      await disableUser({ uid });
      setInfo("User updated successfully ✅");
      setIsEnabled(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save user ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleEnable = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      await enableUser({ uid });
      setInfo("User updated successfully ✅");
      setIsEnabled(true);
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
          <Grid size={{ xs: 3}}>
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
          <Grid size={{ xs: 5}}>
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
        <Stack direction="row" spacing={2}>
          <IconButton
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20}/> : <Save />}
          </IconButton>
          
          <IconButton
            onClick={handleDelete}
          >
            <Delete />
          </IconButton>
        <Switch
          checked={isEnabled}
          onChange={(e) =>
            e.target.checked ? handleEnable() : handleDisable()
          }
          color="primary"
        />
      </Stack>
    </CardActions>
    </Card>
  );
}
