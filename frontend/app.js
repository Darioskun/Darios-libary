// API Base URL - Change this to your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
const state = {
    currentPlaylist: [],
    currentIndex: 0,
    isPlaying: false,
    repeatMode: 'off', // off, one, all
    isShuffle: false,
    videos: [],
    playlists: [],
    filteredVideos: []
};

// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const queueBtn = document.getElementById('queue-btn');
const queueModal = document.getElementById('queue-modal');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadProgress = document.getElementById('upload-progress');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const navItems = document.querySelectorAll('.nav-item');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const playlistModal = document.getElementById('playlist-modal');
const videoPlayerModal = document.getElementById('video-player-modal');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadAllData();
    loadPlaylists();
});

// Event Listeners
function initializeEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const viewId = `${item.dataset.view}-view`;
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(viewId).classList.add('active');
            
            if (item.dataset.view === 'library') {
                loadAllData();
            } else if (item.dataset.view === 'playlists') {
                loadPlaylists();
            }
        });
    });

    // Player Controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    queueBtn.addEventListener('click', () => {
        queueModal.classList.add('active');
        renderQueueList();
    });

    // Progress and Volume
    progressBar.addEventListener('change', (e) => {
        audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
    });
    
    progressBar.addEventListener('input', (e) => {
        audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
    });

    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });

    // Audio Events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleAudioEnded);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);

    // Upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = 'rgba(29, 185, 84, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.backgroundColor = '';
        fileInput.files = e.dataTransfer.files;
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
            uploadArea.innerHTML = `<i class="fas fa-check"></i><h3>${fileInput.files[0].name}</h3>`;
        }
    });

    uploadBtn.addEventListener('click', uploadVideo);

    // Playlist Modal
    createPlaylistBtn.addEventListener('click', () => {
        playlistModal.classList.add('active');
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });

    document.getElementById('save-playlist-btn').addEventListener('click', createPlaylist);

    // Search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// Load All Videos
async function loadAllData() {
    try {
        const response = await fetch(`${API_BASE_URL}/videos`);
        state.videos = await response.json();
        state.filteredVideos = [...state.videos];
        renderVideos();
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

// Load Playlists
async function loadPlaylists() {
    try {
        const response = await fetch(`${API_BASE_URL}/playlists`);
        state.playlists = await response.json();
        renderPlaylists();
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
}

// Render Videos
function renderVideos() {
    const videosList = document.getElementById('videos-list');
    videosList.innerHTML = '';

    state.filteredVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="card-cover">
                <i class="fas fa-music"></i>
            </div>
            <div class="card-title">${video.title}</div>
            <div class="card-subtitle">${video.artist}</div>
            <div class="card-actions">
                <button onclick="playVideoImmediately('${video.id}')">▶ Phát</button>
                <button onclick="addToQueue('${video.id}')">➕ Hàng đợi</button>
            </div>
        `;
        videosList.appendChild(card);
    });
}

// Render Playlists
function renderPlaylists() {
    const playlistsGrid = document.getElementById('playlists-grid');
    const playlistsList = document.getElementById('playlists-list');

    if (playlistsGrid) {
        playlistsGrid.innerHTML = '';
        state.playlists.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'playlist-card';
            card.innerHTML = `
                <div class="card-cover">
                    <i class="fas fa-list"></i>
                </div>
                <div class="card-title">${playlist.name}</div>
                <div class="card-subtitle">${playlist.videoIds?.length || 0} bài</div>
                <div class="card-actions">
                    <button onclick="openPlaylist('${playlist.id}')">Mở</button>
                    <button onclick="deletePlaylist('${playlist.id}')">Xóa</button>
                </div>
            `;
            playlistsGrid.appendChild(card);
        });
    }

    if (playlistsList) {
        playlistsList.innerHTML = '';
        state.playlists.forEach(playlist => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.innerHTML = `
                <div class="playlist-info" onclick="openPlaylist('${playlist.id}')">
                    <h3>${playlist.name}</h3>
                    <p>${playlist.videoIds?.length || 0} bài • ${playlist.description || 'Không có mô tả'}</p>
                </div>
                <div class="playlist-item-actions">
                    <button onclick="openPlaylist('${playlist.id}')">Phát</button>
                    <button onclick="deletePlaylist('${playlist.id}')">Xóa</button>
                </div>
            `;
            playlistsList.appendChild(item);
        });
    }
}

// Open Playlist
async function openPlaylist(playlistId) {
    try {
        const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`);
        const playlist = await response.json();
        
        state.currentPlaylist = playlist.videos || [];
        state.currentIndex = 0;
        
        if (state.currentPlaylist.length > 0) {
            playVideo(state.currentPlaylist[0].id);
        }
    } catch (error) {
        console.error('Error opening playlist:', error);
    }
}

// Upload Video
async function uploadVideo() {
    const file = fileInput.files[0];
    if (!file) {
        alert('Vui lòng chọn một file');
        return;
    }

    const title = document.getElementById('video-title').value || file.name;
    const artist = document.getElementById('video-artist').value || 'Unknown';

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('artist', artist);

    uploadProgress.style.display = 'block';

    try {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = `Đang tải lên: ${Math.round(percentComplete)}%`;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 201) {
                alert('Tải lên thành công!');
                fileInput.value = '';
                document.getElementById('video-title').value = '';
                document.getElementById('video-artist').value = '';
                uploadArea.innerHTML = `<i class="fas fa-cloud-upload-alt"></i><h3>Kéo video vào đây hoặc nhấp để chọn</h3><p>Hỗ trợ: MP4, WebM, Ogg, MP3, WAV (Tối đa 500MB)</p>`;
                uploadProgress.style.display = 'none';
                loadAllData();
            } else {
                alert('Lỗi: ' + xhr.responseText);
            }
        });

        xhr.addEventListener('error', () => {
            alert('Lỗi tải lên');
        });

        xhr.open('POST', `${API_BASE_URL}/videos/upload`);
        xhr.send(formData);
    } catch (error) {
        console.error('Error uploading video:', error);
        alert('Lỗi tải lên');
    }
}

