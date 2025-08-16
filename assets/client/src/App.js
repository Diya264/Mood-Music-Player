import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Detection from "./Detection";

const moods = ["Happy", "Sad", "Energetic", "Relaxed", "Fun", "Angry", "Neutral", "Surprise"];

const moodEmojis = {
  happy: "😊",
  sad: "💙",
  energetic: "⚡",
  relaxed: "🌙",
  fun: "🎉",
  angry: "🔥",
  neutral: "⚪",
  surprise: "✨"
};

function App() {
  const [currentMood, setCurrentMood] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [detecting, setDetecting] = useState(false); // ✅ detection flag
  const audioRef = useRef(null);

  // Floating particles effect
  useEffect(() => {
    const createFloatingParticles = () => {
      const colors = {
        happy: ['rgba(255, 193, 7, 0.6)', 'rgba(255, 87, 34, 0.5)', 'rgba(255, 235, 59, 0.4)'],
        sad: ['rgba(75, 75, 75, 0.6)', 'rgba(50, 50, 70, 0.5)', 'rgba(30, 30, 50, 0.4)'],
        energetic: ['rgba(255, 94, 77, 0.6)', 'rgba(255, 154, 0, 0.5)', 'rgba(255, 206, 84, 0.4)'],
        relaxed: ['rgba(103, 58, 183, 0.6)', 'rgba(33, 150, 243, 0.5)'],
        fun: ['rgba(233, 30, 99, 0.6)', 'rgba(156, 39, 176, 0.5)', 'rgba(103, 58, 183, 0.4)'],
        angry: ['rgba(244, 67, 54, 0.6)', 'rgba(255, 87, 34, 0.5)'],
        neutral: ['rgba(158, 158, 158, 0.4)', 'rgba(189, 189, 189, 0.3)'],
        surprise: ['rgba(76, 175, 80, 0.6)', 'rgba(255, 193, 7, 0.5)', 'rgba(156, 39, 176, 0.4)']
      };

      const existingParticles = document.querySelectorAll('.floating-particle');
      existingParticles.forEach(p => p.remove());

      if (currentMood && colors[currentMood]) {
        const particleColors = colors[currentMood];
        const particleCount = 25;

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'floating-particle';
          const size = Math.random() * 8 + 4;
          particle.style.width = size + 'px';
          particle.style.height = size + 'px';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.top = Math.random() * 100 + '%';
          particle.style.background = particleColors[i % particleColors.length];
          particle.style.animationDelay = Math.random() * 12 + 's';
          particle.style.animationDuration = (Math.random() * 8 + 8) + 's';
          document.body.appendChild(particle);
        }
      }
    };

    if (currentMood) {
      setTimeout(() => {
        createFloatingParticles();
      }, 600);
    }
  }, [currentMood]);

  // Fetch random song by mood
  const loadSong = async (mood) => {
    try {
      const response = await axios.get(`http://localhost:5000/get-random-song?mood=${mood}`);
      const songUrl = response.data.songUrl;
      setCurrentSong(`http://localhost:5000${songUrl}`);
      setCurrentMood(mood);
    } catch (error) {
      console.error("Error fetching random song", error);
    }
  };

  const handleSongEnded = () => {
    if (currentMood) loadSong(currentMood);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) audioRef.current.currentTime = percentage * duration;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goBack = () => {
    setCurrentMood(null);
    setCurrentSong(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    document.querySelectorAll('.floating-particle').forEach(p => p.remove());
  };

  // render Detection component if active
  const handleMoodDetected = (mood) => {
    setDetecting(false);
    loadSong(mood);
  };

  return (
    <div className={`app ${currentMood ? currentMood.toLowerCase() : ""}`}>
      {detecting && (
        <Detection
          onMoodDetected={handleMoodDetected}
          onCancel={() => setDetecting(false)}
        />
      )}

      <div className={`main-content ${currentSong ? 'hidden' : ''}`}>
        <h1 className="title">🎵 Mood Music Player</h1>

        {/* Hide mood buttons while detecting */}
        {!detecting && (
          <div className="mood-selector">
            {moods.map((mood) => (
              <button
                key={mood}
                className={`mood-button ${mood.toLowerCase()}`}
                onClick={() => loadSong(mood.toLowerCase())}
              >
                <span>{moodEmojis[mood.toLowerCase()]}</span>
                <span>{mood}</span>
              </button>
            ))}
            {/* Auto detect button */}
            <button onClick={() => setDetecting(true)} className="mood-button detect">
              🧠 Auto Detect Mood
            </button>
          </div>
        )}
      </div>

      <button className={`back-btn ${currentSong ? 'active' : ''}`} onClick={goBack}>
        ⬅️
      </button>

      {currentSong && (
        <div className="player active">
          <div className="audio-container">
            <div className="custom-audio-player">
              <div className="song-info">
                <h3 className="song-title">
                  {currentSong.split("/").pop().replace(".mp3", "").replace(/_/g, " ")}
                </h3>
                <p className="song-mood">{currentMood} mood</p>
              </div>
              <div className="audio-controls">
                <button className="control-btn" onClick={togglePlay}>
                  <span>{isPlaying ? '⏸️' : '▶️'}</span>
                </button>
                <div className="progress-container">
                  <div className="progress-bar" onClick={seek}>
                    <div 
                      className="progress-fill" 
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="time-display">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                <button className="control-btn" onClick={() => loadSong(currentMood)}>
                  ⏭️
                </button>
              </div>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={currentSong}
            autoPlay
            onEnded={handleSongEnded}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
}

export default App;




































































































// // client/src/App.js
// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import "./App.css";
// import Detection from "./Detection";

// const moods = ["Happy", "Sad", "Energetic", "Relaxed", "Fun", "Angry", "Neutral", "Surprise"];

// // Mood emoji mapping
// const moodEmojis = {
//   happy: "😊",
//   sad: "💙", 
//   energetic: "⚡",
//   relaxed: "🌙",
//   fun: "🎉",
//   angry: "🔥",
//   neutral: "⚪",
//   surprise: "✨"
// };

// function App() {
//   const [currentMood, setCurrentMood] = useState(null);
//   const [currentSong, setCurrentSong] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const audioRef = useRef(null);
//   const [detecting, setDetecting] = useState(false);


//   // Create floating particles effect
//   useEffect(() => {
//     const createFloatingParticles = () => {
//       const colors = {
//         happy: ['rgba(255, 193, 7, 0.6)', 'rgba(255, 87, 34, 0.5)', 'rgba(255, 235, 59, 0.4)'],
//         sad: ['rgba(75, 75, 75, 0.6)', 'rgba(50, 50, 70, 0.5)', 'rgba(30, 30, 50, 0.4)'],
//         energetic: ['rgba(255, 94, 77, 0.6)', 'rgba(255, 154, 0, 0.5)', 'rgba(255, 206, 84, 0.4)'],
//         relaxed: ['rgba(103, 58, 183, 0.6)', 'rgba(33, 150, 243, 0.5)'],
//         fun: ['rgba(233, 30, 99, 0.6)', 'rgba(156, 39, 176, 0.5)', 'rgba(103, 58, 183, 0.4)'],
//         angry: ['rgba(244, 67, 54, 0.6)', 'rgba(255, 87, 34, 0.5)'],
//         neutral: ['rgba(158, 158, 158, 0.4)', 'rgba(189, 189, 189, 0.3)'],
//         surprise: ['rgba(76, 175, 80, 0.6)', 'rgba(255, 193, 7, 0.5)', 'rgba(156, 39, 176, 0.4)']
//       };

//       // Remove existing particles
//       const existingParticles = document.querySelectorAll('.floating-particle');
//       existingParticles.forEach(particle => particle.remove());

//       if (currentMood && colors[currentMood]) {
//         const particleColors = colors[currentMood];
//         const particleCount = 15;
        
//         for (let i = 0; i < particleCount; i++) {
//           const particle = document.createElement('div');
//           particle.className = 'floating-particle';
//           const size = Math.random() * 8 + 4;
//           particle.style.width = size + 'px';
//           particle.style.height = size + 'px';
//           particle.style.left = Math.random() * 100 + '%';
//           particle.style.top = Math.random() * 100 + '%';
//           particle.style.background = particleColors[i % particleColors.length];
//           particle.style.animationDelay = Math.random() * 12 + 's';
//           particle.style.animationDuration = (Math.random() * 8 + 8) + 's';
//           document.body.appendChild(particle);
//         }
//       }
//     };

//     if (currentMood) {
//       setTimeout(() => {
//         createFloatingParticles();
//       }, 600);
//     }
//   }, [currentMood]);

//   // Load a random song from server
//   const loadSong = async (mood) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/get-random-song?mood=${mood}`);
//       const songUrl = response.data.songUrl;
//       setCurrentSong(`http://localhost:5000${songUrl}`);
//       setCurrentMood(mood);
//     } catch (error) {
//       console.error("Error fetching random song", error);
//     }
//   };

//   // When song ends, load another random
//   const handleSongEnded = () => {
//     if (currentMood) {
//       loadSong(currentMood);
//     }
//   };

//   // Audio event handlers
//   const handlePlay = () => setIsPlaying(true);
//   const handlePause = () => setIsPlaying(false);
//   const handleTimeUpdate = () => {
//     if (audioRef.current) {
//       setCurrentTime(audioRef.current.currentTime);
//     }
//   };
//   const handleLoadedMetadata = () => {
//     if (audioRef.current) {
//       setDuration(audioRef.current.duration);
//     }
//   };

//   // Toggle play/pause
//   const togglePlay = () => {
//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.pause();
//       } else {
//         audioRef.current.play();
//       }
//     }
//   };

//   // Seek function
//   const seek = (event) => {
//     const progressBar = event.currentTarget;
//     const rect = progressBar.getBoundingClientRect();
//     const clickX = event.clientX - rect.left;
//     const percentage = clickX / rect.width;
//     if (audioRef.current) {
//       audioRef.current.currentTime = percentage * duration;
//     }
//   };

//   // Format time helper
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Go back to mood selection
//   const goBack = () => {
//     setCurrentMood(null);
//     setCurrentSong(null);
//     setIsPlaying(false);
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//     }
//     // Remove particles
//     const existingParticles = document.querySelectorAll('.floating-particle');
//     existingParticles.forEach(particle => particle.remove());
//   };

//   return (
//     <div className={`app ${currentMood ? currentMood.toLowerCase() : ""}`}>
//       <div className={`main-content ${currentSong ? 'hidden' : ''}`}>
//         <h1 className="title">🎵 Mood Music Player</h1>
        
//         <div className="mood-selector">
//           {moods.map((mood) => (
//             <button
//               key={mood}
//               className={`mood-button ${mood.toLowerCase()}`}
//               onClick={() => loadSong(mood.toLowerCase())}
//             >
//               <span>{moodEmojis[mood.toLowerCase()]}</span>
//               <span>{mood}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       <button className={`back-btn ${currentSong ? 'active' : ''}`} onClick={goBack}>
//         ⬅️
//       </button>

//       {currentSong && (
//         <div className="player active">
//           <div className="audio-container">
//             <div className="custom-audio-player">
//               <div className="song-info">
//                 <h3 className="song-title">
//                   {currentSong.split("/").pop().replace(".mp3", "").replace(/_/g, " ")}
//                 </h3>
//                 <p className="song-mood">{currentMood} mood</p>
//               </div>
//               <div className="audio-controls">
//                 <button className="control-btn" onClick={togglePlay}>
//                   <span>{isPlaying ? '⏸️' : '▶️'}</span>
//                 </button>
//                 <div className="progress-container">
//                   <div className="progress-bar" onClick={seek}>
//                     <div 
//                       className="progress-fill" 
//                       style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
//                     ></div>
//                   </div>
//                   <div className="time-display">
//                     <span>{formatTime(currentTime)}</span>
//                     <span>{formatTime(duration)}</span>
//                   </div>
//                 </div>
//                 <button className="control-btn" onClick={() => loadSong(currentMood)}>
//                   ⏭️
//                 </button>
//               </div>
//             </div>
//           </div>
//           <audio
//             ref={audioRef}
//             src={currentSong}
//             autoPlay
//             onEnded={handleSongEnded}
//             onPlay={handlePlay}
//             onPause={handlePause}
//             onTimeUpdate={handleTimeUpdate}
//             onLoadedMetadata={handleLoadedMetadata}
//             style={{ display: 'none' }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;














































































































// // client/src/App.js
// import React, { useState, useRef } from "react";
// import axios from "axios";
// import "./App.css";

// const moods = ["Happy", "Sad", "Energetic", "Relaxed", "Fun", "Angry", "Neutral", "Surprise"];

// function App() {
//   const [currentMood, setCurrentMood] = useState(null);
//   const [currentSong, setCurrentSong] = useState(null);
//   const audioRef = useRef(null);

//   // load a random song from server
//   const loadSong = async (mood) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/get-random-song?mood=${mood}`);
//       const songUrl = response.data.songUrl;
//       setCurrentSong(`http://localhost:5000${songUrl}`);

//       setCurrentMood(mood);
//     } catch (error) {
//       console.error("Error fetching random song", error);
//     }
//   };

//   // when song ends, load another random
//   const handleSongEnded = () => {
//     if (currentMood) {
//       loadSong(currentMood);
//     }
//   };

//   return (
//     <div className={`app ${currentMood ? currentMood.toLowerCase() : ""}`}>
//       {!currentSong && (
//         <h1 className="title">🎵 Mood Music Player</h1>
//       )}

//       <div className="buttons">
//         {moods.map((mood) => (
//           <button
//             key={mood}
//             onClick={() => loadSong(mood.toLowerCase())}
//           >
//             {mood}
//           </button>
//         ))}
//       </div>

//       {currentSong && (
//         <div className="player">
//           <h2 className="song-title">
//       {currentSong.split("/").pop().replace(".mp3", "").replace(/_/g, " ")}
//           </h2>
//           <audio
//             ref={audioRef}
//             src={currentSong}
//             autoPlay
//             controls
//             controlsList="nodownload"
//             onEnded={handleSongEnded}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;



































































































// import React, { useState } from "react";
// import axios from "axios";

// const moods = ["Happy", "Sad", "Energetic", "Relaxed", "Fun", "Angry", "Neutral", "Surprise"];

// function App() {
//   const [currentSong, setCurrentSong] = useState(null);

//   const handleSearch = async (mood) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/get-random-song?mood=${mood}`);
//       const data = response.data;

//       if (data && data.songUrl) {
//         setCurrentSong({
//           url: `http://localhost:5000${data.songUrl}`,
//           mood: mood
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching random song:", error);
//     }
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h1>🎵 Mood Music Player</h1>
//       {moods.map((mood) => (
//         <button key={mood} onClick={() => handleSearch(mood)} style={{ margin: "5px" }}>
//           {mood}
//         </button>
//       ))}

//       <h2>Now Playing</h2>
//       {currentSong ? (
//         <>
//           <b>{currentSong.mood}</b>
//           <div style={{ marginTop: "10px" }}>
//             <audio
//               src={currentSong.url}
//               controls
//               controlsList="nodownload"
//               autoPlay
//               style={{ width: "100%" }}
//             />
//           </div>
//         </>
//       ) : (
//         <div>No song is playing yet.</div>
//       )}
//     </div>
//   );
// }

// export default App;























































































// // client/src/App.js
// import React, { useState } from "react";
// import axios from "axios";

// const moods = ["Happy", "Sad", "Energetic", "Relaxed", "Fun", "Angry", "Neutral", "Surprise"];

// function App() {
//   const [currentSong, setCurrentSong] = useState(null);
//   const [songList, setSongList] = useState([]);
//   const [showList, setShowList] = useState(false);

//   const handleSearch = async (mood) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/get-songs?mood=${mood}`);
//       const data = response.data;

//       if (data && data.songs && data.songs.length > 0) {
//         setCurrentSong(data.songs[0]); // play the first song
//         setSongList(data.songs);
//         setShowList(true);
//       }
//     } catch (error) {
//       console.error("Error fetching songs:", error);
//     }
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h1>🎵 Mood Music Player</h1>
//       {moods.map((mood) => (
//         <button key={mood} onClick={() => handleSearch(mood)} style={{ margin: "5px" }}>
//           {mood}
//         </button>
//       ))}

//       <h2>Now Playing</h2>
//       {currentSong ? (
//         <>
//           <b>{currentSong.snippet.title}</b>
//           <div>{currentSong.snippet.channelTitle}</div>
//           <div style={{ marginTop: "10px" }}>
//             <iframe
//               width="320"
//               height="180"
//               src={`https://www.youtube.com/embed/${currentSong.videoId}?autoplay=1`}
//               title="YouTube player"
//               allow="autoplay; encrypted-media"
//               allowFullScreen
//             ></iframe>
//           </div>
//         </>
//       ) : (
//         <div>No song is playing yet.</div>
//       )}

//       <button onClick={() => setShowList(!showList)} style={{ marginTop: "20px" }}>
//         {showList ? "Hide Song List" : "Show Song List"}
//       </button>

//       {showList && (
//         <div>
//           <h3>Top 10 Songs for this mood</h3>
//           <ul>
//             {songList.map((song, index) => (
//               <li key={index}>
//                 <b>{song.title}</b> <br />
//                 {song.channel}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;















































































































































// // App.js
// import { useState } from "react";
// import axios from "axios";
// import SongList from "./SongList";
// import Player from "./Player";

// function App() {
//   const [songs, setSongs] = useState([]);
//   const [mood, setMood] = useState("");
//   const [currentSong, setCurrentSong] = useState(null);
//   const [showList, setShowList] = useState(false);

//   const handleSearch = async (selectedMood) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/get-songs?mood=${selectedMood}`);
//       setSongs(response.data);
//       setMood(selectedMood);
//       setCurrentSong(response.data[0]);  // auto play the first preview
//       setShowList(false);                // hide the list initially
//     } catch (err) {
//       console.error(err);
//       alert("Error fetching songs. See console for details.");
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
//       <h1 className="text-3xl font-bold mb-6">🎵 Mood Music Player</h1>
//       <div className="flex gap-2 mb-6 flex-wrap justify-center">
//         {["Happy", "Sad", "Energetic", "Relaxed", "Fun", "Angry", "Neutral", "Surprise"].map((m) => (
//           <button
//             key={m}
//             className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-800 transition"
//             onClick={() => handleSearch(m)}
//           >
//             {m}
//           </button>
//         ))}
//       </div>

//       {currentSong && (
//         <Player track={currentSong} />
//       )}

//       <div className="mt-4">
//         <button
//           onClick={() => setShowList(!showList)}
//           className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
//         >
//           {showList ? "Hide Song List" : "Show Song List"}
//         </button>
//       </div>

//       {showList && (
//         <SongList songs={songs} mood={mood} />
//       )}
//     </div>
//   );
// }

// export default App;
































































































// // client/src/App.js
// import React, { useState } from "react";
// import axios from "axios";

// function App() {
//   const [selectedMood, setSelectedMood] = useState(null);
//   const [track, setTrack] = useState(null);
//   const [audio, setAudio] = useState(null);

//   const moods = ["Happy", "Sad", "Energetic", "Relaxed", "Neutral", "Fun", "Suprise Me"];

//   const handleMoodSelect = async (mood) => {
//     setSelectedMood(mood);

//     try {
//       const response = await axios.get(`http://localhost:5000/get-songs?mood=${mood}`);
//       const tracks = response.data;

// // pick a random song from the list
// const trackData = tracks[Math.floor(Math.random() * tracks.length)];

// if (trackData.preview_url) {
//   setTrack(trackData);
//   const preview = new Audio(trackData.preview_url);
//   setAudio(preview);
//   preview.play();
// } else {
//   alert("No preview available for this track.");
// }

//     } catch (err) {
//       console.error(err);
//       alert("Failed to get track for this mood.");
//     }
//   };

//   const handleStop = () => {
//     if (audio) {
//       audio.pause();
//       audio.currentTime = 0;
//     }
//     setTrack(null);
//     setSelectedMood(null);
//   };

//   return (
//     <div style={{ padding: "20px", textAlign: "center" }}>
//       {!track && (
//         <>
//           <h1>Hello, User!</h1>
//           <h2>Select your mood:</h2>
//           {moods.map((mood) => (
//             <button
//               key={mood}
//               onClick={() => handleMoodSelect(mood)}
//               style={{ margin: "10px", padding: "10px 20px", cursor: "pointer" }}
//             >
//               {mood}
//             </button>
//           ))}
//         </>
//       )}

//       {track && (
//         <div>
//           <h2>Playing: {track.name} by {track.artist}</h2>
//           <button onClick={handleStop} style={{ marginTop: "20px" }}>
//             Stop
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
