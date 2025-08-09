import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const FaceAR = ({ onLoginSuccess }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Keep track of the media stream
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    };

    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          resolve(videoRef.current);
        };
      });
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };

    const verifyFace = async () => {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus('No face detected ❌');
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      console.log('Sending descriptor:', descriptor);

      try {
        const res = await axios.post('http://localhost:5000/face-login', {
          descriptor,
        });

        if (res.status === 200) {
          setStatus('Login Success ✅');
          stopCamera(); // Stop the camera
          onLoginSuccess(res.data.username); // Notify parent
        } else {
          setStatus('Face not recognized ❌');
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
        setStatus('Login failed ❌');
      }
    };

    const start = async () => {
      await loadModels();
      await setupCamera();
      videoRef.current.play();
      setStatus('Verifying...');
      setTimeout(verifyFace, 3000);
    };

    start();

    return () => {
      isMounted = false;
      stopCamera(); // Cleanup on unmount
    };
  }, [onLoginSuccess]);

  return (
    <div style={{ textAlign: 'center' }}>
      <video
        ref={videoRef}
        width="640"
        height="480"
        autoPlay
        muted
        style={{ display: 'block', margin: '0 auto' }}
      />
      <p>{status}</p>
    </div>
  );
};

export default FaceAR;
