# Mood Music Player

A simple and interactive web app that plays music based on your mood.  
You can either **select your mood manually** (Happy, Sad, Angry, Relaxed, Energetic) or allow the app to **detect your mood** using your **facial expressions** (via face-api.js) and **hand gestures** (via MediaPipe Tasks Vision HandLandmarker).


## Features

- Manual mood selection (emoji buttons)
- Automatic mood detection (facial expressions + hand gestures)
- Mood‑based playlists (different local songs for each mood)
- Custom audio player (play, pause, skip, progress bar)
- Animated backgrounds & particles matching the detected mood
- Fully responsive UI


## Tech Stack

**Frontend:** React, HTML, CSS, JavaScript  
**Backend:** Node.js, Express  
**Libraries:**  
- [`face-api.js`](https://github.com/justadudewhohacks/face-api.js) – using **Tiny Face Detector** (`tiny_face_detector_model`) and **Face Expression Recognition** (`face_expression_model`) for real‑time facial expression detection  
- [`@mediapipe/tasks-vision`](https://developers.google.com/mediapipe) – for real-time hand gesture detection using **HandLandmarker**  
- `Axios` – for fetching songs from the backend  

## Folder Structure
- Mood_Music_Player/
- ├─ client/
- │  ├─ public/
- │  │  └─ models/        # face-api.js models & hand_landmarker.task
- │  └─ src/
- │     ├─ App.js
- │     ├─ Detection.js   # mood detection logic
- │     ├─ App.css
- │     └─ index.js
- └─ server/
-   ├─ server.js
-   └─ songs/


## Installation & Setup
> **Prerequisite:** Make sure you have Node.js and MySQL installed.

### Clone the repository
```bash
git clone https://github.com/<your-username>/mood-music-player.git
cd mood-music-player
```
### Install Dependencies
#### For Backend
- cd server
- npm install

#### For Frontend
- cd ../client
- npm install

### Add your songs
- Place .mp3 files in mood-specific folders inside songs folder
- songs/
- ├─ happy/
- ├─ sad/
- ├─ angry/
- ├─ relaxed/
- ├─ neutral/
- ├─ surprise/
- └─ energetic/

### Run the App

# Start backend
- cd server
- npm start

# Start frontend
- cd ../client
- npm start

- Open http://localhost:3000 in your browser.

> [!Note]
> Port may vary depending on your setup.
> On your machine, you can change it by creating a .env file in the server folder.
