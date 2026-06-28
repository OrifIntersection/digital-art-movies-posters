import { getAccessToken } from '../spotifyAuth.js';

// ─── Singleton SDK state ─────────────────────────────────────────────────────
let sdkPlayer = null;
let deviceId = null;
let sdkReady = false;
let sdkInitPromise = null;   // In-flight promise to avoid double-init
let progressInterval = null;
let pendingReadyResolvers = [];

// ─── SDK Bootstrap ───────────────────────────────────────────────────────────

window.onSpotifyWebPlaybackSDKReady = () => {
  sdkReady = true;
  pendingReadyResolvers.forEach(r => r());
  pendingReadyResolvers = [];
};

function waitForSDK() {
  if (sdkReady && window.Spotify) return Promise.resolve();
  return new Promise(resolve => pendingReadyResolvers.push(resolve));
}

async function initSDK(token) {
  if (sdkPlayer && deviceId) return deviceId;
  if (sdkInitPromise) return sdkInitPromise;

  sdkInitPromise = new Promise(async (resolve, reject) => {
    try {
      await waitForSDK();
    } catch (e) {
      sdkInitPromise = null;
      return reject(e);
    }

    sdkPlayer = new window.Spotify.Player({
      name: 'Digital Art — Affiches de film',
      volume: 0.5,
      getOAuthToken: async (cb) => {
        const t = await getAccessToken();
        cb(t || token);
      },
    });

    sdkPlayer.addListener('ready', ({ device_id }) => {
      deviceId = device_id;
      resolve(device_id);
    });
    sdkPlayer.addListener('not_ready', () => { deviceId = null; });
    sdkPlayer.addListener('initialization_error', ({ message }) => {
      sdkInitPromise = null;
      reject(new Error(message));
    });
    sdkPlayer.addListener('authentication_error', ({ message }) => {
      sdkInitPromise = null;
      reject(new Error('authentication_error: ' + message));
    });
    sdkPlayer.addListener('account_error', ({ message }) => {
      sdkInitPromise = null;
      reject(new Error('account_error'));
    });

    sdkPlayer.connect();
  });

  return sdkInitPromise;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function transferAndPlay(token, trackUri) {
  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Play failed: ${res.status}`);
  }
}

function formatTime(ms) {
  if (ms == null || isNaN(ms)) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function stopProgressTimer() {
  if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
}

export function stopActiveAudio() {
  stopProgressTimer();
  if (sdkPlayer) sdkPlayer.pause().catch(() => {});
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function initPlayer(movie, container) {
  stopActiveAudio();
  if (!container) return;

  const token = await getAccessToken();
  if (!token) {
    container.innerHTML = `
      <div class="spotify-player-unauthenticated">
        <p>Connectez-vous à Spotify pour écouter la bande originale de ce film.</p>
      </div>`;
    return;
  }

  // Show loading while fetching track metadata
  container.innerHTML = `
    <div class="soundtrack-player-loading">
      <div class="spinner"></div>
      <span>Chargement de la bande originale...</span>
    </div>`;

  // ── 1. Fetch track metadata ───────────────────────────────────────────────
  let track = null;
  try {
    if (movie.spotifyTrackId) {
      const res = await fetch(`https://api.spotify.com/v1/tracks/${movie.spotifyTrackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.id) track = data;
      }
    }
    if (!track) {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(movie.title + ' soundtrack')}&type=track&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        track = data.tracks?.items?.[0] || null;
      }
    }
  } catch (e) {
    console.error('Track fetch failed:', e);
  }

  if (!track) {
    container.innerHTML = `
      <div class="spotify-player-error"><p>Aucune piste trouvée pour ce film.</p></div>`;
    return;
  }

  const albumArt = track.album?.images?.[0]?.url || '';
  const trackName = track.name;
  const artistName = track.artists?.map(a => a.name).join(', ') || 'Artiste inconnu';
  const trackUri = `spotify:track:${track.id}`;
  const durationMs = track.duration_ms || 0;

  // ── 2. Render player UI immediately (SDK initialised lazily on first play) ─
  container.innerHTML = `
    <div class="soundtrack-player">
      <div class="track-header">
        <span class="soundtrack-label">BANDE ORIGINALE</span>
      </div>

      <div class="track-info">
        ${albumArt ? `<img src="${albumArt}" class="album-art" alt="Pochette album">` : ''}
        <div class="track-details">
          <span class="track-name" title="${trackName}">${trackName}</span>
          <span class="track-artist" title="${artistName}">${artistName}</span>
        </div>
      </div>

      <div class="progress-container">
        <span class="time-label" id="current-time">0:00</span>
        <input type="range" class="progress-bar" id="player-progress"
               min="0" max="${durationMs}" value="0" step="1000">
        <span class="time-label" id="duration">${formatTime(durationMs)}</span>
      </div>

      <div class="player-controls">
        <button class="player-btn control-stop" id="player-stop" title="Arrêter">
          <svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>
        </button>
        <button class="player-btn control-play-pause" id="player-play-pause" title="Lecture">
          <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <svg class="pause-icon hidden" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          <svg class="load-icon hidden" viewBox="0 0 24 24" class="spin-icon">
            <circle cx="12" cy="12" r="9" stroke="white" stroke-width="2.5"
              fill="none" stroke-dasharray="28 56" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <p class="sdk-status-msg hidden" id="sdk-status"></p>
    </div>
  `;

  // ── 3. Wire up controls ──────────────────────────────────────────────────
  const playPauseBtn = container.querySelector('#player-play-pause');
  const stopBtn = container.querySelector('#player-stop');
  const progressBar = container.querySelector('#player-progress');
  const currentTimeEl = container.querySelector('#current-time');
  const durationEl = container.querySelector('#duration');
  const playIcon = playPauseBtn.querySelector('.play-icon');
  const pauseIcon = playPauseBtn.querySelector('.pause-icon');
  const loadIcon = playPauseBtn.querySelector('.load-icon');
  const statusMsg = container.querySelector('#sdk-status');

  let isPlaying = false;
  let isSeeking = false;
  let hasStarted = false; // Track whether we've ever started playing

  function setStatus(msg) {
    if (msg) {
      statusMsg.textContent = msg;
      statusMsg.classList.remove('hidden');
    } else {
      statusMsg.classList.add('hidden');
    }
  }

  function setLoadingUI() {
    playIcon.classList.add('hidden');
    pauseIcon.classList.add('hidden');
    loadIcon.classList.remove('hidden');
    playPauseBtn.disabled = true;
    setStatus('Connexion au lecteur Spotify...');
  }

  function setPlayingUI(playing) {
    isPlaying = playing;
    loadIcon.classList.add('hidden');
    playPauseBtn.disabled = false;
    setStatus(null);
    if (playing) {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      startProgressTimer();
    } else {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      stopProgressTimer();
    }
  }

  function startProgressTimer() {
    stopProgressTimer();
    progressInterval = setInterval(async () => {
      if (isSeeking || !sdkPlayer) return;
      try {
        const state = await sdkPlayer.getCurrentState();
        if (!state) return;
        if (!isSeeking) {
          progressBar.max = state.duration;
          progressBar.value = state.position;
          currentTimeEl.textContent = formatTime(state.position);
          durationEl.textContent = formatTime(state.duration);
        }
        // Detect external pause (Spotify app, etc.)
        if (state.paused && isPlaying) setPlayingUI(false);
      } catch (_) {}
    }, 500);
  }

  // ── Play / Pause ──────────────────────────────────────────────────────────
  playPauseBtn.addEventListener('click', async () => {
    if (playPauseBtn.disabled) return;

    try {
      if (!isPlaying) {
        setLoadingUI();

        // Init SDK lazily on first interaction
        await initSDK(token);

        if (!hasStarted) {
          // First play: transfer playback to our virtual device
          await transferAndPlay(token, trackUri);
          hasStarted = true;
        } else {
          await sdkPlayer.resume();
        }

        setPlayingUI(true);
      } else {
        await sdkPlayer.pause();
        setPlayingUI(false);
      }
    } catch (err) {
      console.error('Play error:', err);
      loadIcon.classList.add('hidden');
      playPauseBtn.disabled = false;

      if (err.message === 'account_error') {
        playIcon.classList.remove('hidden');
        setStatus('⚠ Spotify Premium requis pour la lecture.');
      } else {
        playIcon.classList.remove('hidden');
        setStatus('Erreur de lecture. Réessayez.');
      }
      isPlaying = false;
    }
  });

  // ── Stop ──────────────────────────────────────────────────────────────────
  stopBtn.addEventListener('click', async () => {
    if (sdkPlayer) {
      try { await sdkPlayer.pause(); await sdkPlayer.seek(0); } catch (_) {}
    }
    hasStarted = false;
    progressBar.value = 0;
    currentTimeEl.textContent = '0:00';
    setPlayingUI(false);
  });

  // ── Seek ──────────────────────────────────────────────────────────────────
  progressBar.addEventListener('mousedown', () => { isSeeking = true; });
  progressBar.addEventListener('touchstart', () => { isSeeking = true; }, { passive: true });
  progressBar.addEventListener('input', () => {
    currentTimeEl.textContent = formatTime(Number(progressBar.value));
  });
  progressBar.addEventListener('change', async () => {
    if (sdkPlayer) {
      try { await sdkPlayer.seek(Number(progressBar.value)); } catch (_) {}
    }
    isSeeking = false;
  });
}
