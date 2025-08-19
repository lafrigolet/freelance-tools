import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { getCroppedFile } from "./cropImage";
import {
  Box,
  Typography,
  Dialog,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Stack,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

export default function ImageUploadWidget({ value = [], onChange }) {
  const [queue, setQueue] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  // history stack for undo/redo
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const MAX_IMAGES = 7;

  // generate preview URLs
  useEffect(() => {
    if (!value || value.length === 0) {
      setPreviews([]);
      return;
    }

    const urls = value
      .map((file) => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        if (typeof file === "string" && file.trim() !== "") {
          return file;
        }
        return null;
      })
      .filter(Boolean);

    setPreviews(urls);

    return () => {
      urls.forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [value]);

  const onDrop = (acceptedFiles) => {
    const availableSlots = MAX_IMAGES - (value?.length || 0);
    const newFiles = acceptedFiles.slice(0, availableSlots);

    if (newFiles.length > 0) {
      setQueue((prev) => [...prev, ...newFiles]);
      if (!currentFile) {
        setCurrentFile(newFiles[0]);
        setHistory([]);
        setRedoStack([]);
      }
    }
  };

const processNext = () => {
  setQueue((prev) => {
    const nextQueue = prev.slice(1);
    if (nextQueue.length > 0) {
      setCurrentFile(nextQueue[0]);
    } else {
      setCurrentFile(null); // close dialog only when all done
    }
    return nextQueue;
  });
};

const handleCropDone = async () => {
  if (!currentFile || saving) return;

  setSaving(true);
  try {
    const croppedFile = await getCroppedFile(currentFile, crop, zoom);

    // Prevent duplicates by checking file signature
    const alreadyExists = (value || []).some(
      (f) => f.name === croppedFile.name && f.size === croppedFile.size
    );
    if (!alreadyExists) {
      onChange([...(value || []), croppedFile]);
    }

    // ✅ only go to next AFTER current one is saved
    processNext();
  } catch (err) {
    console.error("Cropping failed:", err);
    processNext(); // skip to next on error
  } finally {
    setSaving(false);
  }
};

  const handleCancel = () => {
    processNext();
  };

  const removeFile = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  // 🔹 Auto-enhance: fake simple correction (adjust crop & zoom a bit)
  const handleAutoEnhance = () => {
    pushHistory();
    setZoom((z) => Math.min(z * 1.05, 3));
    setCrop((c) => ({ x: c.x * 0.95, y: c.y * 0.95 }));
  };

  // 🔹 Undo/Redo support
  const pushHistory = () => {
    setHistory((h) => [...h, { crop, zoom }]);
    setRedoStack([]); // reset redo
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((r) => [{ crop, zoom }, ...r]);
    setCrop(last.crop);
    setZoom(last.zoom);
    setHistory((h) => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const [next, ...rest] = redoStack;
    setHistory((h) => [...h, { crop, zoom }]);
    setCrop(next.crop);
    setZoom(next.zoom);
    setRedoStack(rest);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #aaa",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: isDragActive ? "grey.100" : "transparent",
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body2" color="textSecondary">
          {isDragActive
            ? "Drop the images here..."
            : "Drag & drop images here, or click to select"}
        </Typography>

        {/* Thumbnails */}
        <Box mt={2} display="flex" gap={2} flexWrap="wrap">
          {previews.length > 0 &&
            previews.map((url, idx) => (
              <Box
                key={idx}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 1,
                  cursor: "default",
                  "&:hover .overlay": { opacity: 0.5 },
                  "&:hover .delete-btn": { opacity: 1 },
                }}
              >
                <img
                  src={url}
                  alt={`preview-${idx}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "black",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                />

<IconButton
  className="delete-btn"
  size="large"
  onClick={(e) => {
    e.stopPropagation();
    removeFile(idx);
  }}
  sx={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "white",      // keep solid background
    color: "black",        // keep icon black
    borderRadius: "50%",
    boxShadow: 2,
    opacity: 0,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translate(-50%, -50%) scale(1.2)", // only scale
      bgcolor: "white !important",  // force white background
      color: "black !important",    // force black icon
      opacity: 1,                   // stay visible
    },
  }}
>
  <CloseIcon fontSize="medium" />
</IconButton>

              </Box>
            ))}
        </Box>
      </Box>

      {/* Crop Dialog */}
      <Dialog
        open={!!currentFile}
        onClose={() => !saving && setCurrentFile(null)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ position: "relative", width: "100%", height: 400 }}>
          {currentFile && (
            <Cropper
              image={URL.createObjectURL(currentFile)}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={(c) => {
                pushHistory();
                setCrop(c);
              }}
              onZoomChange={(z) => {
                pushHistory();
                setZoom(z);
              }}
            />
          )}
        </Box>

        {/* Editing actions */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ p: 2 }}
        >
          <Tooltip title="Undo">
            <span>
              <IconButton onClick={handleUndo} disabled={history.length === 0}>
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo">
            <span>
              <IconButton onClick={handleRedo} disabled={redoStack.length === 0}>
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Auto Enhance">
            <IconButton onClick={handleAutoEnhance}>
              <AutoFixHighIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <DialogActions>
          <Button onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          {saving ? (
            <CircularProgress size={24} />
          ) : (
            <Button onClick={handleCropDone} variant="contained">
              Apply
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
