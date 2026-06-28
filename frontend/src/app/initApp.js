import { renderMoviesList } from '../features/movies/renderMoviesList.js';
import closeEditor from '../features/movies/closeEditor.js';
import {
  handleCallback,
  getAccessToken,
  getUserProfile,
  loginWithSpotify,
  logout,
} from '../services/spotifyAuth.js';
import { renderSpotifyLoggedIn, renderSpotifyLoggedOut } from '../components/SpotifyAuthWidget.js';

const backButton = document.getElementById('back-button');
backButton && backButton.addEventListener('click', closeEditor);

async function renderSpotifyWidget() {
  const container = document.getElementById('spotify-auth-container');
  if (!container) return;

  container.innerHTML = '<div style="color: #94a3b8; font-size: 0.85rem;">Chargement...</div>';

  try {
    const token = await getAccessToken();

    if (token) {
      const profile = await getUserProfile();

      if (profile) {
        const displayName = profile.display_name || 'Utilisateur Spotify';
        const imageUrl = profile.images && profile.images.length > 0 ? profile.images[0].url : '';
        const initial = displayName.charAt(0).toUpperCase();

        renderSpotifyLoggedIn(container, profile, () => {
          logout();
          renderSpotifyWidget();
        });
        return;
      }
    }
  } catch (error) {
    console.error('Error rendering Spotify widget:', error);
  }

  renderSpotifyLoggedOut(container, loginWithSpotify);
}

async function initApp() {
  await handleCallback();
  await renderSpotifyWidget();
  renderMoviesList();
}

initApp();
export default initApp;
