class NeonWavePlayer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.isPlaying = false;
        this.isLooping = false;
        this.currentTrack = null;
        this.playlist = [];

        this.initElements();
        this.initEventListeners();
        this.initAudioContext();
        this.startVisualizations();
    }

    initElements() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.transportPlay = document.getElementById('transportPlay');
        this.transportStop = document.getElementById('transportStop');
        this.transportRec = document.getElementById('transportRec');
        this.transportLoop = document.getElementById('transportLoop');
        this.timeCode = document.getElementById('timeCode');
        this.bpmValue = document.getElementById('bpmValue');
        this.playhead = document.getElementById('playhead');
        this.synthPopup = document.getElementById('synthPopup');
        this.synthClose = document.getElementById('synthClose');
        this.oscCanvas = document.getElementById('oscCanvas');
        this.spectrumCanvas = document.getElementById('spectrumCanvas');
        this.trackHeaders = document.querySelectorAll('.track-header');
        this.waveBtns = document.querySelectorAll('.wave-btn');
        this.mixerTabs = document.querySelectorAll('.mixer-tab');
        this.faders = document.querySelectorAll('.fader');
    }

    initEventListeners() {
        // Transport controls
        this.transportPlay.addEventListener('click', () => this.togglePlay());
        this.transportStop.addEventListener('click', () => this.stop());
        this.transportLoop.addEventListener('click', () => this.toggleLoop());

        // Synth popup
        this.synthClose.addEventListener('click', () => this.synthPopup.style.display = 'none');

        // Track selection
        this.trackHeaders.forEach(header => {
            header.addEventListener('click', () => this.selectTrack(header));
        });

        // Wave selector
        this.waveBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectWave(btn));
        });

        // Mixer tabs
        this.mixerTabs.forEach(tab => {
            tab.addEventListener('click', () => this.selectMixerTab(tab));
        });

        // Faders
        this.faders.forEach(fader => {
            fader.addEventListener('input', () => this.updateFader(fader));
        });

        // Audio events
        this.audioPlayer.addEventListener('timeupdate', () => this.updateTime());
        this.audioPlayer.addEventListener('ended', () => this.onTrackEnd());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Drop zone
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => this.handleDrop(e));

        // Animate meters
        this.animateMeters();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            this.source = this.audioContext.createMediaElementSource(this.audioPlayer);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        } catch (e) {
            console.log('Audio context initialization:', e);
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.audioPlayer.src) {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.audioPlayer.play();
            this.isPlaying = true;
            this.transportPlay.classList.add('active');
            this.transportPlay.querySelector('svg').innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        }
    }

    pause() {
        this.audioPlayer.pause();
        this.isPlaying = false;
        this.transportPlay.classList.remove('active');
        this.transportPlay.querySelector('svg').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    }

    stop() {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
        this.isPlaying = false;
        this.transportPlay.classList.remove('active');
        this.transportPlay.querySelector('svg').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
        this.updateTime();
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.audioPlayer.loop = this.isLooping;
        this.transportLoop.classList.toggle('active', this.isLooping);
    }

    selectTrack(header) {
        this.trackHeaders.forEach(h => h.classList.remove('selected'));
        header.classList.add('selected');
    }

    selectWave(btn) {
        this.waveBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    selectMixerTab(tab) {
        this.mixerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    }

    updateFader(fader) {
        const channel = fader.closest('.channel');
        const meterL = channel.querySelector('.meter-l');
        const meterR = channel.querySelector('.meter-r');
        const value = fader.value / 100;

        if (meterL) meterL.style.setProperty('--level', `${(1 - value) * 100}%`);
        if (meterR) meterR.style.setProperty('--level', `${(1 - value) * 100}%`);
    }

    updateTime() {
        const current = this.audioPlayer.currentTime;
        const duration = this.audioPlayer.duration || 0;

        const formatTime = (s) => {
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = Math.floor(s % 60);
            const ms = Math.floor((s % 1) * 100);
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
        };

        this.timeCode.textContent = formatTime(current);

        // Update playhead
        if (duration > 0) {
            const percent = (current / duration) * 100;
            this.playhead.style.left = `${percent}%`;
        }
    }

    onTrackEnd() {
        if (!this.isLooping) {
            this.stop();
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f =>
            f.type.startsWith('audio/') || f.type.startsWith('video/')
        );

        files.forEach(file => {
            this.playlist.push({
                file: file,
                name: file.name,
                url: URL.createObjectURL(file)
            });
        });

        if (files.length > 0 && !this.currentTrack) {
            this.loadTrack(0);
        }
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentTrack = index;
        const track = this.playlist[index];
        this.audioPlayer.src = track.url;

        // Update track display
        const selectedHeader = document.querySelector('.track-header.selected');
        if (selectedHeader) {
            const label = selectedHeader.querySelector('.track-number');
            label.textContent = `TRACK: ${track.name.toUpperCase()}`;
        }
    }

    handleKeyboard(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'Escape':
                this.stop();
                break;
            case 'KeyL':
                this.toggleLoop();
                break;
        }
    }

    startVisualizations() {
        this.drawOscilloscope();
        this.drawSpectrum();
    }

    drawOscilloscope() {
        const canvas = this.oscCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
            requestAnimationFrame(draw);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff00ff';
            ctx.beginPath();

            if (this.analyser) {
                const bufferLength = this.analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                this.analyser.getByteTimeDomainData(dataArray);

                const sliceWidth = width / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * height / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                    x += sliceWidth;
                }
            } else {
                // Demo wave when no audio
                const time = Date.now() / 1000;
                for (let x = 0; x < width; x++) {
                    const y = height / 2 + Math.sin(x * 0.05 + time * 3) * 30 +
                              Math.sin(x * 0.02 + time * 2) * 15;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
        };

        draw();
    }

    drawSpectrum() {
        const canvas = this.spectrumCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
            requestAnimationFrame(draw);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, width, height);

            if (this.analyser) {
                const bufferLength = this.analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                this.analyser.getByteFrequencyData(dataArray);

                const barWidth = (width / bufferLength) * 2.5;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * height;

                    const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
                    gradient.addColorStop(0, '#ff00ff');
                    gradient.addColorStop(0.5, '#ff1493');
                    gradient.addColorStop(1, '#ff00aa');

                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

                    ctx.shadowBlur = 5;
                    ctx.shadowColor = '#ff00ff';

                    x += barWidth;
                }
            } else {
                // Demo spectrum
                const time = Date.now() / 1000;
                const bars = 40;
                const barWidth = width / bars;

                for (let i = 0; i < bars; i++) {
                    const barHeight = (Math.sin(i * 0.3 + time * 2) * 0.5 + 0.5) * height * 0.8 +
                                      Math.random() * height * 0.1;

                    const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
                    gradient.addColorStop(0, '#ff00ff');
                    gradient.addColorStop(1, '#ff00aa');

                    ctx.fillStyle = gradient;
                    ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
                }
            }
        };

        draw();
    }

    animateMeters() {
        const meters = document.querySelectorAll('.meter-l, .meter-r');

        const animate = () => {
            requestAnimationFrame(animate);

            meters.forEach(meter => {
                if (this.isPlaying) {
                    const level = Math.random() * 35 + 5;
                    meter.style.setProperty('--level', `${100 - level}%`);
                }
            });
        };

        animate();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.neonWavePlayer = new NeonWavePlayer();
});
