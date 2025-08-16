const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors()); 
const PORT = 5000;

// absolute path to your OneDrive songs
const songsPath = "C:/Users/diyas/OneDrive/Songs";

// serve OneDrive songs as static
app.use("/songs", express.static(songsPath));

// health check route
app.get("/", (req, res) => {
  res.send("Mood music server is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

const moods = ["happy", "sad", "angry", "relaxed", "fun", "energetic", "neutral", "surprise"];

app.get("/get-random-song", (req, res) => {
  const mood = req.query.mood?.toLowerCase();
  if (!mood || !moods.includes(mood)) {
    return res.status(400).json({ error: "Invalid mood" });
  }

  // absolute path to the mood folder
  const folderPath = path.join(
    "C:/Users/diyas/OneDrive/Songs",
    mood
  );

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Could not read mood folder" });
    }

    // only .mp3 files
    const mp3s = files.filter(file => file.endsWith(".mp3"));
    if (mp3s.length === 0) {
      return res.status(404).json({ error: "No songs found" });
    }

    const randomIndex = Math.floor(Math.random() * mp3s.length);
    const randomSong = mp3s[randomIndex];

    // return relative path
    res.json({ songUrl: `/songs/${mood}/${randomSong}` });
  });
});











































































































// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const preferredArtists = require("./preferredArtists");

// dotenv.config();

// const app = express();
// app.use(cors());

// const PORT = 5000;

// const moodToQuery = {
//   Happy: "happy pop songs",
//   Sad: "sad acoustic songs",
//   Energetic: "energetic workout music",
//   Relaxed: "calm relaxing music",
//   Fun: "party dance music",
//   Angry: "angry rock songs",
//   Neutral: "top trending songs",
// };

// // for surprise mood
// const surpriseQueries = [
//   "pop songs",
//   "rock songs",
//   "metal hits",
//   "dance music",
//   "lofi chill",
//   "acoustic covers",
//   "party anthems",
//   "indie hits"
// ];

// app.get("/get-songs", async (req, res) => {
//   const mood = req.query.mood || "Happy";
//   let searchQuery;

// if (mood === "Surprise") {
//   const randomIndex = Math.floor(Math.random() * surpriseQueries.length);
//   searchQuery = surpriseQueries[randomIndex];
// } else {
//   searchQuery = moodToQuery[mood] || "top songs";
// }


//   try {
//     const response = await axios.get(
//       `https://www.googleapis.com/youtube/v3/search`, {
//         params: {
//           part: "snippet",
//           q: searchQuery,
//           type: "video",
//           videoCategoryId: "10", // Music category on YouTube
//           key: process.env.YOUTUBE_API_KEY,
//           maxResults: 30
//         }
//       }
//     );

//     const items = response.data.items;

//     // divide results into 2 buckets
//     const bucket1 = [];
//     const bucket2 = [];

//     items.forEach(item => {
//       const artistMatch = preferredArtists.some(artist =>
//         item.snippet.channelTitle.toLowerCase().includes(artist.toLowerCase())
//       );
//       if (artistMatch) {
//         bucket1.push(item);
//       } else {
//         bucket2.push(item);
//       }
//     });

//     // probability selection: 70% bucket1, 30% bucket2
//     const finalSongs = [];
//     while (finalSongs.length < 10 && (bucket1.length || bucket2.length)) {
//       const prob = Math.random();
//       if (prob < 0.7 && bucket1.length) {
//         finalSongs.push(bucket1.pop());
//       } else if (bucket2.length) {
//         finalSongs.push(bucket2.pop());
//       }
//     }

//     res.json({ songs: finalSongs });


//   } catch (error) {
//     console.error("Error searching YouTube tracks", error.message);
//     res.status(500).json({ error: "Failed to fetch songs" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });





























































































// // server/server.js
// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const preferredArtists = require("./preferredArtists");


// dotenv.config();

// const app = express();
// app.use(cors());

// let accessToken = null;

// async function getAccessToken() {
//   try {
//     const response = await axios.post(
//       "https://accounts.spotify.com/api/token",
//       "grant_type=client_credentials",
//       {
//         headers: {
//           Authorization:
//             "Basic " +
//             Buffer.from(
//               process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
//             ).toString("base64"),
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );
//     accessToken = response.data.access_token;
//     console.log("✅ Spotify token refreshed");
//   } catch (err) {
//     console.error("Error getting Spotify token", err);
//   }
// }

// getAccessToken();
// setInterval(getAccessToken, 1000 * 60 * 30);

// const moodToGenre = {
//   happy: "pop",
//   sad: "acoustic",
//   angry: "metal",
//   relaxed: "lofi",
//   energetic: "dance",
//   fun: "party",
//   neutral: "indie",
// };

// app.get("/get-songs", async (req, res) => {
//   const mood = req.query.mood || "happy";
//   let genre;
// if (mood.toLowerCase() === "surprise") {
//   const randomGenres = ["pop", "rock", "metal", "dance", "lofi", "acoustic", "party", "indie"];
//   genre = randomGenres[Math.floor(Math.random() * randomGenres.length)];
// } else {
//   genre = moodToGenre[mood.toLowerCase()] || "pop";
// }


