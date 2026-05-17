/**
 * CYBER_RADIO_V8 — modal odtwarzacz + mini player (persystencja w localStorage)
 */
(function () {
    const STORAGE_KEY = "cyber_radio_v8_state";

    const STATIONS = [
        { id: 1, name: "RadioParty MAIN", genre: "Dance/Club", cover: "https://images.unsplash.com/photo-1574793954837-b7938eb5a662?q=80&w=600", stream: "https://s2.radioparty.pl:8005/stream" },
        { id: 2, name: "RadioClub", genre: "Trance/Vocal", cover: "https://images.unsplash.com/photo-1643335622021-6fe038ccf08b?q=80&w=600", stream: "https://life4club.online/listen/live/l4c.mp3" },
        { id: 3, name: "DiscoParty.pl", genre: "House/Club", cover: "https://images.unsplash.com/photo-1598387993240-44b625d97d7f?q=80&w=600", stream: "https://s3.slotex.pl/shoutcast/7354/stream?sid=1" },
        { id: 6, name: "Meloradio", genre: "Pop", cover: "https://images.unsplash.com/photo-1574322101375-2591ed7667cc?q=80&w=600", stream: "https://ml.cdn.eurozet.pl/mel-net.mp3" },
        { id: 7, name: "Radio Eska", genre: "Pop/Dance", cover: "https://images.unsplash.com/photo-1630395822762-98eec16c4ba1?q=80&w=600", stream: "https://ic1.smcdn.pl/2380-1.mp3" },
        { id: 8, name: "RadioHeaven", genre: "Trance/Dance", cover: "https://images.unsplash.com/photo-1594078819317-5bef22072175?q=80&w=600", stream: "https://sc1.radioheaven.pl:8000/stream.mp3" },
        { id: 9, name: "VOX Dance", genre: "Dance/Disco", cover: "https://images.unsplash.com/photo-1651439401606-fd2e05286dcb?q=80&w=600", stream: "https://ic1.smcdn.pl/6180-2.aac" },
        { id: 10, name: "Radio Club Dj", genre: "Club/House", cover: "https://images.unsplash.com/photo-1560084068-f24d02201816?q=80&w=600", stream: "https://www.4stream.pl/stream/18272" },
        { id: 11, name: "Radio Party", genre: "Trance/Dance", cover: "https://images.unsplash.com/photo-1580724495666-99f1d8d7f18f?q=80&w=600", stream: "https://s2.radioparty.pl:7000/stream?nocache=7419" },
        { id: 12, name: "Radio Party-PORT", genre: "Trance/Techno", cover: "https://images.unsplash.com/photo-1549873836-765d3157c324?q=80&w=600", stream: "https://listen4.myradio24.com/84802" },
        { id: 13, name: "Radio FTB Club", genre: "Trance/Dance", cover: "https://images.unsplash.com/photo-1511180427842-5878e7a53e2c?q=80&w=600", stream: "http://play.radioftb.net:8000/;.mp3" },
        { id: 14, name: "Radio Party-Energy2000", genre: "Trance/Dance", cover: "https://images.unsplash.com/photo-1486556396467-d83d2b23514b?q=80&w=600", stream: "https://s2.radioparty.pl:8015/energy2000" },
        { id: 15, name: "Radio Party-Stream128", genre: "Trance/Dance", cover: "https://images.unsplash.com/photo-1578946956271-e8234ecaaadd?q=80&w=600", stream: "https://s.radiors.pl/stream128" },
        { id: 16, name: "Radio Party-Revma", genre: "Trance/Dance", cover: "https://images.unsplash.com/photo-1536852281373-656571dde83b?q=80&w=600", stream: "https://n12a-eu.rcs.revma.com/s4exa6c6y33vv?rj-ttl=5&rj-tok=AAABmraaUwIABuTCOFmJbF78Sw" },
    ];

    const DEFAULT_COVER = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600";

    class CyberRadio {
        constructor() {
            this.audio = null;
            this.modal = null;
            this.modalOverlay = null;
            this.miniBar = null;
            this.ui = {};
            this.audioCtx = null;
            this.analyser = null;
            this.source = null;
            this.dataArray = null;
            this.animId = null;
            this.isPlaying = false;
            this.currentStationId = null;
            this.volume = 0.4;
            this._escHandler = null;
            this._playToken = 0;
            this._audioGraphReady = false;
        }

        init() {
            this.loadState();
            this.createAudio();
            this.restoreStationSource();
            this.createMiniPlayer();
            this.bindNavButton();
        }

        loadState() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return;
                const data = JSON.parse(raw);
                if (typeof data.volume === "number") this.volume = data.volume;
                if (data.stationId) this.currentStationId = data.stationId;
            } catch (_) { /* ignore */ }
        }

        saveState() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                volume: this.volume,
                stationId: this.currentStationId,
            }));
        }

        getStation(id) {
            return STATIONS.find((s) => s.id === id);
        }

        getCurrentStation() {
            return this.getStation(this.currentStationId);
        }

        createAudio() {
            this.audio = document.createElement("audio");
            this.audio.id = "cyber-radio-audio";
            this.audio.preload = "none";
            this.audio.volume = this.volume;
            document.body.appendChild(this.audio);

            this.audio.addEventListener("playing", () => this.onPlaying());
            this.audio.addEventListener("pause", () => this.onPause());
            this.audio.addEventListener("ended", () => this.onPause());
            this.audio.addEventListener("error", () => {
                const station = this.getCurrentStation();
                if (station && this.ui.title) {
                    this.ui.title.textContent = "BŁĄD STREAMU";
                }
            });
        }

        restoreStationSource() {
            const station = this.getCurrentStation();
            if (!station) return;
            this.updateNowPlaying(station);
        }

        hasAudioSource() {
            const src = this.audio?.src || "";
            return src.length > 0 && src !== window.location.href;
        }

        isSameStream(station) {
            if (!station?.stream || !this.audio?.src) return false;
            const current = this.audio.src;
            const target = station.stream;
            return current === target || current.endsWith(target);
        }

        applyStationStream(station) {
            this._playToken = (this._playToken || 0) + 1;
            const token = this._playToken;

            this.audio.pause();
            this.currentStationId = station.id;

            if (!this._audioGraphReady) {
                this.audio.crossOrigin = "anonymous";
            }

            if (this.isSameStream(station)) {
                this.audio.removeAttribute("src");
                this.audio.load();
            }

            this.audio.src = station.stream;
            this.audio.load();

            this.updateNowPlaying(station);
            this.saveState();
            this.renderStationList();
            this.syncModalUI();

            this.playWhenReady(token);
        }

        playWhenReady(token) {
            const tryPlay = () => {
                if (token !== this._playToken) return;
                this.resumeAudioContext();
                const playPromise = this.audio.play();
                if (playPromise?.catch) {
                    playPromise.catch(() => {
                        if (token !== this._playToken) return;
                        if (this.ui.title) this.ui.title.textContent = "BŁĄD STREAMU";
                    });
                }
            };

            if (this.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                tryPlay();
                return;
            }

            const onReady = () => {
                this.audio.removeEventListener("canplay", onReady);
                tryPlay();
            };

            this.audio.addEventListener("canplay", onReady, { once: true });

            window.setTimeout(() => {
                this.audio.removeEventListener("canplay", onReady);
                if (token === this._playToken && this.audio.paused) {
                    tryPlay();
                }
            }, 2500);
        }

        bindNavButton() {
            const attach = () => {
                const btn = document.getElementById("cyberRadioNavBtn");
                if (!btn || btn.dataset.cyberRadioBound === "1") return false;
                btn.dataset.cyberRadioBound = "1";
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openModal();
                });
                return true;
            };

            if (attach()) return;

            const root = document.getElementById("root") || document.body;
            const observer = new MutationObserver(() => {
                if (attach()) observer.disconnect();
            });
            observer.observe(root, { childList: true, subtree: true });
        }

        createMiniPlayer() {
            this.miniBar = document.createElement("div");
            this.miniBar.className = "cyber-radio-mini cyber-radio-root";
            this.miniBar.innerHTML = `
                <div class="cyber-radio-mini-thumb">
                    <img src="${DEFAULT_COVER}" alt="" id="cyber-radio-mini-cover">
                </div>
                <div class="cyber-radio-mini-info">
                    <div class="cyber-radio-mini-title" id="cyber-radio-mini-title">CYBER RADIO</div>
                    <div class="cyber-radio-mini-genre" id="cyber-radio-mini-genre">Gotowy do odtwarzania</div>
                </div>
                <div class="cyber-radio-mini-controls">
                    <button type="button" class="cyber-radio-mini-btn" id="cyber-radio-mini-play" title="Play / Pause">
                        <i class="fas fa-play"></i>
                    </button>
                    <div class="cyber-radio-mini-vol-wrap">
                        <input type="range" class="cyber-radio-mini-vol" id="cyber-radio-mini-vol" min="0" max="1" step="0.01" value="${this.volume}" aria-label="Głośność">
                        <span class="cyber-radio-mini-vol-label" id="cyber-radio-mini-vol-label">${Math.round(this.volume * 100)}%</span>
                    </div>
                    <button type="button" class="cyber-radio-mini-btn" id="cyber-radio-mini-toggle" title="Otwórz radio">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            `;
            this.mountMiniPlayer();

            this.ui.miniCover = this.miniBar.querySelector("#cyber-radio-mini-cover");
            this.ui.miniTitle = this.miniBar.querySelector("#cyber-radio-mini-title");
            this.ui.miniGenre = this.miniBar.querySelector("#cyber-radio-mini-genre");
            this.ui.miniPlay = this.miniBar.querySelector("#cyber-radio-mini-play");
            this.ui.miniVol = this.miniBar.querySelector("#cyber-radio-mini-vol");
            this.ui.miniVolLabel = this.miniBar.querySelector("#cyber-radio-mini-vol-label");
            this.ui.miniToggle = this.miniBar.querySelector("#cyber-radio-mini-toggle");
            this.ui.miniToggleIcon = this.ui.miniToggle?.querySelector("i");

            this.ui.miniPlay.addEventListener("click", () => this.togglePlay());
            this.ui.miniVol.addEventListener("input", (e) => this.setVolume(Number(e.target.value)));
            this.ui.miniToggle.addEventListener("click", () => this.toggleModal());
            this.updateMiniModalButtons();

            if (this.currentStationId) {
                const station = this.getCurrentStation();
                if (station) this.updateNowPlaying(station);
            }
        }

        mountMiniPlayer() {
            const attach = () => {
                const host = document.querySelector(".datetime-container");
                if (!host || host.contains(this.miniBar)) return false;
                host.appendChild(this.miniBar);
                return true;
            };

            if (attach()) return;

            const root = document.getElementById("root") || document.body;
            const observer = new MutationObserver(() => {
                if (attach()) observer.disconnect();
            });
            observer.observe(root, { childList: true, subtree: true });
        }

        buildModalMarkup() {
            return `
                <div class="cyber-radio-root cyber-radio-master">
                    <div class="cyber-radio-screw s-tl"></div>
                    <div class="cyber-radio-screw s-tr"></div>
                    <div class="cyber-radio-screw s-bl"></div>
                    <div class="cyber-radio-screw s-br"></div>

                    <header class="cyber-radio-header">
                        <div class="cyber-radio-brand">SYSTEM_OPERACYJNY_RADIO // HIGH_DETAIL_V8</div>
                        <div class="cyber-radio-status" id="cyber-radio-status">STATUS: STABLE</div>
                    </header>

                    <main class="cyber-radio-main-grid">
                        <section class="cyber-radio-station-col">
                            <div class="cyber-radio-list-label">KANAŁY_RADIO_PL [<span id="cyber-radio-count">${STATIONS.length}</span>]</div>
                            <div class="cyber-radio-list" id="cyber-radio-list"></div>
                        </section>

                        <section class="cyber-radio-console-col">
                            <div class="cyber-radio-display">
                                <div class="cyber-radio-vinyl">
                                    <div class="cyber-radio-cover" id="cyber-radio-cover-wrap">
                                        <img src="${DEFAULT_COVER}" id="cyber-radio-cover" alt="Cover">
                                    </div>
                                    <div>
                                        <div class="cyber-radio-now-title" id="cyber-radio-title">AWAITING_INPUT</div>
                                        <div class="cyber-radio-now-genre" id="cyber-radio-genre">Ready to link</div>
                                    </div>
                                </div>
                                <div class="cyber-radio-viz">
                                    <canvas id="cyber-radio-canvas"></canvas>
                                    <div class="cyber-radio-viz-tag">0x7FF_AUDIO_STREAM_BUFFER_ACTIVE // 48KHz_PCM</div>
                                </div>
                            </div>

                            <div class="cyber-radio-controls">
                                <button type="button" class="cyber-radio-phys-btn" id="cyber-radio-vol-down" title="Ciszej">
                                    <i class="fa-solid fa-volume-low"></i>
                                </button>
                                <button type="button" class="cyber-radio-phys-btn main" id="cyber-radio-play">
                                    <i class="fa-solid fa-play" id="cyber-radio-play-icon"></i>
                                </button>
                                <button type="button" class="cyber-radio-phys-btn" id="cyber-radio-vol-up" title="Głośniej">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                                <div class="cyber-radio-gain">
                                    <label for="cyber-radio-volume">MASTER_GAIN_CONTROL</label>
                                    <input type="range" id="cyber-radio-volume" min="0" max="1" step="0.01" value="${this.volume}">
                                </div>
                                <div class="cyber-radio-latency">LATENCY<br><span>0.0042s</span></div>
                            </div>
                        </section>
                    </main>

                    <footer class="cyber-radio-footer">
                        <div>PROTOKÓŁ: SHADOW-RSA-4096</div>
                        <div>2026: GLOGOW_NODE_PL</div>
                        <div>UUID: 0X8892_V8_PERSISTENT</div>
                    </footer>
                </div>
            `;
        }

        isModalOpen() {
            return Boolean(
                this.modalOverlay?.parentNode &&
                this.modalOverlay.classList.contains("active")
            );
        }

        toggleModal() {
            if (this.isModalOpen()) {
                this.closeModal();
            } else {
                this.openModal();
            }
        }

        updateMiniModalButtons() {
            const open = this.isModalOpen();
            if (this.ui.miniToggleIcon) {
                this.ui.miniToggleIcon.className = open ? "fas fa-compress" : "fas fa-expand";
            }
            if (this.ui.miniToggle) {
                this.ui.miniToggle.title = open ? "Zwiń radio" : "Otwórz radio";
                this.ui.miniToggle.classList.toggle("active", open);
            }
        }

        openModal() {
            if (this.isModalOpen()) return;

            if (!this.modal) {
                this.modalOverlay = document.createElement("div");
                this.modalOverlay.className = "modal-overlay cyber-radio-overlay";
                this.modalOverlay.addEventListener("click", (e) => {
                    if (e.target === this.modalOverlay) this.closeModal();
                });

                this.modal = document.createElement("div");
                this.modal.className = "modal-content cyber-radio-modal";

                const header = document.createElement("div");
                header.className = "modal-header";
                header.innerHTML = `
                    <h2 class="modal-title"><i class="fas fa-broadcast-tower"></i> CYBER RADIO V8</h2>
                    <button type="button" class="modal-close" aria-label="Zamknij"><i class="fas fa-times"></i></button>
                `;
                header.querySelector(".modal-close").addEventListener("click", () => this.closeModal());

                const body = document.createElement("div");
                body.className = "modal-body";
                body.innerHTML = this.buildModalMarkup();

                this.modal.appendChild(header);
                this.modal.appendChild(body);
                this.modalOverlay.appendChild(this.modal);

                this.bindModalUI(body);
            }

            document.body.appendChild(this.modalOverlay);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.modalOverlay.classList.add("active");
                    this.updateMiniModalButtons();
                });
            });

            this.renderStationList();
            this.syncModalUI();
            this.resizeCanvas();
            if (this.isPlaying) this.draw();

            this._escHandler = (e) => {
                if (e.key === "Escape") this.closeModal();
            };
            document.addEventListener("keydown", this._escHandler);

            if (!this._resizeBound) {
                this._resizeBound = () => this.resizeCanvas();
                window.addEventListener("resize", this._resizeBound);
            }
        }

        closeModal() {
            if (!this.modalOverlay) return;
            this.modalOverlay.classList.remove("active");
            this.updateMiniModalButtons();
            setTimeout(() => {
                if (this.modalOverlay?.parentNode) {
                    this.modalOverlay.parentNode.removeChild(this.modalOverlay);
                }
                this.updateMiniModalButtons();
            }, 250);
            if (this._escHandler) {
                document.removeEventListener("keydown", this._escHandler);
                this._escHandler = null;
            }
        }

        bindModalUI(body) {
            this.ui.list = body.querySelector("#cyber-radio-list");
            this.ui.cover = body.querySelector("#cyber-radio-cover");
            this.ui.coverWrap = body.querySelector("#cyber-radio-cover-wrap");
            this.ui.title = body.querySelector("#cyber-radio-title");
            this.ui.genre = body.querySelector("#cyber-radio-genre");
            this.ui.playBtn = body.querySelector("#cyber-radio-play");
            this.ui.playIcon = body.querySelector("#cyber-radio-play-icon");
            this.ui.vol = body.querySelector("#cyber-radio-volume");
            this.ui.canvas = body.querySelector("#cyber-radio-canvas");

            this.ui.playBtn.addEventListener("click", () => this.togglePlay());
            this.ui.vol.addEventListener("input", (e) => this.setVolume(Number(e.target.value)));

            body.querySelector("#cyber-radio-vol-up").addEventListener("click", () => {
                this.setVolume(Math.min(1, this.volume + 0.1));
            });
            body.querySelector("#cyber-radio-vol-down").addEventListener("click", () => {
                this.setVolume(Math.max(0, this.volume - 0.1));
            });
        }

        renderStationList() {
            if (!this.ui.list) return;
            this.ui.list.innerHTML = "";
            STATIONS.forEach((station) => {
                const el = document.createElement("button");
                el.type = "button";
                el.className = "cyber-radio-station";
                if (station.id === this.currentStationId) el.classList.add("active");
                el.innerHTML = `
                    <div class="cyber-radio-thumb"><img src="${station.cover}" alt=""></div>
                    <div>
                        <div class="cyber-radio-station-name">${station.name}</div>
                        <div class="cyber-radio-station-genre">${station.genre}</div>
                    </div>
                `;
                el.addEventListener("click", () => this.loadStation(station));
                this.ui.list.appendChild(el);
            });
        }

        loadStation(station) {
            if (!station) return;

            if (this.currentStationId === station.id && !this.audio.paused) {
                this.audio.pause();
                return;
            }

            this.applyStationStream(station);
        }

        resumeAudioContext() {
            if (this.audioCtx?.state === "suspended") {
                this.audioCtx.resume().catch(() => { });
            }
        }

        updateNowPlaying(station) {
            const cover = station?.cover || DEFAULT_COVER;
            const name = station?.name || "CYBER RADIO";
            const genre = station?.genre || "Gotowy";

            if (this.ui.cover) this.ui.cover.src = cover;
            if (this.ui.title) this.ui.title.textContent = name;
            if (this.ui.genre) this.ui.genre.textContent = genre;

            if (this.ui.miniCover) this.ui.miniCover.src = cover;
            if (this.ui.miniTitle) this.ui.miniTitle.textContent = name;
            if (this.ui.miniGenre) this.ui.miniGenre.textContent = genre;
        }

        showMiniBar() {
            this.mountMiniPlayer();
            this.miniBar?.classList.add("is-visible");
        }

        hideMiniBar() {
            this.miniBar?.classList.remove("is-visible");
        }

        updateVolumeIndicator() {
            const pct = Math.round(this.volume * 100);
            if (this.ui.miniVolLabel) {
                this.ui.miniVolLabel.textContent = `${pct}%`;
            }
        }

        setVolume(value) {
            this.volume = Math.max(0, Math.min(1, value));
            this.audio.volume = this.volume;
            if (this.ui.vol) this.ui.vol.value = this.volume;
            if (this.ui.miniVol) this.ui.miniVol.value = this.volume;
            this.updateVolumeIndicator();
            this.saveState();
        }

        togglePlay() {
            const station = this.getCurrentStation() || STATIONS[0];

            if (!this.currentStationId || !this.hasAudioSource()) {
                return this.loadStation(station);
            }

            if (this.audio.paused) {
                if (this.currentStationId === station.id && this.hasAudioSource()) {
                    this._playToken = (this._playToken || 0) + 1;
                    this.playWhenReady(this._playToken);
                } else {
                    this.loadStation(station);
                }
            } else {
                this.audio.pause();
            }
        }

        syncModalUI() {
            const station = this.getCurrentStation();
            if (station) this.updateNowPlaying(station);
            if (this.ui.vol) this.ui.vol.value = this.volume;
            if (this.ui.miniVol) this.ui.miniVol.value = this.volume;
            this.updatePlayButtons();
        }

        updatePlayButtons() {
            const icon = this.isPlaying ? "fa-pause" : "fa-play";
            if (this.ui.playIcon) this.ui.playIcon.className = `fa-solid ${icon}`;
            if (this.ui.playBtn) this.ui.playBtn.classList.toggle("active", this.isPlaying);
            if (this.ui.coverWrap) this.ui.coverWrap.classList.toggle("rotating", this.isPlaying);

            const miniIcon = this.ui.miniPlay?.querySelector("i");
            if (miniIcon) miniIcon.className = `fas ${icon}`;
            if (this.ui.miniPlay) this.ui.miniPlay.classList.toggle("active", this.isPlaying);

            const navBtn = document.getElementById("cyberRadioNavBtn");
            if (navBtn) navBtn.classList.toggle("is-radio-playing", this.isPlaying);
        }

        onPlaying() {
            this.isPlaying = true;
            const station = this.getCurrentStation();
            if (station) this.updateNowPlaying(station);
            this.showMiniBar();
            this.updatePlayButtons();
            this.setupAudio();
            this.draw();
        }

        onPause() {
            this.isPlaying = false;
            this.hideMiniBar();
            this.updatePlayButtons();
            cancelAnimationFrame(this.animId);
        }

        resizeCanvas() {
            if (!this.ui.canvas) return;
            const parent = this.ui.canvas.parentElement;
            if (!parent) return;
            this.ui.canvas.width = parent.clientWidth;
            this.ui.canvas.height = parent.clientHeight;
        }

        setupAudio() {
            if (this._audioGraphReady || !this.audio) return;
            try {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 256;
                this.source = this.audioCtx.createMediaElementSource(this.audio);
                this.source.connect(this.analyser);
                this.analyser.connect(this.audioCtx.destination);
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this._audioGraphReady = true;
            } catch (_) {
                this.audioCtx = null;
            }
        }

        draw() {
            if (!this.isPlaying || !this.ui.canvas) return;
            this.animId = requestAnimationFrame(() => this.draw());

            const ctx = this.ui.canvas.getContext("2d");
            if (!ctx) return;

            if (this.analyser && this.dataArray) {
                this.analyser.getByteFrequencyData(this.dataArray);
            } else {
                return;
            }

            const { width, height } = this.ui.canvas;
            ctx.clearRect(0, 0, width, height);

            const gradient = ctx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, "rgb(180, 70, 0)");
            gradient.addColorStop(0.5, "rgb(255, 115, 0)");
            gradient.addColorStop(1, "rgb(255, 180, 100)");
            ctx.fillStyle = gradient;

            const barWidth = (width / this.dataArray.length) * 2.5;
            let x = 0;
            for (let i = 0; i < this.dataArray.length; i++) {
                const h = (this.dataArray[i] / 255) * height;
                ctx.fillRect(x, height - h, barWidth - 1, h);
                x += barWidth;
            }
        }
    }

    const cyberRadio = new CyberRadio();

    document.addEventListener("DOMContentLoaded", () => cyberRadio.init());

    window.cyberRadio = cyberRadio;
    window.openCyberRadioModal = () => cyberRadio.openModal();
})();
