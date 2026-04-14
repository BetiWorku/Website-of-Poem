import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const THEME_ICONS = {
  Love: '❤️',
  Nature: '🌿',
  Life: '✨',
  Loss: '🕊️',
  Hope: '🌅',
  Freedom: '🦋',
};

function UserProfile() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await API.get(`/auth/user/${id}`);
        setUserData(userResponse.data);

        const poemsResponse = await API.get(`/poems?author=${id}`);
        // If the backend doesn't support ?author filter yet, we'll filter on frontend
        // Currently your poemRoutes.js doesn't explicitly filter by author in GET /, 
        // but we'll fetch all and filter for now to guarantee results.
        const allPoems = poemsResponse.data;
        const userPoems = allPoems.filter(p => p.author === id || p.authorName === userResponse.data.username);
        
        setPoems(userPoems);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="profile-container fade-in">
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Opening the Scrolls...</h2>
      </div>
    </div>
  );

  if (!userData) return (
    <div className="profile-container fade-in">
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2>User Not Found</h2>
        <button onClick={() => navigate('/')} className="contact-submit-btn">Return Home</button>
      </div>
    </div>
  );

  return (
    <div className="profile-container fade-in">
      <div className="profile-header">
        <div className="profile-avatar">
          {userData.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{userData.username}</h1>
          <div className="profile-meta">
            <span>📝 {poems.length} Poems</span>
            <span>📅 Joined {new Date(userData.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <h2 className="profile-section-title">Published Works</h2>
      
      {poems.length > 0 ? (
        <div className="user-poem-grid">
          {poems.map(poem => (
            <div 
              key={poem._id} 
              className="card" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/poems/${poem._id}`)}
            >
              <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                {THEME_ICONS[poem.category] || '📜'} {poem.category}
              </div>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.4rem' }}>{poem.title}</h3>
              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.9rem', 
                lineHeight: '1.6',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {poem.content}
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>${poem.price}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(poem.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-poems">
          <p>This poet hasn't shared any verses with the world yet.</p>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
