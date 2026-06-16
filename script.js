// PinkWave Player - JavaScript
class PinkWavePlayer {
    constructor() {
        this.musicPlaylist = [];
        this.videoPlaylist = [];
        this.currentMusicIndex = -1;
        this.currentVideoIndex = -1;
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 0; // 0: off, 1: all, 2: one

        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        // Audio
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playBtn = document.getElementById('playBtn');
        this.playIcon = document.getElementById('playIcon');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.musicProgress = document.getElementById('musicProgress');
        this.musicProgressFill = document.getElementById('musicProgressFill');
        this.musicProgressThumb = document.getElementById('musicProgressThumb');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.trackTitle = document.getElementById('trackTitle');
        this.trackArtist = document.getElementById('trackArtist');

        // Video
        this.videoPlayer = document.getElementById('videoPlayer');
        this.videoOverlay = document.getElementById('videoOverlay');
        this.bigPlayBtn = document.getElementById('bigPlayBtn');
        this.videoPlayBtn = document.getElementById('videoPlayBtn');
        this.videoPlayIcon = document.getElementById('videoPlayIcon');
        this.videoPrevBtn = document.getElementById('videoPrevBtn');
        this.videoNextBtn = document.getElementById('videoNextBtn');
        this.videoMuteBtn = document.getElementById('videoMuteBtn');
        this.videoVolumeSlider = document.getElementById('videoVolumeSlider');
        this.videoProgress = document.getElementById('videoProgress');
        this.videoProgressFill = document.getElementById('videoProgressFill');
        this.videoCurrentTime = document.getElementById('videoCurrentTime');
        this.videoDuration = document.getElementById('videoDuration');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.videoVolumeIcon = document.getElementById('videoVolumeIcon');

        // Navigation
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.musicSection = document.getElementById('musicSection');
        this.videoSection = document.getElementById('videoSection');

        // Drop zones
        this.musicDropZone = document.getElementById('musicDropZone');
        this.musicInput = document.getElementById('musicInput');
        this.videoDropZone = document.getElementById('videoDropZone');
        this.videoInput = document.getElementById('videoInput');

        // Playlist
        this.playlistContainer = document.getElementById('playlist');
        this.clearPlaylistBtn = document.getElementById('clearPlaylist');
    }

