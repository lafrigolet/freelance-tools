// src/SupportPanel.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Chat from "./Chat";
import UserCard from '../auth/UserCard';

export default function SupportPanel() {
  const [chats, setChats] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (chatId) => (event, isExpanded) => {
    setExpanded(isExpanded ? chatId : null);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Sidebar on the left */}
      <Paper
        sx={{
          width: 320,
          p: 2,
          borderRadius: 0,
          height: "100%",
          overflowY: "auto",
          position: "relative",
        }}
        square
      >
        <Typography variant="h6" gutterBottom>
          Chats activos
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {chats.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No hay chats activos
          </Typography>
        )}

        {chats.map((chat) => (
          <Accordion
            key={chat.id}
            expanded={expanded === chat.id}
            onChange={handleChange(chat.id)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: expanded === chat.id ? "primary.main" : "transparent",
                color: expanded === chat.id ? "white" : "inherit",
                borderRadius: 1,
                "&:hover": {
                  bgcolor:
                    expanded === chat.id ? "primary.dark" : "action.hover",
                },
                "& .MuiTypography-root": {
                  fontWeight: expanded === chat.id ? "bold" : "normal",
                },
              }}
            >
              <Typography sx={{ flexGrow: 1 }}>
                Cliente: {chat.id}
              </Typography>
              <Typography
                variant="body2"
                color={
                  expanded === chat.id
                    ? "rgba(255,255,255,0.7)"
                    : "text.secondary"
                }
              >
                {chat.lastMessage || "Nuevo chat"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Chat chatId={chat.id} role="support" />
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Main helpdesk area to the right */}
      <Box sx={{ flex: 1, bgcolor: "#f9f9f9", p: 3 }}>
        {/* Aquí puedes renderizar tu panel principal de helpdesk */}
        <Typography variant="h5" color="text.secondary">
          Helpdesk workspace
          <UserCard email={expanded} />
        </Typography>
      </Box>
    </Box>
  );
}