//   try {
//     const response = await axios.get("https://api.spotify.com/v1/search", {
//       headers: {
//         Authorization: "Bearer " + accessToken,
//       },
//       params: {
//         q: genre,
//         type: "track",
//         limit: 50,
//       },
//     });

//     const tracks = response.data.tracks.items;

//     const bucket1 = [];
//     const bucket2 = [];

//     tracks.forEach((track) => {
//       const artistNames = track.artists.map((a) => a.name.toLowerCase());
//       if (
//         artistNames.some((artist) =>
//           preferredArtists.map((p) => p.toLowerCase()).includes(artist)
//         )
//       ) {
//         bucket1.push(track);
//       } else {
//         bucket2.push(track);
//       }
//     });

//     const random = Math.random();
//     let chosenBucket;

//     if (random < 0.7 && bucket1.length > 0) {
//       chosenBucket = bucket1;
//     } else if (bucket2.length > 0) {
//       chosenBucket = bucket2;
//     } else {
//       chosenBucket = tracks;
//     }

//     const finalTracks = chosenBucket.slice(0, 10);

//     res.json(finalTracks);
//   } catch (err) {
//     console.error("Error searching Spotify tracks", err);
//     res.status(500).json({ error: "Failed to fetch songs" });
//   }
// });

// app.listen(5000, () => {
//   console.log("✅ Server running on http://localhost:5000");
// });































































































// // your big list of popular artists
// const artists = [
//   "Arijit Singh","Taylor Swift","Shawn Mendes","Shreya Ghoshal","Ed Sheeran","Justin Bieber",
//   "Sonu Nigam","Udit Narayan","Kumar Sanu","Shaan","Ariana Grande","SP Balasubrahmanyam","Chitra",
//   "Atif Aslam","Chinmayi","Usha Uthup","Shankar Mahadevan","Suchitra","Kavita Krishnamurthy",
//   "A. R. Rahman","Papon","Adnan Sami","Himesh Reshammiya","Parampara Tandon","Kishore Kumar",
//   "Suresh Wadkar","Amit Kumar","Lata Mangeshkar","Anuradha Paudwal","Alka Yagnik","Mohit Chauhan",
//   "Arko","Tulsi Kumar","Akhil Sachdeva","Vishal Mishra","Neeti Mohan","Ash King","Clinton Cerejo",
//   "Rahat Fateh Ali Khan","Pritam","Mansheel Gujral","Javed Bashir","Diljit Dosanjh","Tochi Raina",
//   "Rekha Bhardwaj","Kailash Kher","Roop Kumar","Gulzar","Rekha","Sukhwinder Singh","B Praak",
//   "Coldplay","BTS","Seventeen","Twice","Olivia Rodrigo","Blackpink","Jennie","Rose","Lauv","Marina",
//   "James Arthur","Backstreet Boys","One Direction","Shafqat Amanat Ali","Elvis Presley","Shaun","Ellie Goulding",
//   "Grace Potter","Christina Perri"
// ];

// // moods mapped to genres
// const moodGenres = {
//   Happy: "pop upbeat dance",
//   Sad: "sad acoustic ballad",
//   Angry: "metal rock rap",
//   Relaxed: "chill lofi calm",
//   Energetic: "workout edm pop",
//   Neutral: "romantic pop soft rock",
//   Fun: "party pop dance",
//   "Surprise Me": "" // random, no mood filters
// };


























































































// // server/server.js
// const express = require("express");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const querystring = require("querystring");

// dotenv.config();
// const app = express();
// app.use(cors());
// const port = 5000;

// let accessToken = null;

// // get the token once on server startup
// async function getAccessToken() {
//   try {
//     const response = await axios.post(
//       "https://accounts.spotify.com/api/token",
//       querystring.stringify({ grant_type: "client_credentials" }),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           Authorization:
//             "Basic " +
//             Buffer.from(
//               process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
//             ).toString("base64"),
//         },
//       }
//     );
//     accessToken = response.data.access_token;
//     console.log("✅ Spotify access token acquired.");
//   } catch (error) {
//     console.error("Error getting Spotify access token:", error);
//   }
// }

// getAccessToken();

// // refresh token every 55 minutes (token lasts ~60 min)
// setInterval(getAccessToken, 55 * 60 * 1000);

// // route to search for mood-based songs
// app.get("/get-songs", async (req, res) => {
//   const mood = req.query.mood || "happy"; // default mood
//   try {
//     const response = await axios.get(
//       `https://api.spotify.com/v1/search`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         params: {
//           q: mood,
//           type: "track",
//           limit: 10,
//         },
//       }
//     );

//     const songs = response.data.tracks.items.map((track) => ({
//       name: track.name,
//       artist: track.artists[0].name,
//       preview_url: track.preview_url,
//       album_image: track.album.images[0].url,
//     }));

//     res.json(songs);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching songs from Spotify");
//   }
// });

// app.listen(port, () => {
//   console.log(`Server listening on http://localhost:${port}`);
// });
