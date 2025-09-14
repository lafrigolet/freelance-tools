// src/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";

function generateRandomId(length = 16) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export default function Chat({ role = "user", chatId: supportChatId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const dragCounter = useRef(0);
  const bottomRef = useRef(null);
  const storage = getStorage();
  //const audioRef = useRef(new Audio("/dingdong.mp3"));
  //const audioRef = useRef(new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"));

  const audioRef = useRef(null);

  useEffect(() => {
    const initAudio = () => {
      audioRef.current = new Audio("/dingdong.mp3");
      // Optional preload
      audioRef.current.load();
      window.removeEventListener("click", initAudio);
    };
    window.addEventListener("click", initAudio);
  }, []);
  
  
  useEffect(() => {
    if (role === "user") {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        // Use email as chatId when logged in
        setChatId(currentUser.email);
      } else {
        // Fallback to random id stored in localStorage
        let anonId = localStorage.getItem("chatId");
        if (!anonId) {
          anonId = generateRandomId();
          localStorage.setItem("chatId", anonId);
        }
        setChatId(anonId);
      }
    } else if (role === "support") {
      setChatId(supportChatId);
    }
  }, [role, supportChatId]);
  
  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Detectar nuevo mensaje
      if (messages.length && newMessages.length > messages.length && !isMuted) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) =>
          console.warn("Audio play blocked by browser:", err)
        );
      }

      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [chatId, messages, isMuted]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const chatRef = doc(db, "chats", chatId);

    await setDoc(
      chatRef,
      {
        participants: ["user", "support"],
        createdAt: serverTimestamp(),
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "chats", chatId, "messages"), {
      sender: role,
      text: newMessage,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  const handleUploadImage = async (file) => {
    if (!file || !chatId) return;

    const fileRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(fileRef);

    const chatRef = doc(db, "chats", chatId);
    await setDoc(
      chatRef,
      {
        participants: ["user", "support"],
        createdAt: serverTimestamp(),
        lastMessage: "📷 Image",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "chats", chatId, "messages"), {
      sender: role,
      imageUrl,
      createdAt: serverTimestamp(),
    });
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleUploadImage(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadImage(e.dataTransfer.files[0]);
    }
  };
  
  const handleCloseChat = async () => {
    if (!chatId) return;

    if (role === "support") {
      // 1. Borrar todos los mensajes en la subcolección
      const messagesRef = collection(db, "chats", chatId, "messages");
      const snapshot = await getDocs(messagesRef);
      const deletes = snapshot.docs.map((m) => deleteDoc(m.ref));
      await Promise.all(deletes);

      // 2. Borrar imágenes y archivos en Firebase Storage
      const storage = getStorage();
      const chatFolderRef = ref(storage, `chats/${chatId}`);
      try {
        const listResult = await listAll(chatFolderRef);
        const fileDeletes = listResult.items.map((itemRef) =>
          deleteObject(itemRef)
        );
        await Promise.all(fileDeletes);
      } catch (err) {
        console.error("Error deleting storage files for chat:", err);
      }

      // 3. Borrar documento del chat
      await deleteDoc(doc(db, "chats", chatId));
    }

    if (onClose) onClose(chatId);
  };
  
  if (!chatId) {
    return <Typography>Loading chat...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, position: "relative", overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">
            {role === "user"
              ? "💬 Chat with support"
              : `🛎 Chat with client (${chatId})`}
          </Typography>
          <Box>
            <IconButton onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <NotificationsOffIcon /> : <NotificationsActiveIcon />}
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages + drop zone */}
        <Box
          sx={{ position: "relative" }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          <List
            sx={{
              border: "1px solid #ddd",
              borderRadius: 2,
              height: 300,
              overflowY: "auto",
              mb: 2,
              p: 1,
            }}
          >
            {messages.map((msg) => (
              <ListItem
                key={msg.id}
                sx={{ justifyContent: msg.sender === role ? "flex-end" : "flex-start" }}
              >
                <Paper
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: msg.sender === role ? "primary.main" : "grey.200",
                    color: msg.sender === role ? "white" : "black",
                    maxWidth: "70%",
                  }}
                >
                  {msg.text && (
                    <ListItemText
                      primary={msg.text}
                      primaryTypographyProps={{ sx: { fontSize: "0.85rem" } }}
                    />
                  )}
                  {msg.imageUrl && (
                    <Box mt={1}>
                      <img
                        src={msg.imageUrl}
                        alt="uploaded"
                        style={{ maxWidth: "200px", borderRadius: "8px" }}
                      />
                    </Box>
                  )}
                </Paper>
              </ListItem>
            ))}
            <div ref={bottomRef} />
          </List>

          {/* Overlay drop zone */}
          {isDragging && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 2,
                fontSize: "1.2rem",
                zIndex: 10,
              }}
            >
              Drop image here
            </Box>
          )}
        </Box>

        {/* Input */}
        <Box component="form" onSubmit={handleSend} sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <IconButton component="label" color="secondary">
            <ImageIcon />
            <input type="file" accept="image/*" hidden onChange={handleFileInput} />
          </IconButton>
          <IconButton type="submit" color="primary" sx={{ flexShrink: 0 }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
