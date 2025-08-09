
//
const newsRoutes = require('./backend/routes/news.route.js');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables
const multer = require('multer'); 
// Initialize express app
const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.io
const io = socketIo(server); // Create Socket.io server
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use("/api/news", newsRoutes);
// MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/messageApp'; // Replace with your MongoDB URI

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });
  
// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  community: {
    type: String,
    required: true
  },
  faceDescriptor: { type: [Number], required: true },
});

const User = mongoose.model('User', userSchema);
//stories
const storySchema = new mongoose.Schema({
  user: { type: String, required: true },
  media: { type: String, required: true },   // URL of the uploaded media
  mediaType: { type: String, required: true }, // 'image' or 'video'
  date: { type: Date, default: Date.now },
  
});

const Story = mongoose.model('Story', storySchema);
// Message Schema
const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  file: { type: String, default: null },
  fileType: { type: String, default: null },
  community: { type: String, default: null }, // Keep this nullable for global messages
  isGlobal: { type: Boolean, default: false }, // New field
  date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);
// Upload Story (Image/Video)
app.post('/stories', upload.single('media'), async (req, res) => {
  const { user } = req.body;
  const media = req.file ? `/uploads/${req.file.filename}` : null;
  const mediaType = req.file ? req.file.mimetype.startsWith('image/') ? 'image' : 'video' : null;

  const newStory = new Story({ user, media, mediaType });

  try {
    await newStory.save();
    res.status(200).json(newStory);
  } catch (err) {
    res.status(500).json({ error: 'Error uploading story' });
  }
});

// Get All Stories (excluding expired ones)
/*app.get('/stories', async (req, res) => {
  const now = new Date();
  try {
    const stories = await Story.find({ date: { $gte: now - 24 * 60 * 60 * 1000 } }); // 24 hours
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stories' });
  }
});*/


app.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find().sort({ date: -1 }); // Sort by latest
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: 'Error fetching stories' });
  }
});
// Registration Route (without encryption)
//app.post('/register', async (req, res) => {
 /* const { username, password,community } = req.body;

  // Check if the username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Create a new user with plaintext password (no hashing)
  const user = new User({ username, password ,community});

  try {
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error registering user' });
  }
});
*/app.post('/face-login', async (req, res) => {
  
  const { descriptor } = req.body;
  console.log('Received descriptor:', descriptor);
  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ message: 'Invalid face descriptor' });
  }

  try {
    const users = await User.find();

    const euclideanDistance = (desc1, desc2) => {
      return Math.sqrt(desc1.reduce((sum, val, i) => sum + (val - desc2[i]) ** 2, 0));
    };

    let match = null;
    for (const user of users) {
      const storedDescriptor = user.faceDescriptor;
      const distance = euclideanDistance(descriptor, storedDescriptor);

      if (distance < 0.6) {
        match = user;
        break;
      }
    }

    if (match) {
      return res.status(200).json({ username: match.username });
    } else {
      return res.status(401).json({ message: 'Face not recognized' });
    }
  } catch (error) {
    console.error('Face login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login Route (without encryption)
app.post('/login', async (req, res) => {
  const { username, password,community} = req.body;

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // Compare password with the stored plaintext password (no hashing)
  if (user.password !== password) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }
  if (user.community !== community) {
    return res.status(400).json({ message: 'Not your community' });
  }
  


  res.status(200).json({ message: 'Login successful' });
});

// Middleware to protect routes (No token required)
const verifyToken = (req, res, next) => {
  next(); // No authentication required anymore
};

// Messages Route (protected, but without token-based authentication)
app.get('/messages', async (req, res) => {
  const { community } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { isGlobal: true },
        { community: community }
      ]
    }).sort({ date: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});



// Send Message Route (protected, but without token-based authentication)
/*app.post('/messages', verifyToken, async (req, res) => {
  const { user, message } = req.body;
  const newMessage = new Message({ user, message });

  try {
    await newMessage.save();
    io.emit('newMessage', newMessage); // Broadcast the new message to all clients
    res.status(200).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Error saving message' });
  }
});*/
const database = {}; // username: userObject

app.post('/register', async (req, res) => {
  const { username, password, community, faceDescriptor } = req.body;

  // Basic validation
  if (
    !username ||
    !password ||
    !community ||
    !Array.isArray(faceDescriptor) ||
    faceDescriptor.length !== 128
  ) {
    return res.status(400).json({ message: 'Missing or invalid fields' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Save user with plain password (not safe for production)
    const newUser = new User({
      username,
      password,         // ⚠️ Stored in plain text — not safe
      community,
      faceDescriptor,
    });

    await newUser.save();

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});
app.post('/messages', upload.single('file'), async (req, res) => {
  const { user, message, community, isGlobal } = req.body;

  if (!isGlobal && !allowedCommunities.includes(community)) {
    return res.status(400).json({ error: 'Invalid community' });
  }

  const file = req.file ? `/uploads/${req.file.filename}` : null;

  const newMessage = new Message({
    user,
    message,
    file,
    fileType: req.file ? req.file.mimetype : null,
    isGlobal: isGlobal === 'true', // convert string to boolean
    community: isGlobal === 'true' ? null : community // null if global
  });

  try {
    await newMessage.save();
    io.emit('newMessage', newMessage);
    res.status(200).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Error saving message' });
  }
});

// Set up Socket.io to listen for events
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Set up the HTTP server to listen on port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
