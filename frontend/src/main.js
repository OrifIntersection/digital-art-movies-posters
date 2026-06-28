// Imports
import "./style.css";
import renderMoviesList from './movies/renderMoviesList.js';
import closeEditor from './movies/closeEditor.js';
import { handleCallback, getAccessToken, getUserProfile, loginWithSpotify, logout } from './spotifyAuth.js';

// Back button in editor
const backButton = document.getElementById('back-button');
backButton && backButton.addEventListener('click', closeEditor);

// Function to render the Spotify widget based on authentication state
async function renderSpotifyWidget() {
  const container = document.getElementById('spotify-auth-container');
  if (!container) return;

  container.innerHTML = `<div style="color: #94a3b8; font-size: 0.85rem;">Chargement...</div>`;

  try {
    const token = await getAccessToken();
    
    if (token) {
      const profile = await getUserProfile();
      
      if (profile) {
        const displayName = profile.display_name || 'Utilisateur Spotify';
        const imageUrl = profile.images && profile.images.length > 0 ? profile.images[0].url : '';
        const initial = displayName.charAt(0).toUpperCase();

        container.innerHTML = `
          <div class="spotify-user-card" id="spotify-card">
            <div class="spotify-avatar-container">
              ${imageUrl ? `<img src="${imageUrl}" alt="${displayName}" class="spotify-avatar">` : `<span class="spotify-avatar-fallback">${initial}</span>`}
            </div>
            <div class="spotify-user-info">
              <span class="spotify-username" title="${profile.email || ''}">${displayName}</span>
              <span class="spotify-status">
                <span class="spotify-status-dot"></span>
                Spotify connecté
              </span>
            </div>
            <button class="spotify-logout-btn" id="spotify-logout" title="Se déconnecter">
              <svg class="spotify-logout-icon" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        `;

        document.getElementById('spotify-logout').addEventListener('click', () => {
          logout();
          renderSpotifyWidget();
        });
        return;
      }
    }
  } catch (error) {
    console.error('Error rendering Spotify widget:', error);
  }

  // Not logged in or error fallback
  container.innerHTML = `
    <button class="spotify-btn" id="spotify-login-btn">
      <svg class="spotify-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.076-.67-.135-.746-.47-.077-.337.135-.67.472-.747 3.856-.88 7.15-.502 9.822 1.134.296.18.387.563.205.858zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.125-.847-.107-.972-.52-.125-.413.108-.847.52-.972 3.665-1.112 8.225-.574 11.343 1.344.367.226.488.707.26 1.072zm.105-2.836C14.392 8.78 8.04 8.57 4.363 9.686c-.564.17-1.16-.154-1.332-.718-.172-.564.154-1.16.718-1.332 4.24-1.287 11.266-1.04 15.37 1.4 1.256.745.397.747 1.488-.13.394-.653.22-.823-.174-1.05z"/>
      </svg>
      Se connecter avec Spotify
    </button>
  `;

  document.getElementById('spotify-login-btn').addEventListener('click', loginWithSpotify);
}

// Launch the app
async function initApp() {
  // Handle redirect from Spotify authorization if code is in parameters
  await handleCallback();
  
  // Render the Spotify header widget
  await renderSpotifyWidget();
  
  // Render movies list
  renderMoviesList();
}

initApp();