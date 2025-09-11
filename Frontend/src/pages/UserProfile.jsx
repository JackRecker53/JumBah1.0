import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { API_BASE_URL } from "../config";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const { user, logout, isAuthenticated, token, updateProfileImage } = useAuth();
  const { points } = useGame();
  const navigate = useNavigate();
  const [gameProgress, setGameProgress] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: user?.username || "Adventure Seeker",
    email: "jer@jumbah.com",
    location: "Kota Kinabalu, Sabah",
    joinDate: "January 2024",
    favoriteAnimal: "Sun Bear",
    profilePicture: user?.profileImage || "/adventure/traveler-avatar.svg"
  });
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    location: "",
    favoriteAnimal: ""
  });
  const [loading, setLoading] = useState(true);

  // Tourism trinkets/achievements data
  const trinkets = [
    { id: 1, name: "Mount Kinabalu Explorer", icon: "🏔️", unlocked: true, description: "Visited Mount Kinabalu" },
    { id: 2, name: "Orangutan Friend", icon: "🦧", unlocked: true, description: "Spotted orangutans in Sepilok" },
    { id: 3, name: "Island Hopper", icon: "🏝️", unlocked: false, description: "Visit 3 different islands" },
    { id: 4, name: "Cultural Ambassador", icon: "🎭", unlocked: true, description: "Learned traditional Sabahan culture" },
    { id: 5, name: "Foodie Explorer", icon: "🍜", unlocked: false, description: "Try 10 local dishes" },
    { id: 6, name: "Adventure Master", icon: "🎖️", unlocked: false, description: "Complete all quests" }
  ];

  useEffect(() => {
    fetchGameProgress();
  }, []);

  const fetchGameProgress = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/game-progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGameProgress(data);
      }
    } catch (error) {
      console.error('Error fetching game progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImageUrl = e.target.result;
        setUserInfo(prev => ({ ...prev, profilePicture: newImageUrl }));
        updateProfileImage(newImageUrl);
        // Here you would typically upload to your backend
        // For now, we'll update the local state and context
      };
      reader.readAsDataURL(file);
    }
    setIsEditingImage(false);
  };

  const handleEditProfile = () => {
    setEditForm({
      name: userInfo.name,
      email: userInfo.email,
      location: userInfo.location,
      favoriteAnimal: userInfo.favoriteAnimal
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    setUserInfo(prev => ({
      ...prev,
      name: editForm.name || prev.name,
      email: editForm.email || prev.email,
      location: editForm.location || prev.location,
      favoriteAnimal: editForm.favoriteAnimal || prev.favoriteAnimal
    }));
    setIsEditingProfile(false);
    setEditForm({ name: "", email: "", location: "", favoriteAnimal: "" });
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditForm({ name: "", email: "", location: "", favoriteAnimal: "" });
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="user-profile">
        <div className="profile-container">
          <div className="not-logged-in-message">
            You are not logged in
          </div>
          <div className="auth-prompt">
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your profile.</p>
            <button onClick={() => navigate("/login")} className="btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-profile">
        <div className="profile-container">
          <div className="loading">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={userInfo.profilePicture} alt="Profile" onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNmMGY4ZmYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0iIzM0OThmZiIvPjxwYXRoIGQ9Ik0yMCA3NWMwLTE2LjU2OSAxMy40MzEtMzAgMzAtMzBzMzAgMTMuNDMxIDMwIDMwIiBmaWxsPSIjMzQ5OGZmIi8+PC9zdmc+';
          }} />
          <button 
            className="edit-avatar-btn" 
            onClick={() => setIsEditingImage(true)}
            title="Change profile picture"
          >
            ✏️
          </button>
          {isEditingImage && (
            <div className="image-upload-modal">
              <div className="modal-content">
                <h3>Change Profile Picture</h3>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  id="image-upload"
                />
                <div className="modal-buttons">
                  <button onClick={() => setIsEditingImage(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="profile-info">
          {isEditingProfile ? (
            <div className="edit-profile-form">
              <h2 className="edit-form-title">Edit Profile Information</h2>
              
              <div className="edit-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="edit-field">
                  <label htmlFor="edit-name">Display Name</label>
                  <input 
                    id="edit-name"
                    type="text" 
                    value={editForm.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your display name"
                  />
                  <small className="field-description">This is how your name will appear to other users</small>
                </div>
              </div>

              <div className="edit-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="edit-field">
                  <label htmlFor="edit-email">Email Address</label>
                  <input 
                    id="edit-email"
                    type="email" 
                    value={editForm.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                  <small className="field-description">Your email address for account notifications</small>
                </div>
                <div className="edit-field">
                  <label htmlFor="edit-location">Location</label>
                  <input 
                    id="edit-location"
                    type="text" 
                    value={editForm.location} 
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter your location"
                  />
                  <small className="field-description">Your current city or region</small>
                </div>
              </div>

              <div className="edit-section">
                <h3 className="section-title">Preferences</h3>
                <div className="edit-field">
                  <label htmlFor="edit-animal">Favorite Local Animal</label>
                  <select 
                    id="edit-animal"
                    value={editForm.favoriteAnimal} 
                    onChange={(e) => handleInputChange('favoriteAnimal', e.target.value)}
                  >
                    <option value="Sun Bear">🐻 Sun Bear</option>
                    <option value="Orangutan">🦧 Orangutan</option>
                    <option value="Proboscis Monkey">🐒 Proboscis Monkey</option>
                    <option value="Pygmy Elephant">🐘 Pygmy Elephant</option>
                    <option value="Rhinoceros Hornbill">🦅 Rhinoceros Hornbill</option>
                    <option value="Clouded Leopard">🐆 Clouded Leopard</option>
                  </select>
                  <small className="field-description">Choose your favorite Sabah wildlife</small>
                </div>
              </div>
              
              <div className="edit-buttons">
                <button onClick={handleSaveProfile} className="save-btn">💾 Save Changes</button>
                <button onClick={handleCancelEdit} className="cancel-btn">❌ Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{userInfo.name}</h1>
              <div className="profile-details">
                <p className="profile-email">📧 {userInfo.email}</p>
                <p className="profile-location">📍 {userInfo.location}</p>
                <p className="profile-animal">🐻 Favorite Animal: {userInfo.favoriteAnimal}</p>
                <p className="join-date">📅 Member since {userInfo.joinDate}</p>
              </div>
              <button onClick={handleEditProfile} className="edit-profile-btn">✏️ Edit Profile</button>
            </>
          )}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="profile-content">
        <div className="stats-section">
          <h2>🎮 Game Progress</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{gameProgress?.points || points || 0}</div>
              <div className="stat-label">Adventure Points</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{gameProgress?.completed_quests?.length || 0}</div>
              <div className="stat-label">Quests Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{gameProgress?.achievements?.length || 0}</div>
              <div className="stat-label">Achievements</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{gameProgress?.collected_stamps?.length || 0}</div>
              <div className="stat-label">Stamps Collected</div>
            </div>
          </div>
        </div>

        <div className="trinkets-section">
          <h2>🏆 Tourism Trinkets</h2>
          <p className="section-description">Collect these special badges as you explore Sabah!</p>
          <div className="trinkets-grid">
            {trinkets.map(trinket => (
              <div key={trinket.id} className={`trinket-card ${trinket.unlocked ? 'unlocked' : 'locked'}`}>
                <div className="trinket-icon">{trinket.icon}</div>
                <div className="trinket-name">{trinket.name}</div>
                <div className="trinket-description">{trinket.description}</div>
                {trinket.unlocked && <div className="unlocked-badge">✓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <h2>📍 Recent Adventures</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">🏔️</span>
              <div className="activity-details">
                <div className="activity-title">Visited Mount Kinabalu</div>
                <div className="activity-date">2 days ago</div>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🦧</span>
              <div className="activity-details">
                <div className="activity-title">Completed Sepilok Quest</div>
                <div className="activity-date">1 week ago</div>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🎯</span>
              <div className="activity-details">
                <div className="activity-title">Earned Cultural Ambassador Badge</div>
                <div className="activity-date">2 weeks ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-secondary" onClick={() => navigate('/game')}>
            Continue Adventure
          </button>
          <button className="btn-secondary" onClick={() => navigate('/ai-planner')}>
            Plan New Trip
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserProfile;