    initEventListeners() {
        // Navigation
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchSection(btn.dataset.section));
        });

        // Music drop zone
        this.musicDropZone.addEventListener('click', () => this.musicInput.click());
        this.musicDropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.musicDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.musicDropZone.addEventListener('drop', (e) => this.handleMusicDrop(e));
        this.musicInput.addEventListener('change', (e) => this.handleMusicSelect(e));

        // Video drop zone
        this.videoDropZone.addEventListener('click', () => this.videoInput.click());
        this.videoDropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.videoDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.videoDropZone.addEventListener('drop', (e) => this.handleVideoDrop(e));
        this.videoInput.addEventListener('change', (e) => this.handleVideoSelect(e));

        // Music controls
        this.playBtn.addEventListener('click', () => this.toggleMusicPlay());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

        // Music progress
        this.musicProgress.addEventListener('click', (e) => this.seekMusic(e));
        this.musicProgress.addEventListener('mousemove', (e) => this.updateProgressThumb(e));

        // Audio events
        this.audioPlayer.addEventListener('timeupdate', () => this.updateMusicProgress());
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateMusicDuration());
        this.audioPlayer.addEventListener('ended', () => this.handleMusicEnd());

        // Video controls
        this.bigPlayBtn.addEventListener('click', () => this.toggleVideoPlay());
        this.videoPlayBtn.addEventListener('click', () => this.toggleVideoPlay());
        this.videoOverlay.addEventListener('click', () => this.toggleVideoPlay());
        this.videoPrevBtn.addEventListener('click', () => this.playVideoPrevious());
        this.videoNextBtn.addEventListener('click', () => this.playVideoNext());
        this.videoMuteBtn.addEventListener('click', () => this.toggleVideoMute());
        this.videoVolumeSlider.addEventListener('input', (e) => this.setVideoVolume(e.target.value));
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Video progress
        this.videoProgress.addEventListener('click', (e) => this.seekVideo(e));

        // Video events
        this.videoPlayer.addEventListener('timeupdate', () => this.updateVideoProgress());
        this.videoPlayer.addEventListener('loadedmetadata', () => this.updateVideoDuration());
        this.videoPlayer.addEventListener('ended', () => this.handleVideoEnd());
        this.videoPlayer.addEventListener('play', () => this.updateVideoPlayState(true));
        this.videoPlayer.addEventListener('pause', () => this.updateVideoPlayState(false));

        // Clear playlist
        this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    switchSection(section) {
        this.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });

        this.musicSection.classList.toggle('active', section === 'music');
        this.videoSection.classList.toggle('active', section === 'video');
    }

    // Drag and Drop
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleMusicDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
        this.addMusicFiles(files);
    }

    handleVideoDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
        this.addVideoFiles(files);
    }

    handleMusicSelect(e) {
        const files = Array.from(e.target.files);
        this.addMusicFiles(files);
    }

    handleVideoSelect(e) {
        const files = Array.from(e.target.files);
        this.addVideoFiles(files);
    }

    addMusicFiles(files) {
        files.forEach(file => {
            const track = {
                file: file,
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: URL.createObjectURL(file),
                duration: 0
            };
            this.musicPlaylist.push(track);
        });

        this.updatePlaylistDisplay();

        if (this.currentMusicIndex === -1 && this.musicPlaylist.length > 0) {
            this.currentMusicIndex = 0;
            this.loadMusic(0);
        }
    }

    addVideoFiles(files) {
        files.forEach(file => {
            const video = {
                file: file,
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: URL.createObjectURL(file),
                duration: 0
            };
            this.videoPlaylist.push(video);
        });

        this.updatePlaylistDisplay();

        if (this.currentVideoIndex === -1 && this.videoPlaylist.length > 0) {
            this.currentVideoIndex = 0;
            this.loadVideo(0);
        }
    }

    updatePlaylistDisplay() {
        const allItems = [...this.musicPlaylist, ...this.videoPlaylist];

        if (allItems.length === 0) {
            this.playlistContainer.innerHTML = '<p class="empty-message">Arrastra archivos aquí</p>';
            return;
        }

        this.playlistContainer.innerHTML = '';

        this.musicPlaylist.forEach((track, index) => {
            const item = this.createPlaylistItem(track, index, 'music');
            this.playlistContainer.appendChild(item);
        });

        this.videoPlaylist.forEach((video, index) => {
            const item = this.createPlaylistItem(video, index, 'video');
            this.playlistContainer.appendChild(item);
        });
    }

    createPlaylistItem(item, index, type) {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        if ((type === 'music' && index === this.currentMusicIndex) ||
            (type === 'video' && index === this.currentVideoIndex)) {
            div.classList.add('active');
        }

        div.innerHTML = `
            <div class="playlist-item-icon">
                ${type === 'music' ? `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                    </svg>
                ` : `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                `}
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${item.name}</div>
            </div>
        `;

        div.addEventListener('click', () => {
            if (type === 'music') {
                this.currentMusicIndex = index;
                this.loadMusic(index);
                this.playMusic();
            } else {
                this.currentVideoIndex = index;
                this.loadVideo(index);
                this.playVideo();
            }
        });

        return div;
    }

    // Music Player
    loadMusic(index) {
        if (index < 0 || index >= this.musicPlaylist.length) return;

        const track = this.musicPlaylist[index];
        this.audioPlayer.src = track.url;
        this.trackTitle.textContent = track.name;
        this.trackArtist.textContent = `PinkWave • Pista ${index + 1} de ${this.musicPlaylist.length}`;
        this.updatePlaylistDisplay();
    }

    toggleMusicPlay() {
        if (this.isPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }

    playMusic() {
        if (this.musicPlaylist.length === 0) return;
        this.audioPlayer.play();
        this.isPlaying = true;
        this.updatePlayButton();
    }

    pauseMusic() {
        this.audioPlayer.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    updatePlayButton() {
        if (this.isPlaying) {
            this.playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        } else {
            this.playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
        }
    }

    playPrevious() {
        if (this.musicPlaylist.length === 0) return;

        if (this.audioPlayer.currentTime > 3) {
            this.audioPlayer.currentTime = 0;
        } else {
            this.currentMusicIndex = (this.currentMusicIndex - 1 + this.musicPlaylist.length) % this.musicPlaylist.length;
            this.loadMusic(this.currentMusicIndex);
            if (this.isPlaying) this.playMusic();
        }
    }

    playNext() {
        if (this.musicPlaylist.length === 0) return;

        if (this.isShuffle) {
            this.currentMusicIndex = Math.floor(Math.random() * this.musicPlaylist.length);
        } else {
            this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicPlaylist.length;
        }

        this.loadMusic(this.currentMusicIndex);
        if (this.isPlaying) this.playMusic();
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtn.classList.toggle('active', this.isShuffle);
    }

    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        this.repeatBtn.classList.toggle('active', this.repeatMode > 0);

        if (this.repeatMode === 2) {
            this.repeatBtn.style.position = 'relative';
        } else {
            this.repeatBtn.style.position = '';
        }
    }

    setVolume(value) {
        this.audioPlayer.volume = value / 100;
    }

    seekMusic(e) {
        const rect = this.musicProgress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
    }

    updateProgressThumb(e) {
        const rect = this.musicProgress.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        this.musicProgressThumb.style.left = `${Math.max(0, Math.min(100, percent))}%`;
    }

    updateMusicProgress() {
        const { currentTime, duration } = this.audioPlayer;
        if (duration) {
            const percent = (currentTime / duration) * 100;
            this.musicProgressFill.style.width = `${percent}%`;
            this.currentTimeEl.textContent = this.formatTime(currentTime);
        }
    }

    updateMusicDuration() {
        this.durationEl.textContent = this.formatTime(this.audioPlayer.duration);
    }

    handleMusicEnd() {
        if (this.repeatMode === 2) {
            this.audioPlayer.currentTime = 0;
            this.playMusic();
        } else if (this.repeatMode === 1 || this.currentMusicIndex < this.musicPlaylist.length - 1) {
            this.playNext();
        } else {
            this.pauseMusic();
            this.audioPlayer.currentTime = 0;
        }
    }

    // Video Player
    loadVideo(index) {
        if (index < 0 || index >= this.videoPlaylist.length) return;

        const video = this.videoPlaylist[index];
        this.videoPlayer.src = video.url;
        this.updatePlaylistDisplay();
        this.videoOverlay.style.opacity = '1';
    }

    toggleVideoPlay() {
        if (this.videoPlayer.paused) {
            this.playVideo();
        } else {
            this.pauseVideo();
        }
    }

    playVideo() {
        if (this.videoPlaylist.length === 0) return;
        this.videoPlayer.play();
        this.videoOverlay.style.opacity = '0';
    }

    pauseVideo() {
        this.videoPlayer.pause();
    }

    updateVideoPlayState(playing) {
        if (playing) {
            this.videoPlayIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
            this.videoOverlay.style.opacity = '0';
        } else {
            this.videoPlayIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
        }
    }

    playVideoPrevious() {
        if (this.videoPlaylist.length === 0) return;

        if (this.videoPlayer.currentTime > 3) {
            this.videoPlayer.currentTime = 0;
        } else {
            this.currentVideoIndex = (this.currentVideoIndex - 1 + this.videoPlaylist.length) % this.videoPlaylist.length;
            this.loadVideo(this.currentVideoIndex);
            this.playVideo();
        }
    }

    playVideoNext() {
        if (this.videoPlaylist.length === 0) return;

        this.currentVideoIndex = (this.currentVideoIndex + 1) % this.videoPlaylist.length;
        this.loadVideo(this.currentVideoIndex);
        this.playVideo();
    }

    toggleVideoMute() {
        this.videoPlayer.muted = !this.videoPlayer.muted;
        this.updateVolumeIcon();
    }

    setVideoVolume(value) {
        this.videoPlayer.volume = value / 100;
        this.videoPlayer.muted = value === 0;
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        if (this.videoPlayer.muted || this.videoPlayer.volume === 0) {
            this.videoVolumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            `;
        } else {
            this.videoVolumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            `;
        }
    }

    toggleFullscreen() {
        const container = this.videoPlayer.closest('.video-container');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    }

    seekVideo(e) {
        const rect = this.videoProgress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.videoPlayer.currentTime = percent * this.videoPlayer.duration;
    }

    updateVideoProgress() {
        const { currentTime, duration } = this.videoPlayer;
        if (duration) {
            const percent = (currentTime / duration) * 100;
            this.videoProgressFill.style.width = `${percent}%`;
            this.videoCurrentTime.textContent = this.formatTime(currentTime);
        }
    }

    updateVideoDuration() {
        this.videoDuration.textContent = this.formatTime(this.videoPlayer.duration);
    }

    handleVideoEnd() {
        if (this.currentVideoIndex < this.videoPlaylist.length - 1) {
            this.playVideoNext();
        } else {
            this.videoOverlay.style.opacity = '1';
        }
    }

    // Utility
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    clearPlaylist() {
        this.musicPlaylist.forEach(t => URL.revokeObjectURL(t.url));
        this.videoPlaylist.forEach(v => URL.revokeObjectURL(v.url));

        this.musicPlaylist = [];
        this.videoPlaylist = [];
        this.currentMusicIndex = -1;
        this.currentVideoIndex = -1;

        this.audioPlayer.src = '';
        this.videoPlayer.src = '';

        this.trackTitle.textContent = 'Selecciona una canción';
        this.trackArtist.textContent = 'PinkWave Player';

        this.updatePlaylistDisplay();
        this.updateMusicProgress();
        this.musicProgressFill.style.width = '0%';
        this.currentTimeEl.textContent = '0:00';
        this.durationEl.textContent = '0:00';
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (this.musicSection.classList.contains('active')) {
                    this.toggleMusicPlay();
                } else {
                    this.toggleVideoPlay();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (this.musicSection.classList.contains('active')) {
                    this.audioPlayer.currentTime = Math.max(0, this.audioPlayer.currentTime - 5);
                } else {
                    this.videoPlayer.currentTime = Math.max(0, this.videoPlayer.currentTime - 5);
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.musicSection.classList.contains('active')) {
                    this.audioPlayer.currentTime = Math.min(this.audioPlayer.duration, this.audioPlayer.currentTime + 5);
                } else {
                    this.videoPlayer.currentTime = Math.min(this.videoPlayer.duration, this.videoPlayer.currentTime + 5);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (this.musicSection.classList.contains('active')) {
                    this.volumeSlider.value = Math.min(100, parseInt(this.volumeSlider.value) + 5);
                    this.setVolume(this.volumeSlider.value);
                } else {
                    this.videoVolumeSlider.value = Math.min(100, parseInt(this.videoVolumeSlider.value) + 5);
                    this.setVideoVolume(this.videoVolumeSlider.value);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (this.musicSection.classList.contains('active')) {
                    this.volumeSlider.value = Math.max(0, parseInt(this.volumeSlider.value) - 5);
                    this.setVolume(this.volumeSlider.value);
                } else {
                    this.videoVolumeSlider.value = Math.max(0, parseInt(this.videoVolumeSlider.value) - 5);
                    this.setVideoVolume(this.videoVolumeSlider.value);
                }
                break;
            case 'KeyF':
                if (this.videoSection.classList.contains('active')) {
                    this.toggleFullscreen();
                }
                break;
            case 'KeyM':
                if (this.musicSection.classList.contains('active')) {
                    this.toggleMusicPlay();
                } else {
                    this.toggleVideoMute();
                }
                break;
        }
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pinkWavePlayer = new PinkWavePlayer();
});
