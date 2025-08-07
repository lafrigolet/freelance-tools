import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Stack
} from '@mui/material';

import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import FlashAutoIcon from '@mui/icons-material/FlashAuto';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const isMobile = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(ua);
};

const MobileCameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
//  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    if (!isMobileDevice) return;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        videoRef.current.srcObject = mediaStream;
        streamRef.current = mediaStream;
//        setStream(mediaStream);
      } catch (err) {
        console.error('Camera access error:', err);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMobileDevice]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    // Draw the image
    context.drawImage(video, 0, 0, width, height);

    // Get pixel data
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      // Calculate grayscale value
      const gray = 0.3 * red + 0.59 * green + 0.11 * blue;
      data[i] = data[i + 1] = data[i + 2] = gray; // Set R, G, B to gray
    }

    // Put modified data back
    context.putImageData(imageData, 0, 0);

    // Save as image
    const dataUrl = canvas.toDataURL('image/png');
    setPhoto(dataUrl);
  };

  if (!isMobileDevice) {
    return <Alert severity="info">This feature is only available on mobile devices.</Alert>;
  }

  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Mobile Camera Capture
      </Typography>

      <Card sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
        <CardMedia
          component="video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          sx={{ width: '100%' }}
        />
        <CardContent>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={takePhoto}
          >
            📸 Take Photo
          </Button>
        </CardContent>
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {photo && (
        <Card sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
          <CardMedia
            component="img"
            image={photo}
            alt="Captured"
            sx={{ width: '100%' }}
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Captured image preview
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};


const MobileCameraCaptureWithFlash = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  //const [stream, setStream] = useState(null);
  const streamRef = useRef(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [imageCapture, setImageCapture] = useState(null);
  const [flashMode, setFlashMode] = useState('off'); // 'off' | 'on' | 'auto'
  const [torchSupported, setTorchSupported] = useState(false);
  const [fillLightModes, setFillLightModes] = useState([]); // e.g. ['auto','flash','off']

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    if (!isMobileDevice) return;

    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 2000 },
            height: { ideal: 1500 }
          },
          audio: false
        });
        // setStream(s);
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;

        const track = s.getVideoTracks()[0];
        setVideoTrack(track);

        // ImageCapture for photo + flash (if supported)
        if ('ImageCapture' in window) {
          const ic = new window.ImageCapture(track);
          setImageCapture(ic);

          try {
            // capabilities for torch/fillLight
            const caps = await track.getCapabilities?.();
            if (caps && 'torch' in caps) setTorchSupported(true);

            const photoCaps = ic.getPhotoCapabilities ? await ic.getPhotoCapabilities() : null;
            if (photoCaps?.fillLightMode) {
              setFillLightModes(photoCaps.fillLightMode); // array like ['flash','off']
            }
          } catch {
            // capability queries can throw on some browsers
          }
        }
      } catch (err) {
        console.error('Camera error:', err);
      }
    };

    start();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