// Create Playlist
async function createPlaylist() {
    const name = document.getElementById('playlist-name').value;
    const description = document.getElementById('playlist-description').value;

    if (!name.trim()) {
        alert('Vui lòng nhập tên danh sách phát');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/playlists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            alert('Tạo danh sách phát thành công!');
            playlistModal.classList.remove('active');
            document.getElementById('playlist-name').value = '';
            document.getElementById('playlist-description').value = '';
            loadPlaylists();
        }
    } catch (error) {
        console.error('Error creating playlist:', error);
    }
}

// Delete Playlist
async function deletePlaylist(playlistId) {
    if (!confirm('Bạn chắc chắn muốn xóa danh sách phát này?')) return;

    try {
        await fetch(`${API_BASE_URL}/playlists/${playlistId}`, { method: 'DELETE' });
        loadPlaylists();
    } catch (error) {
        console.error('Error deleting playlist:', error);
    }
}

// Play Video
async function playVideo(videoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/videos/${videoId}`);
        const video = await response.json();

        audioPlayer.src = video.url;
        playerTitle.textContent = video.title;
        playerArtist.textContent = video.artist;
        audioPlayer.play();
        state.isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } catch (error) {
        console.error('Error playing video:', error);
    }
}

// Play Video Immediately
function playVideoImmediately(videoId) {
    state.currentPlaylist = state.filteredVideos;
    state.currentIndex = state.filteredVideos.findIndex(v => v.id === videoId);
    playVideo(videoId);
}

// Add to Queue
function addToQueue(videoId) {
    const video = state.videos.find(v => v.id === videoId);
    if (video && !state.currentPlaylist.find(v => v.id === videoId)) {
        state.currentPlaylist.push(video);
        alert('Đã thêm vào hàng đợi');
    }
}

// Player Functions
function togglePlay() {
    if (state.currentPlaylist.length === 0) {
        alert('Vui lòng chọn một video để phát');
        return;
    }

    if (state.isPlaying) {
        audioPlayer.pause();
        state.isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioPlayer.play();
        state.isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function playNext() {
    if (state.currentPlaylist.length === 0) return;
    
    state.currentIndex = (state.currentIndex + 1) % state.currentPlaylist.length;
    playVideo(state.currentPlaylist[state.currentIndex].id);
}

function playPrevious() {
    if (state.currentPlaylist.length === 0) return;
    
    state.currentIndex = (state.currentIndex - 1 + state.currentPlaylist.length) % state.currentPlaylist.length;
    playVideo(state.currentPlaylist[state.currentIndex].id);
}

function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    shuffleBtn.style.color = state.isShuffle ? 'var(--primary-color)' : 'var(--text-primary)';
    
    if (state.isShuffle) {
        state.currentPlaylist = state.currentPlaylist.sort(() => Math.random() - 0.5);
    }
}

function toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const currentMode = state.repeatMode;
    const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
    state.repeatMode = nextMode;
    
    const icons = {
        'off': '<i class="fas fa-redo"></i>',
        'all': '<i class="fas fa-redo" style="color: var(--primary-color)"></i>',
        'one': '<i class="fas fa-redo" style="color: var(--primary-color)"></i> <span style="font-size: 10px;">1</span>'
    };
    
    repeatBtn.innerHTML = icons[nextMode];
    repeatBtn.dataset.repeat = nextMode;
}

function handleAudioEnded() {
    if (state.repeatMode === 'one') {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else {
        playNext();
    }
}

function updateProgress() {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = percent;
    progressBar.style.setProperty('--value', percent + '%');
    
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
}

function updateDuration() {
    durationEl.textContent = formatTime(audioPlayer.duration);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Queue List
function renderQueueList() {
    const queueList = document.getElementById('queue-list');
    queueList.innerHTML = '';

    state.currentPlaylist.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = `queue-item ${index === state.currentIndex ? 'active' : ''}`;
        item.innerHTML = `
            <div class="queue-item-info">
                <div class="queue-item-title">${video.title}</div>
                <div class="queue-item-artist">${video.artist}</div>
            </div>
            <div class="queue-item-time">${index + 1}/${state.currentPlaylist.length}</div>
        `;
        item.addEventListener('click', () => {
            state.currentIndex = index;
            playVideo(video.id);
            renderQueueList();
        });
        queueList.appendChild(item);
    });
}

// Search
function performSearch() {
    const query = searchInput.value.toLowerCase();
    
    if (!query) {
        state.filteredVideos = [...state.videos];
    } else {
        state.filteredVideos = state.videos.filter(video =>
            video.title.toLowerCase().includes(query) ||
            video.artist.toLowerCase().includes(query)
        );
    }
    
    renderVideos();
}

// Make functions globally accessible
window.playVideoImmediately = playVideoImmediately;
window.addToQueue = addToQueue;
window.openPlaylist = openPlaylist;
window.deletePlaylist = deletePlaylist;
