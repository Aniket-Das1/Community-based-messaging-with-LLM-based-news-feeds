import  { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRegister = ({ onRegistrationSuccess }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false); // ✅ New flag

  // Load face-api.js models
  const loadModels = async () => {
    try {
      setStatus('Loading models...');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setModelsLoaded(true);
      setStatus('Models loaded successfully ✅');
    } catch (err) {
      console.error('Error loading models:', err);
      setStatus('Error loading models ❌');
    }
  };
  function stopCamera() {
    const stream = document.querySelector('video')?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      document.querySelector('video').srcObject = null;
    }
  }
  // Start the camera
  const startCamera = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setVideoReady(true); // ✅ Enable Register button
          setStatus('Ready for registration. Please center your face and click "Register".');
        };
      }
    } catch (err) {
      setStatus('Error: Camera not accessible. Please allow camera permissions.');
      console.error("Camera Error: ", err);
    }
  };

  // Handle face registration
  const registerFace = async () => {
    setStatus('Capturing face...');

    setTimeout(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        setStatus('Video not ready ❌');
        console.warn('Video not ready:', videoRef.current);
        return;
      }

      try {
        if (!modelsLoaded) {
          setStatus('Models are not loaded ❌');
          return;
        }

        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,         // 🔽 Reduced input size for faster detection
            scoreThreshold: 0.3     // 🔽 Lowered threshold for more lenient detection
          }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        console.log('Detection result:', detection);

        if (!detection) {
          setStatus('No face detected ❌ Please try again with good lighting.');
          return;
        }

        const descriptor = Array.from(detection.descriptor);
        console.log('Descriptor captured:', descriptor);

        if (onRegistrationSuccess) {
          onRegistrationSuccess(descriptor);
          setStatus('Face registered successfully ✅');
          stopCamera(); 
        } else {
          setStatus('Face captured, but no callback defined ❓');
        }
      } catch (err) {
        console.error('Face detection error:', err);
        setStatus('Error during face detection ❌');
      }
    }, 300); // Slight delay to ensure UI updates
  };

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, []);

  // Start camera on mount
  useEffect(() => {
    startCamera();
  }, []);

  // Cleanup on unmount only ✅
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <video
        ref={videoRef}
        width="640"
        height="480"
        autoPlay
        muted
        style={{ display: 'block', margin: '0 auto', border: '1px solid #ccc' }}
      />
      <p>{status}</p>
      <button onClick={registerFace} disabled={!videoReady || !modelsLoaded}>
        Register
      </button>
    </div>
  );
};

export default FaceRegister;