//      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isMobileDevice]);

  // Apply torch when flashMode changes (continuous light during preview)
  useEffect(() => {
    const applyTorch = async () => {
      if (!videoTrack) return;
      if (!videoTrack.getCapabilities || !videoTrack.applyConstraints) return;

      try {
        const caps = videoTrack.getCapabilities();
        if (!caps || !('torch' in caps)) return;

        if (flashMode === 'on') {
          await videoTrack.applyConstraints({ advanced: [{ torch: true }] });
        } else {
          await videoTrack.applyConstraints({ advanced: [{ torch: false }] });
        }
      } catch (e) {
        console.warn('Torch apply failed:', e);
      }
    };

    if (flashMode === 'on' || flashMode === 'off') {
      applyTorch();
    }
    // For 'auto', we keep torch off and let takePhoto() request flash, if supported
  }, [flashMode, videoTrack]);


  const takePhoto = async () => {
    // Prefer ImageCapture.takePhoto for best quality & flash options
    if (imageCapture?.takePhoto) {
      try {
        // map our flashMode to fillLightMode if supported
        let fillLightMode = 'off';
        if (flashMode === 'on') fillLightMode = 'flash';     // force flash
        if (flashMode === 'auto') fillLightMode = 'auto';

        const canUseFill = fillLightModes.includes(fillLightMode);
        const blob = await imageCapture.takePhoto(
          canUseFill ? { fillLightMode } : {} // pass only if supported
        );

        const imgBitmap = await createImageBitmap(blob);

        // Draw to canvas
        const canvas = canvasRef.current;
        canvas.width = imgBitmap.width;
        canvas.height = imgBitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgBitmap, 0, 0);

        // ---- Grayscale conversion ----
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b; // luminance
          data[i] = data[i + 1] = data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
        // ------------------------------

        setPhoto(canvas.toDataURL('image/png'));
        return;
      } catch (e) {
        console.warn('takePhoto failed; falling back to canvas:', e);
      }
    }

    // Fallback: draw current video frame to canvas (no flash control)
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);

    // ---- Grayscale conversion (fallback) ----
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
    // -----------------------------------------

    setPhoto(canvas.toDataURL('image/png'));
  };

  if (!isMobileDevice) {
    return <Alert severity="info">This camera feature is only available on mobile devices.</Alert>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Mobile Camera (Flash: off / on / auto)
      </Typography>

      <Card sx={{ maxWidth: 420, mx: 'auto', mb: 2 }}>
        <CardMedia
          component="video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          sx={{ width: '100%', aspectRatio: '3 / 4', backgroundColor: 'black' }}
        />
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <ToggleButtonGroup
              exclusive
              value={flashMode}
              onChange={(_, val) => val && setFlashMode(val)}
              size="small"
            >
              <ToggleButton value="off" aria-label="flash off">
                <FlashOffIcon fontSize="small" />&nbsp;Off
              </ToggleButton>
              <ToggleButton value="on" aria-label="flash on" disabled={!torchSupported && !fillLightModes.includes('flash')}>
                <FlashOnIcon fontSize="small" />&nbsp;On
              </ToggleButton>
              <ToggleButton value="auto" aria-label="flash auto" disabled={!fillLightModes.includes('auto')}>
                <FlashAutoIcon fontSize="small" />&nbsp;Auto
              </ToggleButton>
            </ToggleButtonGroup>

            <Button variant="contained" onClick={takePhoto}>
              📸 Take Photo
            </Button>
          </Stack>

          {!torchSupported && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Torch not supported on this device/browser.
            </Typography>
          )}
        </CardContent>
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {photo && (
        <Card sx={{ maxWidth: 420, mx: 'auto' }}>
          <CardMedia component="img" image={photo} alt="Captured" />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Captured image preview
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};


const MobileCameraCaptureWithOverlay = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);           // ref para evitar warnings y re-renders
  const [photo, setPhoto] = useState(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);
  const [imageCapture, setImageCapture] = useState(null);
  const [flashMode, setFlashMode] = useState('off'); // 'off' | 'on' | 'auto'
  const [torchSupported, setTorchSupported] = useState(false);
  const [fillLightModes, setFillLightModes] = useState([]); // p.ej. ['auto','flash','off']

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    if (!isMobileDevice) return;

    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 2000 },
            height: { ideal: 1500 }
          },
          audio: false
        });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;

        const track = s.getVideoTracks()[0];
        setVideoTrack(track);

        if ('ImageCapture' in window) {
          const ic = new window.ImageCapture(track);
          setImageCapture(ic);

          try {
            const caps = track.getCapabilities?.();
            if (caps && 'torch' in caps) setTorchSupported(true);

            const photoCaps = ic.getPhotoCapabilities ? await ic.getPhotoCapabilities() : null;
            if (photoCaps?.fillLightMode) setFillLightModes(photoCaps.fillLightMode);
          } catch {
            // algunas APIs tiran excepción en ciertos navegadores
          }
        }
      } catch (err) {
        console.error('Camera error:', err);
      }
    };

    start();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [isMobileDevice]);

  // Torch continuo durante la previsualización para OFF/ON
  useEffect(() => {
    const applyTorch = async () => {
      if (!videoTrack?.getCapabilities || !videoTrack.applyConstraints) return;
      try {
        const caps = videoTrack.getCapabilities();
        if (!caps || !('torch' in caps)) return;
        await videoTrack.applyConstraints({ advanced: [{ torch: flashMode === 'on' }] });
      } catch (e) {
        console.warn('Torch apply failed:', e);
      }
    };
    if (flashMode === 'on' || flashMode === 'off') applyTorch();
    // en 'auto' mantenemos el torch apagado y dejamos a takePhoto decidir
  }, [flashMode, videoTrack]);

  const takePhoto = async () => {
    // 1) Mejor calidad + flash a través de ImageCapture
    if (imageCapture?.takePhoto) {
      try {
        let fillLightMode = 'off';
        if (flashMode === 'on')  fillLightMode = 'flash';
        if (flashMode === 'auto') fillLightMode = 'auto';

        const canUseFill = fillLightModes.includes(fillLightMode);
        const blob = await imageCapture.takePhoto(
          canUseFill ? { fillLightMode } : {}
        );

        const bitmap = await createImageBitmap(blob);

        const canvas = canvasRef.current;
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        // --- Grayscale ---
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = data[i + 1] = data[i + 2] = gray;
        }
        ctx.putImageData(imgData, 0, 0);
        // -----------------

        setPhoto(canvas.toDataURL('image/png'));
        return;
      } catch (e) {
        console.warn('takePhoto failed; fallback:', e);
      }
    }

    // 2) Fallback: capturar frame actual del <video>
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = video.videoWidth, h = video.videoHeight;
    canvas.width = w; canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);

    // --- Grayscale fallback ---
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imgData, 0, 0);
    // --------------------------

    setPhoto(canvas.toDataURL('image/png'));
  };

  if (!isMobileDevice) {
    return <Alert severity="info">This camera feature is only available on mobile devices.</Alert>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Mobile Camera
      </Typography>

      <Card sx={{ maxWidth: 420, mx: 'auto', mb: 2 }}>
        {/* Contenedor relativo para poder superponer la franja */}
        <Box sx={{ position: 'relative', width: '100%', background: 'black' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              display: 'block',
              aspectRatio: '3 / 4',
              objectFit: 'cover'
            }}
          />

          {/* --- Overlay negro translúcido con controles --- */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              zIndex: 2
            }}
          >
            <ToggleButtonGroup
              exclusive
              value={flashMode}
              onChange={(_, val) => val && setFlashMode(val)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.4)'
                },
                '& .Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.15) !important'
                }
              }}
            >
              <ToggleButton value="off" aria-label="flash off">
                <FlashOffIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton
                value="on"
                aria-label="flash on"
                disabled={!torchSupported && !fillLightModes.includes('flash')}
              >
                <FlashOnIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton
                value="auto"
                aria-label="flash auto"
                disabled={!fillLightModes.includes('auto')}
              >
                <FlashAutoIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              onClick={takePhoto}
              variant="contained"
              size="small"
              startIcon={<CameraAltIcon />}
              sx={{
                bgcolor: 'white',
                color: 'black',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' }
              }}
            >
              Take photo
            </Button>
          </Box>
        </Box>

        <CardContent sx={{ py: 1 }}>
          {!torchSupported && (
            <Typography variant="caption" color="text.secondary">
              Torch control may not be supported on this device/browser.
            </Typography>
          )}
        </CardContent>
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {photo && (
        <Card sx={{ maxWidth: 420, mx: 'auto' }}>
          <img src={photo} alt="Captured" style={{ width: '100%', display: 'block' }} />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Captured image (grayscale)
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};


export {
  MobileCameraCapture,
  MobileCameraCaptureWithFlash,
  MobileCameraCaptureWithOverlay
};

