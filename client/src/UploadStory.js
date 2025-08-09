import React, { useState } from 'react';
import axios from 'axios';

function UploadStory({ user }) {
  const [selectedFile, setSelectedFile] = useState(null);
 
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('user', user);
    formData.append('media', selectedFile);
  
    try {
      await axios.post('http://localhost:5000/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Story uploaded successfully!');
      setSelectedFile(null); // Reset the file input
    } catch (error) {
      console.error('Error uploading story:', error);
    }
  };

  return (
    <div  style={{border:'2px solid black',borderRadius: '50px'}}>
      <h3 style={{ color: 'rgb(149, 208, 238)',fontFamily: 'Tangerine, cursive' , position:'relative',left:'-20%',fontSize: '30px', fontWeight: 'bold', textAlign: 'center' }}>
  Upload a Story
</h3>
      <input style={{ color: 'rgb(251, 253, 254)',   border: '2px solid black', fontFamily: 'Tangerine, cursive' ,
    borderRadius: '100px', 
    fontSize: '10px', backgroundColor: 'rgb(0,0,0,0)', 
    fontWeight: 'bold', 
    cursor: 'pointer',position:'relative',top:'-30px',left:'1%'}} type="file" accept="image/*,video/*" onChange={handleFileChange} />
      <button onClick={handleUpload}   style={{ 
    backgroundColor: 'rgb(0,0,0,0)', 
    color: 'white', 
    padding: '12px 24px', 
    border: '2px solid black', 
    fontFamily: 'Tangerine, cursive' ,
    borderRadius: '80px', 
    fontSize: '20px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    position:'relative',left:'1%', 
    transition: 'background-color 0.3s ease' 
  }}>Upload</button>
    </div>
  );
}

export default UploadStory;
