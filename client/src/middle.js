import React, { useState,useRef, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
import UploadStory from './UploadStory';  // For uploading stories
import Stories from './Stories';   
import App from './App';
import FaceAR from './FaceAR';
import NewsFeed from "./NewsFeed";
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
const socket = io("  http://localhost:5000"); // Connect to the backend server



function Mid() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(() => {
    return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  });
  const [password, setPassword] = useState('');
  const [community, setCommunity] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [isLoggedout, setIsLoggedout] = useState(!!user);
  const chatContainerRef = useRef(null); 
  const [registerError, setRegisterError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newFile, setNewFile] = useState(null); 
  const navigate = useNavigate();
   const savedUser = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
  const selectedCommunity = localStorage.getItem('selectedCommunity');
    const [isGlobal, setIsGlobal] = useState(false);
  // Fetch messages from the backend
  useEffect(() => {
    
    if (savedUser) setUser(savedUser);
    if (savedPassword) setPassword(savedPassword);
    if (isLoggedIn && selectedCommunity) {
      // Log the selectedCommunity to ensure it's set correctly
      console.log('Selected community:', selectedCommunity);
  
      // Fetch messages from the server, including the community query parameter
      axios.get("http://localhost:5000/messages", {
        params: {
          community: selectedCommunity, // Send selectedCommunity as a query parameter
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Send JWT token in header
        }
      })
      .then(response => {
        console.log("Messages received:", response.data);
        
        if (Array.isArray(response.data)) {
          setMessages(response.data); // Directly set the messages
        } else {
          console.error("Invalid messages format", response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });
  
      // Listen for new messages from the server
      socket.on('newMessage', (message) => {
        console.log("New message received:", message);
        if (message.isGlobal === true || message.community === selectedCommunity) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });
  
      // Cleanup socket listener when the component unmounts or when isLoggedIn changes
      return () => {
        socket.off('newMessage');
      };
    }
  }, [isLoggedIn, selectedCommunity]);  // Dependency array ensures it re-runs when either isLoggedIn or selectedCommunity changes
   // Dependency array ensures it re-runs when either isLoggedIn or selectedCommunity changes
  



  
  


  













  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !newFile) return; // Don't send empty messages without a file
  
    const formData = new FormData();
    formData.append('user', user);
    formData.append('message', newMessage);
    formData.append('isGlobal', isGlobal);
    if (!isGlobal) {
      formData.append('community', selectedCommunity); // Only needed if not global
    }
    if (newFile) {
      formData.append('file', newFile);
    }
  
    try {
      const response = await axios.post("http://localhost:5000/messages", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setMessages([ response.data,...messages]);
      setNewMessage('');
      setNewFile(null); // Reset the file input
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (user.trim() && password.trim()) {
      axios.post(" http://localhost:5000/login", { username: user, password ,community})
        .then(response => {
          localStorage.setItem('token', response.data.token); 
          localStorage.setItem('selectedCommunity', community);// Store the JWT token
          setIsLoggedIn(true);
          setLoginError('');
        })
        .catch(error => {
          setLoginError('Invalid community');
        });
    }
  };


  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser('');
    setPassword('');
    setMessages([]);
  };

  return (
    
    <div className="App">
      {!isLoggedIn && (
 <h1
      style={{
        fontFamily: 'Tangerine',
        fontSize: '80px',
        fontWeight: 'bold',
      
        color: 'rgb(184, 222, 240)',
        textShadow: '5px 5px 5px rgba(0,0,0)',
        letterSpacing: '1px',
        margin: '20px 0',
      }}
    >
      
     <div class= "outlined-text"style={{position:'fixed'}}>UAPSpace</div> 
    </h1>
      )}
      
     {/* Login Form */}
{!isLoggedIn && (
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '-150%',
      
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0)', 
    }}
  >
     <div className="App">
      
       
    </div>
    
    <div
      style={{
        position:'relative',
        left:'1020%',
       
        padding: '20px',
        borderRadius: '80px',
        
        width: '1500px',
        backgroundColor: 'rgba(176, 62, 62, 0)', 
      }}
    >
      <h2 style={{ color: 'rgb(41, 42, 44)',textAlign: 'center',fontFamily: "'Tangerine', cursive" , fontSize: '50px'}}>Choose Community:</h2>
        
      <form style={{backgroundColor: 'rgba(0,0,0, 0)',position:'relative',left:'100%',width:'1200px', border: '1px solid black', borderRadius: '80px'}} onSubmit={handleLogin}>
     
      
     
  {[ 'music',
  'Games',
  'Sports',
  'Entertainment',
  'Technology',
  'Art',
  'Travel',
  'Food',
  'Education',
  'Health'].map((option) => (
    <button
      key={option}
      value={option}
      onClick={() => setCommunity(option)}
      style={{
        backgroundColor: community === option ? '#ccc' : 'rgb(239, 238, 238)',
        color: 'black',
        border: '2px solid black',
        padding: '8px',
        cursor: 'pointer',
        flex: 1,
      }}
    >
      {option}
    </button>
  ))}

       
      </form>
      {loginError && <div style={{ color: 'red', textAlign: 'center' }}>{loginError}</div>}

      
    </div>
  </div>
)}
      
      
      <Routes>
      <Route path="/App" element={<App />} />
      {/* Add more routes here if needed */}
    </Routes>
      

    
      {/* Messages Section */}
      {isLoggedIn && (
        
        <div  >
           <div style={{position:'fixed', left:'3%',top:'15%'}}><Stories /></div>
 <div
  style={{
    position: 'fixed',
    left: '46%',
    top: '15%',
    width: '100px',
    height: '550px',
   marginBottom: '10px' ,
    fontSize: '12px',
    
  }}
>
  <NewsFeed />
</div>
 
           <div style={{position:'fixed',left:'1%',top:'75%'}}> {isLoggedIn && user ? <UploadStory user={user} /> : <p>Loading...</p>}</div>
           <button onClick={handleLogout} style={{ color:'white',backgroundColor: 'rgb(0,0,0,0)',fontFamily: 'Tangerine, cursive' ,position: 'relative', left: '-150px',top:'-10px', fontSize: '30px', fontWeight: 'bold', textAlign: 'center' , }}><div style={{position:'fixed'}}>⬅Back</div></button>
          <h2 style={{ color: 'rgb(28, 30, 32)',fontFamily: 'Tangerine, cursive' , position:'fixed',left:'13%',top:'01px',fontSize: '50px', fontWeight: 'bold', textAlign: 'center' }}>Welcome {user}</h2>
          <div className="jd">
          {/* Upload Story Section */}
          
          
            {/* Stories Section */}
           
           
            </div>
          

          <div className="message-input-container">
            <textarea style={{ backgroundColor: 'rgb(0,0,0,0)', borderRadius:'30px',border:'2px solid black'}}
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <input  style={{ position:'relative',top:'50px',left:'-0.1%', borderRadius: '120px'}}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setNewFile(e.target.files[0])}
                  />
                  <div style={{ marginTop: '10px' }}>
    <label>
      <input  style={{ position:'relative',width:'50px',top:'2px',left:'-10%', fontFamily:'Tangerine,cursive'}}
        type="checkbox"
        checked={isGlobal}
        onChange={(e) => setIsGlobal(e.target.checked)}
      />
     <div style={{fontFamily:'Tangerine,cursive'}}> Send To Every Community</div>
    </label>
  </div>

            <button style={{ backgroundColor: 'rgb(0,0,0,0)',color: 'rgba(251, 246, 246, 1)',border: '2px solid black',borderRadius: '120px',fontFamily: 'Tangerine' ,position:'relative',top:'0.5px',left:'-35%', fontSize: '30px', fontWeight: 'bold', textAlign: 'center' }} onClick={handleSendMessage}>Send</button>
          </div>

          <div ref={chatContainerRef}>
    <h2 style={{ color: 'rgb(251, 253, 254)',fontFamily: 'Tangerine, cursive' ,borderRadius: '50px',  fontSize: '30px', fontWeight: 'bold',  border: '2px solid black',left:'67%',top:'50px', position: 'fixed',textAlign: 'center'}}>Messages</h2>
    {messages.map((msg, index) => (
      <div style={{ color: 'rgb(226, 231, 236)' , position:'relative',left:'370%',fontSize: '25px', fontWeight: 'bold', textAlign: 'center' ,borderRadius: '50px',  border: '2px solid black' }}key={index}>
        <div style={{width:'300px' }}><strong style={{ color: 'rgb(154, 202, 225)', fontSize: '50px',fontFamily: 'Tangerine, cursive' }}>{msg.user}</strong>: {msg.message}</div>
        {msg.file && (
          <div>
            {msg.fileType.startsWith('image/') ? (
              <img src={msg.file} alt="sent" style={{ maxWidth: '200px' }} />
            ) : (
              <a href={msg.file} target="_blank" rel="noopener noreferrer">
                Download File
              </a>
            )}
          </div>
        )}
        <br />
        <small>{new Date(msg.date).toLocaleString()}</small>
        
      </div>
    ))}
 
</div>
        </div>
      )}
    </div>





  );
}

export default Mid;
