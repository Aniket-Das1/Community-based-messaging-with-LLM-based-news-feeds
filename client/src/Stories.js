import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Stories() {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/stories');
        setStories(response.data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? stories.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === stories.length - 1 ? 0 : prevIndex + 1
    );
  };/*You're saying:

If the current index is at the last story, go back to the first story (index 0).

Otherwise, move to the next story (prevIndex + 1).*/

  if (stories.length === 0) {
    return <p>Loading stories...</p>;
  }

  const currentStory = stories[currentIndex];

  return (
    <div style={{ border: '1px solid black', padding: '20px', textAlign: 'center' }} className="stories-container">
      <div style={{ border: '1px solid black', marginBottom: '10px' }} className="stories-wrapper">
        <div key={currentStory._id} className="story">
          {currentStory.media ? (
            currentStory.mediaType === 'image' ? (
              <img
                src={`http://localhost:5000${currentStory.media}`}
                alt="story"
                style={{ width: '300px', height: '300px' }}
              />
            ) : currentStory.mediaType === 'video' ? (
              <video
                src={`http://localhost:5000${currentStory.media}`}
                controls
                style={{ width: '300px', height: '300px' }}
              />
            ) : (
              <p>Unsupported media type</p>
            )
          ) : (
            <p>No media available</p>
          )}

          <p
            style={{
              color: 'rgb(13, 15, 16)',
              fontFamily: 'Tangerine',
              position: 'relative',
              top: '10px',
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {currentStory.user}:
          </p>
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button style={{ 
    backgroundColor: 'rgb(0,0,0,0)', 
    color: 'black', 
    padding: '12px 24px', 
    border: '2px solid black', 
    fontFamily: 'Tangerine, cursive' ,
    borderRadius: '50px', 
    fontSize: '30px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    position:'relative',
    transition: 'background-color 0.3s ease' 
  }}onClick={handlePrevious}>←</button>
        <button style={{ 
    backgroundColor: 'rgb(0,0,0,0)', 
    color: 'black', 
    padding: '12px 24px', 
    border: '2px solid black', 
    fontFamily: 'Tangerine, cursive' ,
    borderRadius: '50px', 
    fontSize: '30px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    position:'relative', marginLeft: '10px',
    transition: 'background-color 0.3s ease' 
  }}onClick={handleNext} >
          →
        </button>
      </div>
    </div>
  );
}

export default Stories;
