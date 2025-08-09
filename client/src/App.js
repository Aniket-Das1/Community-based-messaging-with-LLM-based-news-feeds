import React, { useState,useRef, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
 
import Mid from './middle.js';
import FaceAR from './FaceAR';    

import FaceRegister from './FaceRegister'; 
const socket = io("  http://localhost:5000"); // Connect to the backend server



function App() {
  const [messages, setMessages] = useState([]);
  
  const [user, setUser] = useState(() => {
    return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  });

  const [useFaceLogin, setUseFaceLogin] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [useFaceRegister, setUseFaceRegister] = useState(false);
  const [password, setPassword] = useState('');
  const [community, setCommunity] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
 
  const [registerError, setRegisterError] = useState('');
  const [loginError, setLoginError] = useState('');

  const navigate = useNavigate();
  // Fetch messages from the backend
  useEffect(() => {
    if (isLoggedIn) {
      
      axios.get(" http://localhost:5000/messages", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Send JWT token in header
        }
      })
        .then(response => {
          if (Array.isArray(response.data)) {
          setMessages(response.data);
        } else {
          console.error("Invalid messages format", response.data);
        }
        })
        .catch(error => console.log(error));

      // Listen for new messages from the server
      socket.on('newMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages,message ]);
      });

      // Cleanup socket listener when the component unmounts
      return () => {
        socket.off('newMessage');
      };
    }
  }, [isLoggedIn]);



  
  


  // Function to delete a story







  const handleFaceLoginSuccess = (username) => {
    setUser(username); // Optionally set user
    setIsLoggedIn(true);
    setLoginError('');

    navigate('/middle');
  };
  
 
  const handleLogin = (e) => {
    e.preventDefault();
  
    if (user.trim() && password.trim()) {
      axios.post("http://localhost:5000/login", { username: user, password, community })
        .then(response => {
          // On successful login, update the state and redirect
          setIsLoggedIn(true);
          setLoginError('');
          localStorage.setItem('username', user);
          localStorage.setItem('password', password);
          navigate('/middle');
        })
        .catch(error => {
          setLoginError('Invalid username or password');
        });
    }
  };





  

   

  // Handle login
  

  // Handle registration
  const handleRegister = (e) => {
    e.preventDefault();
    
    // Check if user inputs are valid
    if (user.trim() && password.trim()) {
      // If face registration is used, include the face descriptor
      if (faceDescriptor) {
        axios
          .post("http://localhost:5000/register", {
            username: user,
            password,
            community,
            faceDescriptor,  // Include the face descriptor
          })
          .then((response) => {
            setRegisterError('');
            setLoginError('Registration successful! Please login.');
          })
          .catch((error) => {
            setRegisterError('Username already exists');
          });
      } else {
        setRegisterError('Please register your face');
      }
    } else {
      setRegisterError('Please fill out all fields');
    }
  };
  

  // Handle logout
 
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
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0)',
          }}
        > <div
  style={{
    border: '1px solid black',
    padding: '12px',
    marginBottom: '16px',color: 'black',
 backgroundColor: 'rgba(0,0,0,0)',
    borderRadius: '50px',
  }}
>
  <h3 style={{ marginTop: 0 }}>Available Communities:</h3>
  <ul style={{ paddingLeft: '20px', margin: 0 }}>
    {[
      'music',
      'games',
      'sports',
      'entertainment',
      'technology',
      'art',
      'travel',
      'food',
      'education',
      'health',
    ].map((community) => (
      <li key={community} style={{ marginBottom: '4px' }}>
        {community.charAt(0).toUpperCase() + community.slice(1)}
      </li>
    ))}
  </ul>
</div>
          <div
            style={{
              border: '1px solid rgba(0,0,0)',
              padding: '20px',
              borderRadius: '80px',
              width: '250px',
              backgroundColor: 'rgba(0,0,0,0)',
            }}
          >
            <h2 style={{ color: 'rgb(41, 42, 44)', textAlign: 'center', fontFamily: "'Tangerine', cursive", fontSize: '50px' }}>
              Login
            </h2>
            
            {!useFaceLogin ? (
              <>
                <form style={{ backgroundColor: 'rgba(0,0,0,0)',border:'1px solid black'}}onSubmit={handleLogin}>
                 
                  <input 
                    type="text"
                    placeholder="Enter your username"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    placeholder="Enter community"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    style={inputStyle}
                  />
                  <button type="submit" style={buttonStyle}>Login</button>
                 
                
                </form>
                OR
                 <button onClick={() => setUseFaceLogin(true)} style={buttonStyle}>
                   Face ID
                </button>
                
              </>
            ) : (
              <>
                <p style={{ textAlign: 'center' }}>Face login activated. Look at the camera.</p>
                <FaceAR onLoginSuccess={handleFaceLoginSuccess} />
                <button onClick={() => setUseFaceLogin(false)} style={buttonStyle}>
                  Back to Password Login
                </button>
              </>
            )}

            {loginError && <div style={{ color: 'red', textAlign: 'center' }}>{loginError}</div>}

            <h3 style={{ fontFamily: "'Tangerine', cursive", marginTop: '10px', textAlign: 'center' , fontSize:'30px',  color:'grey' }}>
              Don't have an account? Sign Up
            </h3>

            <form style={{ backgroundColor: 'rgba(0,0,0,0)',border:'1px solid black'}} onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Enter username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Enter community"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                style={inputStyle}
              />
              
              <button onClick={() => setUseFaceRegister(true)} style={buttonStyle}>
             First register your Face
            </button>

            <button type="submit" style={buttonStyle} disabled={!faceDescriptor}>
                Register
              </button>
            </form>
            
            {useFaceRegister && (
  <FaceRegister
    onRegistrationSuccess={(desc) => {
      console.log('Face descriptor received in parent:', desc);
      setFaceDescriptor(desc);
      setUseFaceRegister(false);
    }}
  />
)}

           

            
            {registerError && <div style={{ color: 'red', textAlign: 'center' }}>{registerError}</div>}
          </div>
        </div>
      )}

      {isLoggedIn && (
        <Routes>
          <Route path="/middle" element={<Mid />} />
        </Routes>
      )}
    </div>
  );
}

export default App;

// Styling (can move to CSS)
const inputStyle = {
  backgroundColor: 'rgba(0,0,0, 0)',
  border: '2px solid black',
  width: '100%',
  marginBottom: '0px',
  padding: '8px',
  position: 'relative',
  left: '-4%',
  top: '5px',
};

const buttonStyle = {
  backgroundColor: 'rgba(0,0,0, 0)',
  border: '1px solid rgba(0,0,0)',
  position: 'relative',
  left: '-2%',
  top: '5px',
  width: '100%',
  padding: '8px',
};
