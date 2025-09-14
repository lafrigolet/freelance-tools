// src/SupportPanel.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from "@mui/material";

import Chat from "./Chat";

export default function SupportPanel() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    // Escuchar todos los chats ordenados por última actividad
    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("snapshot.docs.length ", snapshot.docs.length);
      setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
      {/* Lista de chats */}
      <Paper sx={{ width: 280, p: 2, height: "80vh", overflowY: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Chats activos
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <List>
          {chats.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No hay chats activos
            </Typography>
          )}
          {chats.map((chat) => (
            <ListItem key={chat.id} disablePadding>
              <ListItemButton
                onClick={() => setActiveChat(chat.id)}
                selected={activeChat === chat.id}
                sx={{
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiListItemText-secondary": {
                      color: "rgba(255,255,255,0.7)",
                    },
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                <ListItemText
                  primary={`Cliente: ${chat.id}`}
                  secondary={chat.lastMessage || "Nuevo chat"}
                  primaryTypographyProps={{ sx: { fontSize: "0.9rem" } }}
                  secondaryTypographyProps={{ sx: { fontSize: "0.75rem" } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat abierto */}
      <Box sx={{ flex: 1 }}>
        {activeChat ? (
          <Chat chatId={activeChat} role="support" />
        ) : (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Selecciona un chat para atender al cliente
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
