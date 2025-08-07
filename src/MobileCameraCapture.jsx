import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Alert
} from '@mui/material';

const isMobile = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(ua);
};

const MobileCameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [stream, setStream] = useState(null);

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
        setStream(mediaStream);
      } catch (err) {
        console.error('Camera access error:', err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
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

    context.drawImage(video, 0, 0, width, height);
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

export default MobileCameraCapture;
