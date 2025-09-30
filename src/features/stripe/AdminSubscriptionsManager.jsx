// src/admin/AdminSubscriptionsManager.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import {
  listSubscriptions,
  createSubscription,
  updateSubscription,
  reorderSubscriptions,
} from "./stripe"; // wrappers for Firebase functions

export default function AdminSubscriptionsManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  // Load plans
  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    setLoading(true);
    const res = await listSubscriptions();
    setPlans(res.data.products);
    setLoading(false);
  }

  // Add a new subscription
  const handleAdd = async () => {
    try {
      const plan = {
        name: "name",
        description: "description",
        amount: 10,
        currency: "eur",
        interval: "month",
        order: Date.now,
      };

      await createSubscription(plan);
      await fetchPlans();
    } catch (error) {
      console.log("Error: ", error.message);
    }
  };
  
  const handleAddbak = async () => {
    const name = prompt("Plan name?");
    const description = prompt("Description?");
    const amount = parseInt(prompt("Amount in cents? (e.g. 500 for €5)"), 10);
    const currency = "eur"; // fixed for now
    const interval = "month"; // fixed for now

    await createSubscription({ name, description, amount, currency, interval });
    await fetchPlans();
  };

  // Save edited subscription
  const handleSave = async (sub) => {
    await updateSubscription(sub);
    setEditingId(null);
    await fetchPlans();
  };

  // Reorder via drag & drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(plans);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setPlans(reordered);
    await reorderSubscriptions({ orderedIds: reordered.map((p) => p.id) });
  };

  if (loading) return <Typography>Loading plans...</Typography>;

  return (
    <Box minWidth={900} mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Manage Subscription Plans
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        sx={{ mb: 3 }}
      >
        Add Plan
      </Button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="subs" direction="horizontal">
          {(provided) => (
            <Grid
              container
              spacing={2}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {plans.map((sub, index) => (
                <Draggable key={sub.id} draggableId={sub.id} index={index}>
                  {(provided) => (
                      <Grid
                        size={{ xs: 12, sm: 6, md: 4 }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                      <Card sx={{ borderRadius: 3, p: 2, boxShadow: 3 }}>
                        <CardContent>
                          <EditableText
                            value={sub.name}
                            variant="h6"
                            onChange={(newValue) => {
                              const updated = [...plans];
                              updated[index] = { ...updated[index], name: newValue, changed: true };
                              setPlans(updated);
                            }}
                          />
                          <EditablePrice
                            sub={sub}
                            onChange={(newValue) => {
                              const updated = [...plans];
                              updated[index] = { ...updated[index], ...newValue, changed: true };
                              setPlans(updated);
                            }}
                          />
                          <EditableText
                            value={sub.description}
                            variant="body2"
                            multiline
                            onChange={(newValue) => {
                              const updated = [...plans];
                              updated[index] = { ...updated[index], description: newValue, changed: true };
                              setPlans(updated);
                            }}
                          />
                        </CardContent>
                        <CardActions sx={{ justifyContent: "space-between" }}>
                          {/* Active/Inactive Toggle */}
                          {sub.changed ? (
                            <IconButton onClick={() => handleSave(sub)}>
                              <SaveIcon />
                            </IconButton>
                          ) : (
                            <Tooltip title="Click to activate/deactivate" arrow>
                              <Box display="flex" alignItems="center">
                                <Switch
                                  checked={sub.active}
                                  onChange={() => handleSave({...sub, active: !sub.active })}
                                  color="primary"
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}


function EditableText({ value, onSave, onClick, onChange, variant = "body1", multiline = false }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  const handleBlur = () => {
    setEditing(false);
    if (draft !== value) {
      onSave?.(draft);
    }
  };

  return editing ? (
    <TextField
      fullWidth
      variant="standard"
      value={draft}
      autoFocus
      onChange={(e) => {setDraft(e.target.value); onChange?.(e.target.value);}}
      onBlur={handleBlur}
      multiline={multiline}
      InputProps={{
        style: { fontSize: variant === "h6" ? "1.25rem" : "1rem" },
      }}
    />
  ) : (
    <Tooltip title="Click to edit field" arrow>
      <Typography
        variant={variant}
        sx={{ whiteSpace: multiline ? "pre-line" : "normal", cursor: "pointer" }}
        onClick={() => {setEditing(true); onClick?.();} }
      >
        {draft}
      </Typography>
    </Tooltip>
  );
}


const AVAILABLE_CURRENCIES = ["eur", "usd", "gbp"];
const AVAILABLE_INTERVALS = ["day", "week", "month", "year"];

export function EditablePrice({ sub, onSave, onChange }) {
  const [editingField, setEditingField] = React.useState(null);
  const [draft, setDraft] = React.useState({
    amount: sub.amount,
    currency: sub.currency,
    interval: sub.interval,
  });

  const handleBlur = async (field) => {
    setEditingField(null);
    if (draft[field] !== sub[field]) {
      await onSave?.(field, draft[field]);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ my: 1 }}>
      {/* Amount */}
      {editingField === "amount" ? (
        <TextField
          type="number"
          size="small"
          value={draft.amount}
          autoFocus
          onChange={(e) => {
            setDraft((d) => ({ ...d, amount: Number(e.target.value) }));
            onChange?.({amount: e.target.value});
          }}
          onBlur={() => handleBlur("amount")}
          sx={{ maxWidth: 100 }}
        />
      ) : (
        <Tooltip title="Click to edit price" arrow>
          <Box
            display="flex"
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => setEditingField("amount")}
          >
            <Typography variant="h4" color="primary">
              {draft.amount}
            </Typography>
          </Box>
        </Tooltip>
      )}

      {/* Currency */}
      {editingField === "currency" ? (
        <Select
          size="small"
          value={draft.currency}
          autoFocus
          onChange={(e) => {
            setDraft((d) => ({ ...d, currency: e.target.value }));
            onChange?.({currency: e.target.value});
          }}
          onBlur={() => handleBlur("currency")}
          sx={{ textTransform: "uppercase" }}
        >
          {AVAILABLE_CURRENCIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Tooltip title="Click to edit currency" arrow>
          <Box
            display="flex"
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => setEditingField("currency")}
          >
            <Typography
              variant="h6"
              color="primary"
              sx={{ textTransform: "uppercase" }}
            >
              {draft.currency}
            </Typography>
          </Box>
        </Tooltip>
      )}

      <Typography variant="h6">/</Typography>

      {/* Interval */}
      {editingField === "interval" ? (
        <Select
          size="small"
          value={draft.interval}
          autoFocus
          onChange={(e) => {
            setDraft((d) => ({ ...d, interval: e.target.value }));
            onChange?.({interval: e.target.value});
          }}
          onBlur={() => handleBlur("interval")}
        >
          {AVAILABLE_INTERVALS.map((i) => (
            <MenuItem key={i} value={i}>
              {i}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Tooltip title="Click to edit interval" arrow>
          <Box
            display="flex"
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => setEditingField("interval")}
          >
            <Typography variant="h6" color="primary" >{draft.interval}</Typography>
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}
