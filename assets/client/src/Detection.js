import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const Detection = ({ onMoodDetected, onCancel }) => {
  const videoRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const videoInterval = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        setStatus("Loading face models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");

        setStatus("Starting camera...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = async () => {
          await initHandTracking();
          setTimeout(() => {
            startDetectionLoop(); // Delaying actual detection
          }, 3000);
        };
      } catch (err) {
        console.error("Error initializing models:", err);
        setStatus("Error loading models.");
      }
    };

    init();

    return () => stopDetection();
  }, []);

  const stopDetection = () => {
    clearInterval(videoInterval.current);
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  const initHandTracking = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `${process.env.PUBLIC_URL}/models/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    });

    console.log("Hand tracking initialized");
  };

  const detectGestureMood = async (timestamp) => {
    if (!handLandmarkerRef.current) return null;
    const results = handLandmarkerRef.current.detectForVideo(
      videoRef.current,
      timestamp
    );

    const hands = results.landmarks;
    if (!hands || hands.length === 0) return null;

    if (hands.length === 2) return "energetic";

    if (hands.length === 1) {
      const hand = hands[0];
      const index = hand[8];
      const middle = hand[12];
      const wrist = hand[0];

      const fingersApart = Math.abs(index.x - middle.x) > 0.08;
      const isV = fingersApart && index.y < wrist.y;
      if (isV) return "fun";
      // const isNearChin = wrist.y < 0.65 && Math.abs(index.y - wrist.y) < 0.25;

      const isThumbUp = 
      hand[4].y < hand[3].y && // Thumb tip above thum joint
      hand[8].y > hand[6].y &&     // Index folded
      hand[12].y > hand[10].y &&   // Middle folded
      hand[16].y > hand[14].y &&   // Ring folded
      hand[20].y > hand[18].y;     // Pinky folded

      if (isThumbUp) return "relaxed";
    }

    return null;
  };

  let isDetecting = false;

  const detectFaceMood = async () => {
    const face = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!face || !face.expressions) return null;

    const sorted = Object.entries(face.expressions).sort((a, b) => b[1] - a[1]);
    const [emotion, confidence] = sorted[0];

    if (confidence < 0.4) return null;

    const map = {
      happy: "happy",
      sad: "sad",
      angry: "angry",
      neutral: "neutral",
      disgusted: "angry",
      fearful: "sad",
    };

    return emotion === "surprised" ? null : map[emotion] || null;
  };

  const startDetectionLoop = () => {
    const detectionStartTime = Date.now();

    videoInterval.current = setInterval(async () => {
      const elapsed = Date.now() - detectionStartTime;
      if (isDetecting) return;
      isDetecting = true;
      const now = performance.now();
      const gestureMood = await detectGestureMood(now);
      const faceMood = await detectFaceMood();
      const filteredFaceMood = (elapsed < 4000 && faceMood =="neutral") ? null : faceMood;

      console.log("Gesture:", gestureMood, "Face:", faceMood);

      const finalMood = gestureMood || faceMood;
      if (finalMood) {
        stopDetection();
        onMoodDetected(finalMood);
      }
      isDetecting = false;
    }, 800);
  };

  return (
    <div className="detection-wrapper">
      <p className="status">{status}</p>
      <video ref={videoRef} autoPlay muted playsInline className="webcam" />
      <button onClick={() => { stopDetection(); onCancel(); }} className="cancel-btn">
        Cancel
      </button>
    </div>
  );
};

export default Detection;






























































































// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import {
//   FilesetResolver,
//   HandLandmarker,
//   DrawingUtils,
// } from "@mediapipe/tasks-vision";

// const Detection = ({ onMoodDetected, onCancel }) => {
//   const videoRef = useRef(null);
//   const handLandmarkerRef = useRef(null);
//   const [status, setStatus] = useState("Loading models...");
//   const videoInterval = useRef(null);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         setStatus("Loading face models...");
//         await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
//         await faceapi.nets.faceExpressionNet.loadFromUri("/models");

//         setStatus("Starting camera...");
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         videoRef.current.srcObject = stream;

//         videoRef.current.onloadedmetadata = async () => {
//           await initHandTracking();
//           startDetectionLoop();
//         };
//       } catch (err) {
//         console.error("Error initializing models:", err);
//         setStatus("Error loading models.");
//       }
//     };

//     init();

//     return () => stopDetection();
//   }, []);

//   const stopDetection = () => {
//     clearInterval(videoInterval.current);
//     const stream = videoRef.current?.srcObject;
//     if (stream) stream.getTracks().forEach((track) => track.stop());
//   };

//   const initHandTracking = async () => {
//     const vision = await FilesetResolver.forVisionTasks(
//       "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
//     );

//     handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
//       baseOptions: {
//         modelAssetPath: `${process.env.PUBLIC_URL}/models/hand_landmarker.task`,
//         delegate: "GPU",
//       },
//       runningMode: "VIDEO",
//       numHands: 2,
//     });

//     console.log("✅ Hand tracking initialized");
//   };

//   const detectGestureMood = async (timestamp) => {
//     if (!handLandmarkerRef.current) return null;
//     const results = handLandmarkerRef.current.detectForVideo(
//       videoRef.current,
//       timestamp
//     );

//     const hands = results.landmarks;
//     if (!hands || hands.length === 0) return null;

//     if (hands.length === 2) return "energetic";

//     if (hands.length === 1) {
//       const hand = hands[0];
//       const index = hand[8];
//       const middle = hand[12];
//       const wrist = hand[0];

//       const fingersApart = Math.abs(index.x - middle.x) > 0.08;
//       const isV = fingersApart && index.y < wrist.y;
//       if (isV) return "fun";
//       // const isNearChin = wrist.y < 0.65 && Math.abs(index.y - wrist.y) < 0.25;

//       const isThumbUp = 
//       hand[4].y < hand[3].y && // Thumb tip above thum joint
//       hand[8].y > hand[6].y &&     // Index folded
//       hand[12].y > hand[10].y &&   // Middle folded
//       hand[16].y > hand[14].y &&   // Ring folded
//       hand[20].y > hand[18].y;     // Pinky folded

//       if (isThumbUp) return "relaxed";
//     }

//     return null;
//   };

//   let isDetecting = false;

//   const detectFaceMood = async () => {
//     const face = await faceapi
//       .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//       .withFaceExpressions();

//     if (!face || !face.expressions) return null;

//     const sorted = Object.entries(face.expressions).sort((a, b) => b[1] - a[1]);
//     const [emotion, confidence] = sorted[0];

//     if (confidence < 0.4) return null;

//     const map = {
//       happy: "happy",
//       sad: "sad",
//       angry: "angry",
//       neutral: "neutral",
//       disgusted: "angry",
//       fearful: "sad",
//     };

//     return emotion === "surprised" ? null : map[emotion] || null;
//   };

//   const startDetectionLoop = () => {
//     videoInterval.current = setInterval(async () => {
//       if (isDetecting) return;
//       isDetecting = true;
//       const now = performance.now();
//       const gestureMood = await detectGestureMood(now);
//       const faceMood = await detectFaceMood();

//       console.log("Gesture:", gestureMood, "Face:", faceMood);

//       const finalMood = gestureMood || faceMood;
//       if (finalMood) {
//         stopDetection();
//         onMoodDetected(finalMood);
//       }
//       isDetecting = false;
//     }, 800);
//   };

//   return (
//     <div className="detection-wrapper">
//       <p className="status">{status}</p>
//       <video ref={videoRef} autoPlay muted playsInline className="webcam" />
//       <button onClick={() => { stopDetection(); onCancel(); }} className="cancel-btn">
//         Cancel
//       </button>
//     </div>
//   );
// };

// export default Detection;



















































































// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import {
//   FilesetResolver,
//   HandLandmarker,
//   DrawingUtils,
// } from "@mediapipe/tasks-vision";

// const Detection = ({ onMoodDetected, onCancel }) => {
//   const videoRef = useRef(null);
//   const handLandmarkerRef = useRef(null);
//   const [status, setStatus] = useState("Loading models...");
//   const videoInterval = useRef(null);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         setStatus("Loading face models...");
//         await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
//         await faceapi.nets.faceExpressionNet.loadFromUri("/models");

//         setStatus("Starting camera...");
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         videoRef.current.srcObject = stream;

//         videoRef.current.onloadedmetadata = async () => {
//           await initHandTracking();
//           startDetectionLoop();
//         };
//       } catch (err) {
//         console.error("Error initializing models:", err);
//         setStatus("Error loading models.");
//       }
//     };

//     init();

//     return () => stopDetection();
//   }, []);

//   const stopDetection = () => {
//     clearInterval(videoInterval.current);
//     const stream = videoRef.current?.srcObject;
//     if (stream) stream.getTracks().forEach((track) => track.stop());
//   };

//   const initHandTracking = async () => {
//     const vision = await FilesetResolver.forVisionTasks(
//       "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
//     );

//     handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
//       baseOptions: {
//         modelAssetPath: `${process.env.PUBLIC_URL}/models/hand_landmarker.task`,
//         delegate: "GPU",
//       },
//       runningMode: "VIDEO",
//       numHands: 2,
//     });

//     console.log("✅ Hand tracking initialized");
//   };

//   const detectGestureMood = async (timestamp) => {
//     if (!handLandmarkerRef.current) return null;
//     const results = handLandmarkerRef.current.detectForVideo(
//       videoRef.current,
//       timestamp
//     );

//     const hands = results.landmarks;
//     if (!hands || hands.length === 0) return null;

//     if (hands.length === 2) return "energetic";

//     if (hands.length === 1) {
//       const hand = hands[0];
//       const index = hand[8];
//       const middle = hand[12];
//       const wrist = hand[0];

//       const fingersApart = Math.abs(index.x - middle.x) > 0.08;
//       const isV = fingersApart && index.y < wrist.y;
//       if (isV) return "fun";
//       // const isNearChin = wrist.y < 0.65 && Math.abs(index.y - wrist.y) < 0.25;

//       const isThumbUp = 
//       hand[4].y < hand[3].y && // Thumb tip above thum joint
//       hand[8].y > hand[6].y &&     // Index folded
//       hand[12].y > hand[10].y &&   // Middle folded
//       hand[16].y > hand[14].y &&   // Ring folded
//       hand[20].y > hand[18].y;     // Pinky folded

//       if (isThumbUp) return "relaxed";
//     }

//     return null;
//   };

//   const detectFaceMood = async () => {
//     const face = await faceapi
//       .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//       .withFaceExpressions();

//     if (!face || !face.expressions) return null;

//     const sorted = Object.entries(face.expressions).sort((a, b) => b[1] - a[1]);
//     const [emotion, confidence] = sorted[0];

//     if (confidence < 0.4) return null;

//     const map = {
//       happy: "happy",
//       sad: "sad",
//       angry: "angry",
//       neutral: "neutral",
//       disgusted: "angry",
//       fearful: "sad",
//     };

//     return emotion === "surprised" ? null : map[emotion] || null;
//   };

//   const startDetectionLoop = () => {
//     videoInterval.current = setInterval(async () => {
//       const now = performance.now();
//       const gestureMood = await detectGestureMood(now);
//       const faceMood = await detectFaceMood();

//       console.log("Gesture:", gestureMood, "Face:", faceMood);

//       const finalMood = gestureMood || faceMood;
//       if (finalMood) {
//         stopDetection();
//         onMoodDetected(finalMood);
//       }
//     }, 800);
//   };

//   return (
//     <div className="detection-wrapper">
//       <p className="status">{status}</p>
//       <video ref={videoRef} autoPlay muted playsInline className="webcam" />
//       <button onClick={() => { stopDetection(); onCancel(); }} className="cancel-btn">
//         Cancel
//       </button>
//     </div>
//   );
// };

// export default Detection;








































































































// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// // import { Hands } from "@mediapipe/hands";
// import { Camera } from "@mediapipe/camera_utils";

// const Detection = ({ onMoodDetected, onCancel }) => {
//   const videoRef = useRef();
//   const [status, setStatus] = useState("Loading models...");
//   const handResultsRef = useRef(null);
//   const cameraRef = useRef(null);

//   useEffect(() => {
//     const setup = async () => {
//       try {
//         // Load face-api models
//         await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
//         await faceapi.nets.faceExpressionNet.loadFromUri("/models");

//         setStatus("Starting camera...");

//         await startVideo();
//         initMediaPipeHands();
//       } catch (err) {
//         console.error("Model load error:", err);
//         setStatus("Model load failed.");
//       }
//     };

//     setup();
//   }, []);

//   const startVideo = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     videoRef.current.srcObject = stream;
//   };

//   const initMediaPipeHands = () => {
//     const hands = new Hands({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
//     });

//     hands.setOptions({
//       maxNumHands: 2,
//       modelComplexity: 1,
//       minDetectionConfidence: 0.6,
//       minTrackingConfidence: 0.6,
//     });

//     hands.onResults((results) => {
//       handResultsRef.current = results;
//     });

//     const camera = new Camera(videoRef.current, {
//       onFrame: async () => {
//         await hands.send({ image: videoRef.current });
//       },
//       width: 640,
//       height: videoRef.current.videoHeight || 480,
//     });

//     cameraRef.current = camera;
//     camera.start();
//   };

//   const detectGestureMood = () => {
//     const results = handResultsRef.current;
//     if (!results || !results.multiHandLandmarks) return null;

//     const hands = results.multiHandLandmarks;
//     const count = hands.length;

//     if (count === 2) return "energetic";

//     if (count === 1) {
//       const hand = hands[0];
//       const index = hand[8];
//       const middle = hand[12];
//       const wrist = hand[0];

//       const fingersApart = Math.abs(index.x - middle.x) > 0.1;
//       const handNearFace = wrist.y < 0.6;

//       if (fingersApart) return "fun";     // ✌️
//       if (handNearFace) return "relaxed"; // 🤲
//     }

//     return null;
//   };

//   const getMoodFromFace = (expressions) => {
//     const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
//     const [topEmotion, confidence] = sorted[0];
//     if (confidence < 0.4) return null;

//     const map = {
//       happy: "happy",
//       sad: "sad",
//       angry: "angry",
//       neutral: "neutral",
//       surprised: "surprise",
//       disgusted: "angry",
//       fearful: "sad",
//     };

//     return map[topEmotion] || null;
//   };

//   const stopCamera = () => {
//     const stream = videoRef.current?.srcObject;
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//     }

//     if (cameraRef.current) {
//       cameraRef.current.stop();
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       if (!videoRef.current) return;

//       const face = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceExpressions();

//       const gestureMood = detectGestureMood();
//       const faceMood = face ? getMoodFromFace(face.expressions) : null;

//       const finalMood = gestureMood || faceMood;

//       if (finalMood) {
//         clearInterval(interval);
//         stopCamera();
//         onMoodDetected(finalMood);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="detection-wrapper">
//       <p className="status">{status}</p>
//       <video ref={videoRef} autoPlay muted playsInline className="webcam" />
//       <button onClick={() => { stopCamera(); onCancel(); }} className="cancel-btn">
//         Cancel
//       </button>
//     </div>
//   );
// };

// export default Detection;





















































































// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";

// const Detection = ({ onMoodDetected, onCancel }) => {
//   const videoRef = useRef();
//   const [status, setStatus] = useState("Loading models...");
//   const handResultsRef = useRef(null);
//   const cameraRef = useRef(null);

//   useEffect(() => {
//     const setup = async () => {
//       try {
//         await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
//         await faceapi.nets.faceExpressionNet.loadFromUri("/models");
//         setStatus("Starting camera...");
//         await startVideo();
//         initMediaPipeHands();
//       } catch (err) {
//         console.error("Model load error:", err);
//         setStatus("Model load failed.");
//       }
//     };
//     setup();
//   }, []);

//   const startVideo = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     videoRef.current.srcObject = stream;
//   };

//   const initMediaPipeHands = () => {
//     const hands = new window.Hands({
//       locateFile: (file) =>
//         `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
//     });

//     hands.setOptions({
//       maxNumHands: 2,
//       modelComplexity: 1,
//       minDetectionConfidence: 0.6,
//       minTrackingConfidence: 0.6,
//     });

//     hands.onResults((results) => {
//       handResultsRef.current = results;
//     });

//     if (!window.CameraUtils || !window.CameraUtils.Camera) {
//       console.error("CameraUtils not loaded properly.");
//       return;
//     }

//     const camera = new window.CameraUtils.Camera(videoRef.current, {
//       onFrame: async () => {
//         await hands.send({ image: videoRef.current });
//       },
//       width: 640,
//       height: videoRef.current.videoHeight || 480,
//     });

//     cameraRef.current = camera;
//     camera.start();
//   };

// const detectGestureMood = () => {
//   const results = handResultsRef.current;
//   if (!results || !results.multiHandLandmarks) return null;

//   const hands = results.multiHandLandmarks;
//   const count = hands.length;

//   if (count === 2) {
//     // Check if both hands are raised (y < 0.5)
//     const bothRaised = hands.every(
//       (hand) => hand[0].y < 0.5
//     );
//     if (bothRaised) return "energetic";
//   }

//   if (count === 1) {
//     const hand = hands[0];
//     const index = hand[8];
//     const middle = hand[12];
//     const ring = hand[16];
//     const pinky = hand[20];
//     const wrist = hand[0];

//     const fingerSpread =
//       Math.abs(index.x - middle.x) > 0.08 &&
//       Math.abs(middle.x - ring.x) > 0.08 &&
//       Math.abs(ring.x - pinky.x) > 0.08;

//     const victoryPose = fingerSpread && index.y < wrist.y;

//     const handNearChin =
//       wrist.y < 0.7 &&
//       wrist.x > 0.2 && wrist.x < 0.8 &&
//       Math.abs(index.y - wrist.y) < 0.25;

//     if (victoryPose) return "fun";
//     if (handNearChin) return "relaxed";
//   }

//   return null;
// };


//   const getMoodFromFace = (expressions) => {
//     const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
//     const [topEmotion, confidence] = sorted[0];
//     if (confidence < 0.2) return null;

//     const map = {
//       happy: "happy",
//       sad: "sad",
//       angry: "angry",
//       neutral: "neutral",
//       surprised: "surprise",
//       disgusted: "angry",
//       fearful: "sad",
//     };

//     return map[topEmotion] || null;
//   };

//   const stopCamera = () => {
//     const stream = videoRef.current?.srcObject;
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//     }

//     if (cameraRef.current) {
//       cameraRef.current.stop();
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       if (!videoRef.current) return;

//       const face = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceExpressions();

//       const gestureMood = detectGestureMood();
//       const faceMood = face ? getMoodFromFace(face.expressions) : null;

//       console.log("Gesture:", gestureMood, "Face:", faceMood);

//       let finalMood = null;

//       if (gestureMood && gestureMood !== "neutral") {
//         finalMood = gestureMood;
//       } else if (faceMood && faceMood !== "neutral") {
//         finalMood = faceMood;
//       }

//       if (finalMood) {
//         clearInterval(interval);
//         stopCamera();
//         onMoodDetected(finalMood);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="detection-wrapper">
//       <p className="status">{status}</p>
//       <video ref={videoRef} autoPlay muted playsInline className="webcam" />
//       <button onClick={() => { stopCamera(); onCancel(); }} className="cancel-btn">
//         Cancel
//       </button>
//     </div>
//   );
// };

// export default Detection;








































































































// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import { Hands } from "@mediapipe/hands";
// import { Camera } from "@mediapipe/camera_utils";

// const Detection = ({ onMoodDetected, onCancel }) => {
//   const videoRef = useRef();
//   const [status, setStatus] = useState("Loading models...");
//   const handResultsRef = useRef(null);
//   const cameraRef = useRef(null);

//   useEffect(() => {
//     const setup = async () => {
//       try {
//         // Load face-api models
//         await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
//         await faceapi.nets.faceExpressionNet.loadFromUri("/models");

//         setStatus("Starting camera...");

//         await startVideo();
//         initMediaPipeHands();
//       } catch (err) {
//         console.error("Model load error:", err);
//         setStatus("Model load failed.");
//       }
//     };

//     setup();
//   }, []);

//   const startVideo = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     videoRef.current.srcObject = stream;
//   };

//   const initMediaPipeHands = () => {
//     const hands = new Hands({
//       locateFile: (file) => `/mediapipe/hands/${file}`,
//     });

//     hands.setOptions({
//       maxNumHands: 2,
//       modelComplexity: 1,
//       minDetectionConfidence: 0.6,
//       minTrackingConfidence: 0.6,
//     });

//     hands.onResults((results) => {
//       handResultsRef.current = results;
//     });

//     const camera = new Camera(videoRef.current, {
//       onFrame: async () => {
//         await hands.send({ image: videoRef.current });
//       },
//       width: 640,
//       height: videoRef.current.videoHeight || 480,
//     });

//     cameraRef.current = camera;
//     camera.start();
//   };

//   const detectGestureMood = () => {
//     const results = handResultsRef.current;
//     if (!results || !results.multiHandLandmarks) return null;

//     const hands = results.multiHandLandmarks;
//     const count = hands.length;

//     if (count === 2) return "energetic";

//     if (count === 1) {
//       const hand = hands[0];
//       const index = hand[8];
//       const middle = hand[12];
//       const wrist = hand[0];

//       const fingersApart = Math.abs(index.x - middle.x) > 0.1;
//       const handNearFace = wrist.y < 0.6;

//       if (fingersApart) return "fun";     // ✌️
//       if (handNearFace) return "relaxed"; // 🤲
//     }

//     return null;
//   };

//   const getMoodFromFace = (expressions) => {
//     const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
//     const [topEmotion, confidence] = sorted[0];
//     if (confidence < 0.4) return null;

//     const map = {
//       happy: "happy",
//       sad: "sad",
//       angry: "angry",
//       neutral: "neutral",
//       surprised: "surprise",
//       disgusted: "angry",
//       fearful: "sad",
//     };

//     return map[topEmotion] || null;
//   };

//   const stopCamera = () => {
//     const stream = videoRef.current?.srcObject;
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//     }

//     if (cameraRef.current) {
//       cameraRef.current.stop();
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       if (!videoRef.current) return;

//       const face = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceExpressions();

//       const gestureMood = detectGestureMood();
//       const faceMood = face ? getMoodFromFace(face.expressions) : null;

//       const finalMood = gestureMood || faceMood;

//       if (finalMood) {
//         clearInterval(interval);
//         stopCamera();
//         onMoodDetected(finalMood);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="detection-wrapper">
//       <p className="status">{status}</p>
//       <video ref={videoRef} autoPlay muted playsInline className="webcam" />
//       <button onClick={() => { stopCamera(); onCancel(); }} className="cancel-btn">
//         Cancel
//       </button>
//     </div>
//   );
// };

// export default Detection;
