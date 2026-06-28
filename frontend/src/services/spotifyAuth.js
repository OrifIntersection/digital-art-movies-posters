// Spotify OAuth 2.0 with PKCE (Proof Key for Code Exchange) implementation

// Helper to generate a random string of a given length
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Helper to compute SHA-256 hash of a string
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

// Helper to base64url encode an ArrayBuffer
function base64urlencode(a) {
  return btoa(String.fromCharCode(...new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper to generate code challenge from a code verifier
async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64urlencode(hashed);
}

// Redirect the user to Spotify Authorization page
export async function loginWithSpotify() {
  const clientID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || (window.location.origin + window.location.pathname);

  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('spotify_code_verifier', verifier);

  // Scopes required for the application
  // streaming + playback-state scopes are required by the Web Playback SDK
  const scope = [
    'user-read-private',
    'user-read-email',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
  ].join(' ');
  const authUrl = new URL("https://accounts.spotify.com/authorize");

  // Keep a random state to prevent CSRF
  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);

  const params = {
    response_type: 'code',
    client_id: clientID,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    redirect_uri: redirectUri,
    state: state
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

// Save tokens and expiration to local storage
function saveTokens(data) {
  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  // Store expiration timestamp in milliseconds
  const expiresAt = Date.now() + data.expires_in * 1000;
  localStorage.setItem('spotify_expires_at', expiresAt);
}

// Handle the redirect callback from Spotify
export async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (!code) {
    return null;
  }

  const storedState = localStorage.getItem('spotify_auth_state');
  if (state && storedState && state !== storedState) {
    console.error('State mismatch. CSRF token validation failed.');
    cleanUrl();
    return null;
  }

  const codeVerifier = localStorage.getItem('spotify_code_verifier');
  if (!codeVerifier) {
    console.error('No code verifier found in localStorage.');
    cleanUrl();
    return null;
  }

  const clientID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '9609dd7ea72a4d17aba89f565d76994e';
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || (window.location.origin + window.location.pathname);

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', payload);
    if (!response.ok) {
      throw new Error(`Token exchange failed with status ${response.status}`);
    }
    const data = await response.json();
    saveTokens(data);
    cleanUrl();
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    cleanUrl();
    return null;
  }
}

// Clean URL query parameters and clear temporary storage keys
function cleanUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  window.history.replaceState({}, document.title, url.pathname + url.search);
  localStorage.removeItem('spotify_code_verifier');
  localStorage.removeItem('spotify_auth_state');
}

// Refresh the access token using the refresh token
async function refreshAccessToken(refreshToken) {
  const clientID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '9609dd7ea72a4d17aba89f565d76994e';
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientID
    }),
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', payload);
    if (!response.ok) {
      throw new Error(`Failed to refresh token: status ${response.status}`);
    }
    const data = await response.json();
    saveTokens(data);
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    logout();
    return null;
  }
}

// Get standard access token (will automatically refresh if expired)
export async function getAccessToken() {
  const accessToken = localStorage.getItem('spotify_access_token');
  const expiresAt = localStorage.getItem('spotify_expires_at');
  const refreshToken = localStorage.getItem('spotify_refresh_token');

  if (!accessToken) {
    return null;
  }

  // If expired or about to expire (within 60s), attempt refresh
  if (expiresAt && Date.now() > Number(expiresAt) - 60000) {
    if (refreshToken) {
      return await refreshAccessToken(refreshToken);
    } else {
      logout();
      return null;
    }
  }

  return accessToken;
}

// Fetch user profile from Spotify Web API
export async function getUserProfile() {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Profile fetch failed: status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Log out and clear all storage
export function logout() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_expires_at');
  localStorage.removeItem('spotify_code_verifier');
  localStorage.removeItem('spotify_auth_state');
}
