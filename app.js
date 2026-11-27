(() => {
  const DATA = window.MADANI_DATA;
  const LETTERS = DATA.letters;
  const LETTER_BY_ID = Object.fromEntries(LETTERS.map((l) => [l.id, l]));

  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBnNum = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

  // State
  let selectedIndex = 0;
  let playbackRate = 1.0;
  let currentAudio = null;
  let autoPlayTimer = null;
  let isAutoPlaying = false;
  let learnedSet = new Set(JSON.parse(localStorage.getItem("madani_learned") || "[]"));
  let weakSet = new Set(JSON.parse(localStorage.getItem("madani_weak") || "[]"));
  let masteryMap = JSON.parse(localStorage.getItem("madani_mastery") || "{}");
  let revealAllExam = false;

  // Voice recorder state
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordedAudioUrl = null;
  let isRecording = false;
  let recAudioCtx = null;
  let recRafId = null;
  let recMaxTimer = null;

  // Quiz state
  let quizMode = "audio";
  let quizScore = 0;
  let quizTotal = 0;
  let quizStreak = 0;
  let quizAnswered = false;
  let timedBest = Number(localStorage.getItem("madani_timed_best") || "0");
  let timedLeft = 60;
  let timedScore = 0;
  let timedTimerId = null;
  let timedRunning = false;

  // Tracing state
  let traceIndex = Number(localStorage.getItem("madani_trace_index") || "0");
  if (traceIndex < 0 || traceIndex >= LETTERS.length) traceIndex = 0;
  let traceDemoSpeed = 0.5;
  let traceDemoRaf = null;

  // Daily Streak & Goal
  function getDateKey(dateObj = new Date()) {
    return `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
  }

  function updateStreakUI(increment = false) {
    const today = getDateKey(new Date());
    const yesterday = getDateKey(new Date(Date.now() - 86400000));
    let savedDate = localStorage.getItem("madani_today_date");
    let todayCount = Number(localStorage.getItem("madani_today_count") || "0");
    let streak = Number(localStorage.getItem("madani_streak") || "1");

    if (savedDate !== today) {
      if (savedDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
      todayCount = 0;
      savedDate = today;
      localStorage.setItem("madani_today_date", today);
      localStorage.setItem("madani_streak", String(streak));
    }

    if (increment) {
      todayCount += 1;
      localStorage.setItem("madani_today_count", String(todayCount));
    }
  }

  // Audio playback
  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  function playAudioFile(src, onEnded) {
    stopCurrentAudio();
    const audio = new Audio(src);
    audio.playbackRate = playbackRate;
    currentAudio = audio;
    audio.onended = () => { if (onEnded) onEnded(); };
    audio.onerror = () => { if (onEnded) onEnded(); };
    audio.play().catch(() => { if (onEnded) onEnded(); });
  }

  function playLetter(letter, cardEl) {
    if (!letter) return;
    document.querySelectorAll(".letter-card.playing").forEach((el) => el.classList.remove("playing"));
    if (cardEl) cardEl.classList.add("playing");

    learnedSet.add(letter.id);
    localStorage.setItem("madani_learned", JSON.stringify([...learnedSet]));
    updateProgressUI();
    updateStreakUI(true);
    if (cardEl) cardEl.classList.add("learned");

    playAudioFile(letter.audio, () => {
      if (cardEl) cardEl.classList.remove("playing");
    });
  }

  function updateProgressUI() {
    const count = learnedSet.size;
    const total = LETTERS.length;
    document.getElementById("progressText").textContent = `${toBnNum(count)} / ${toBnNum(total)}`;
    document.getElementById("progressBar").style.width = `${Math.round((count / total) * 100)}%`;
  }

  function updateWeakBtnUI() {
    document.getElementById("weakModeBtn").textContent = `⚠️ দুর্বল (${toBnNum(weakSet.size)})`;
  }

  // Settings State & Helpers
  const DEFAULT_SETTINGS = {
    focusMode: false,
    darkTheme: (localStorage.getItem("madani_theme") || "light") === "dark",
    showBnNames: true,
    showMakhrajBadges: true,
    autoStopRecorder: true,
    soundFx: true,
    haptic: true,
    tajweedColors: true,
    fontScale: 1.0,
  };
  let settings = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("madani_settings") || "{}") };

  const themeBtn = document.getElementById("themeBtn");
  const focusToggleBtn = document.getElementById("focusToggleBtn");
  const setFocusToggle = document.getElementById("setFocusToggle");
  const setDarkToggle = document.getElementById("setDarkToggle");
  const setBnNamesToggle = document.getElementById("setBnNamesToggle");
  const setMakhrajBadgeToggle = document.getElementById("setMakhrajBadgeToggle");
  const setAutoStopToggle = document.getElementById("setAutoStopToggle");
  const setSoundFxToggle = document.getElementById("setSoundFxToggle");
  const setHapticToggle = document.getElementById("setHapticToggle");
  const setTajweedColorToggle = document.getElementById("setTajweedColorToggle");
  const setFontScale = document.getElementById("setFontScale");
  const fontScaleLabel = document.getElementById("fontScaleLabel");

  function applySettings() {
    localStorage.setItem("madani_settings", JSON.stringify(settings));
    document.body.classList.toggle("focus-mode", settings.focusMode);
    if (focusToggleBtn) focusToggleBtn.classList.toggle("active", settings.focusMode);
    document.body.classList.toggle("hide-bn-names", !settings.showBnNames);
    document.body.classList.toggle("hide-makhraj-badges", !settings.showMakhrajBadges);
    document.body.classList.toggle("tajweed-colors", settings.tajweedColors);
    document.documentElement.style.setProperty("--ar-scale", String(settings.fontScale));

    if (settings.darkTheme) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("madani_theme", "dark");
      themeBtn.textContent = "☀️";
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("madani_theme", "light");
      themeBtn.textContent = "🌙";
    }

    setFocusToggle.checked = settings.focusMode;
    setDarkToggle.checked = settings.darkTheme;
    setBnNamesToggle.checked = settings.showBnNames;
    setMakhrajBadgeToggle.checked = settings.showMakhrajBadges;
    setAutoStopToggle.checked = settings.autoStopRecorder;
    setSoundFxToggle.checked = settings.soundFx;
    setHapticToggle.checked = settings.haptic;
    setTajweedColorToggle.checked = settings.tajweedColors;
    setFontScale.value = String(settings.fontScale);
    fontScaleLabel.textContent = `${toBnNum(Math.round(settings.fontScale * 100))}%`;
  }

  function triggerHaptic(ms = 18) {
    if (settings.haptic && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }

  function playFeedbackTone(isCorrect) {
    if (!settings.soundFx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isCorrect ? "sine" : "triangle";
      osc.frequency.setValueAtTime(isCorrect ? 660 : 220, ctx.currentTime);
      if (isCorrect) osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);
      setTimeout(() => ctx.close().catch(() => {}), 250);
    } catch {}
  }

  themeBtn.addEventListener("click", () => {
    settings.darkTheme = !settings.darkTheme;
    applySettings();
  });

  // Settings Modal Open/Close & Toggles
  const settingsModal = document.getElementById("settingsModal");
  const settingsBackdrop = document.getElementById("settingsBackdrop");
  const openSettings = () => {
    settingsBackdrop.classList.add("open");
    settingsModal.classList.add("open");
  };
  const closeSettings = () => {
    settingsBackdrop.classList.remove("open");
    settingsModal.classList.remove("open");
  };
  document.getElementById("settingsBtn").addEventListener("click", openSettings);
  document.getElementById("settingsCloseBtn").addEventListener("click", closeSettings);
  settingsBackdrop.addEventListener("click", closeSettings);
  focusToggleBtn.addEventListener("click", () => {
    settings.focusMode = !settings.focusMode;
    applySettings();
  });

  setFocusToggle.addEventListener("change", () => { settings.focusMode = setFocusToggle.checked; applySettings(); });
  setDarkToggle.addEventListener("change", () => { settings.darkTheme = setDarkToggle.checked; applySettings(); });
  setBnNamesToggle.addEventListener("change", () => { settings.showBnNames = setBnNamesToggle.checked; applySettings(); });
  setMakhrajBadgeToggle.addEventListener("change", () => { settings.showMakhrajBadges = setMakhrajBadgeToggle.checked; applySettings(); });
  setAutoStopToggle.addEventListener("change", () => { settings.autoStopRecorder = setAutoStopToggle.checked; applySettings(); });
  setSoundFxToggle.addEventListener("change", () => { settings.soundFx = setSoundFxToggle.checked; applySettings(); });
  setHapticToggle.addEventListener("change", () => { settings.haptic = setHapticToggle.checked; applySettings(); });
  setTajweedColorToggle.addEventListener("change", () => { settings.tajweedColors = setTajweedColorToggle.checked; applySettings(); });
  setFontScale.addEventListener("input", () => { settings.fontScale = Number(setFontScale.value); applySettings(); });

  // Export & Import Backup
  document.getElementById("exportDataBtn").addEventListener("click", () => {
    const payload = {
      learned: [...learnedSet],
      weak: [...weakSet],
      streak: Number(localStorage.getItem("madani_streak") || "1"),
      todayDate: localStorage.getItem("madani_today_date") || getDateKey(),
      todayCount: Number(localStorage.getItem("madani_today_count") || "0"),
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "learn-arabic-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importDataInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.learned)) {
          learnedSet = new Set(data.learned);
          localStorage.setItem("madani_learned", JSON.stringify([...learnedSet]));
        }
        if (Array.isArray(data.weak)) {
          weakSet = new Set(data.weak);
          localStorage.setItem("madani_weak", JSON.stringify([...weakSet]));
        }
        if (data.streak) localStorage.setItem("madani_streak", String(data.streak));
        if (data.settings) settings = { ...DEFAULT_SETTINGS, ...data.settings };
        applySettings();
        updateProgressUI();
        updateWeakBtnUI();
        updateStreakUI(false);
        renderAlphabetGrid();
        closeSettings();
      } catch {}
    };
    reader.readAsText(file);
  });

  const speedBtn = document.getElementById("speedBtn");
  const speedLabel = document.getElementById("speedLabel");
  speedBtn.addEventListener("click", () => {
    playbackRate = playbackRate === 1.0 ? 0.75 : 1.0;
    speedLabel.textContent = playbackRate === 1.0 ? "১.০x" : "০.৭৫x";
    speedBtn.classList.toggle("active", playbackRate < 1.0);
  });

  // Tab navigation (Top + Mobile Bottom Nav)
  function switchTab(tabName) {
    localStorage.setItem("madani_active_tab", tabName);
    closeMobileSheet();
    document.querySelectorAll(".tab-btn, .bottom-nav-btn").forEach((btn) => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${tabName}`);
    });
    if (tabName === "writing" && (localStorage.getItem("madani_writing_subtab") || "w-canvas") === "w-canvas") {
      drawTraceWatermark();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".tab-btn, .bottom-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Mobile Bottom Sheet for Letter Inspector
  const sheetBackdrop = document.getElementById("sheetBackdrop");
  const inspectorEl = document.getElementById("inspectorCard");
  function openMobileSheet() {
    if (window.innerWidth <= 980) {
      sheetBackdrop.classList.add("open");
      inspectorEl.classList.add("open");
    }
  }
  function closeMobileSheet() {
    sheetBackdrop.classList.remove("open");
    inspectorEl.classList.remove("open");
  }
  sheetBackdrop.addEventListener("click", closeMobileSheet);

  // TAB 1: Alphabet Grid + Inspector + Voice Recorder
  function renderAlphabetGrid() {
    const grid = document.getElementById("alphabetGrid");
    grid.innerHTML = "";
    LETTERS.forEach((letter, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "letter-card";
      if (idx === selectedIndex) card.classList.add("selected");
      if (learnedSet.has(letter.id)) card.classList.add("learned");
      card.dataset.index = idx;

      card.innerHTML = `
        <span class="card-makhraj-badge">মা.${toBnNum(letter.makhrajIds[0])}</span>
        <div class="card-ar ar">${letter.char}</div>
        <div class="card-bn">${letter.bnName}</div>
      `;

      card.addEventListener("click", () => {
        stopAutoPlay();
        selectLetter(idx, true);
      });
      grid.appendChild(card);
    });
  }

  function stopRecorderCleanup() {
    isRecording = false;
    if (recRafId) cancelAnimationFrame(recRafId);
    recRafId = null;
    if (recMaxTimer) clearTimeout(recMaxTimer);
    recMaxTimer = null;
    if (recAudioCtx) {
      recAudioCtx.close().catch(() => {});
      recAudioCtx = null;
    }
  }

  function selectLetter(idx, shouldPlay = true) {
    const prevIdx = selectedIndex;
    selectedIndex = (idx + LETTERS.length) % LETTERS.length;
    if (prevIdx !== selectedIndex) {
      if (isRecording && mediaRecorder) mediaRecorder.stop();
      stopRecorderCleanup();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        recordedAudioUrl = null;
      }
    }
    const letter = LETTERS[selectedIndex];
    const cards = document.querySelectorAll("#alphabetGrid .letter-card");
    cards.forEach((c, i) => c.classList.toggle("selected", i === selectedIndex));

    renderInspector(letter);
    if (shouldPlay) {
      playLetter(letter, cards[selectedIndex]);
      openMobileSheet();
    }
  }

  function renderInspector(letter) {
    const panel = document.getElementById("inspectorCard");
    const makhrajBadges = letter.makhrajIds
      .map(
        (mId) =>
          `<button class="btn btn-gold jump-makhraj-btn" data-makhraj="${mId}" type="button" style="padding:3px 9px; font-size:0.78rem;">মাখরাজ ${toBnNum(mId)} দেখুন</button>`
      )
      .join(" ");

    panel.innerHTML = `
      <div class="sheet-handle" aria-hidden="true"></div>
      <div class="inspector-top">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="inspector-big-ar" id="inspectorPlayBig" title="শুনতে ক্লিক করুন">${letter.char}</div>
          <div class="inspector-title">
            <h2>${letter.bnName} <span style="font-size:0.9rem; color:var(--text-muted); font-weight:500;">(${letter.translit})</span></h2>
            <p>ক্রম: ${toBnNum(letter.order)} • ${letter.nuqta}</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button class="btn btn-primary" id="inspectorReplayBtn" type="button">🔊 শুনুন</button>
          <button class="sheet-close-btn" id="sheetCloseBtn" type="button" aria-label="বন্ধ করুন">✕</button>
        </div>
      </div>

      <div style="margin-top:10px; font-weight:600; font-size:0.88rem; color:var(--primary);">
        বাক্যে হরফের <span class="forms-count-pc">৪টি</span><span class="forms-count-mob">৩টি</span> রূপ (ডান থেকে বামে):
      </div>
      <div class="forms-strip">
        <div class="form-box form-box--isolated">
          <span class="form-label">পূর্ণ</span>
          <div class="form-ar ar">${letter.forms.isolated}</div>
          <div class="form-ex ar">${letter.char}</div>
        </div>
        <div class="form-box">
          <span class="form-label">শুরু</span>
          <div class="form-ar ar">${letter.forms.initial}</div>
          <div class="form-ex ar">${letter.examples.initial}</div>
        </div>
        <div class="form-box">
          <span class="form-label">মাঝ</span>
          <div class="form-ar ar">${letter.forms.medial}</div>
          <div class="form-ex ar">${letter.examples.medial}</div>
        </div>
        <div class="form-box">
          <span class="form-label">শেষ</span>
          <div class="form-ar ar">${letter.forms.final}</div>
          <div class="form-ex ar">${letter.examples.final}</div>
        </div>
      </div>

      <div class="recorder-box">
        <strong style="font-size:0.86rem; color:var(--primary);">🎙️ নিজের উচ্চারণ রেকর্ড করে মিলিয়ে দেখুন (অফলাইন):</strong>
        <div class="recorder-controls">
          <button class="btn" id="recToggleBtn" type="button" style="padding:5px 10px; font-size:0.82rem;">
            ${isRecording ? "⏹ থামান" : "🔴 রেকর্ড করুন"}
          </button>
          <button class="btn btn-gold" id="recPlayBtn" type="button" style="padding:5px 10px; font-size:0.82rem;" ${recordedAudioUrl ? "" : "disabled"}>
            ▶ নিজের কণ্ঠ শুনুন
          </button>
        </div>
        <canvas id="recWaveform" width="320" height="34"></canvas>
        <div id="recStatus" style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;"></div>
      </div>

      <div class="info-block">
        <strong>🗣️ মাখরাজ:</strong>
        <div>${letter.makhrajSummary}</div>
        <div style="margin-top:6px;">${makhrajBadges}</div>
      </div>

      <div class="info-block">
        <strong>✨ তাজবীদ টিপস:</strong>
        <div>${letter.tip}</div>
        <div style="margin-top:3px; font-size:0.82rem; color:var(--text-muted);">বৈশিষ্ট্য: ${letter.quality}</div>
      </div>

      <div class="inspector-nav">
        <button class="btn" id="prevLetterBtn" type="button">⬅ পূর্ববর্তী</button>
        <button class="btn" id="nextLetterBtn" type="button">পরবর্তী ➡</button>
      </div>
    `;

    const replay = () => {
      const card = document.querySelectorAll("#alphabetGrid .letter-card")[selectedIndex];
      playLetter(letter, card);
    };
    document.getElementById("inspectorPlayBig").addEventListener("click", replay);
    document.getElementById("inspectorReplayBtn").addEventListener("click", replay);
    document.getElementById("sheetCloseBtn").addEventListener("click", closeMobileSheet);
    document.getElementById("prevLetterBtn").addEventListener("click", () => {
      stopAutoPlay();
      selectLetter(selectedIndex - 1, true);
    });
    document.getElementById("nextLetterBtn").addEventListener("click", () => {
      stopAutoPlay();
      selectLetter(selectedIndex + 1, true);
    });

    panel.querySelectorAll(".jump-makhraj-btn").forEach((b) => {
      b.addEventListener("click", () => {
        switchTab("makhraj");
        highlightMakhrajCard(Number(b.dataset.makhraj));
      });
    });

    // Offline Recorder with Auto-Stop Silence Detection & Waveform
    const recToggleBtn = document.getElementById("recToggleBtn");
    const recPlayBtn = document.getElementById("recPlayBtn");
    const recStatus = document.getElementById("recStatus");
    const recWaveform = document.getElementById("recWaveform");
    const waveCtx = recWaveform.getContext("2d");

    const stopRecordingNow = () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
      stopRecorderCleanup();
      recToggleBtn.textContent = "🔴 রেকর্ড করুন";
    };

    recToggleBtn.addEventListener("click", async () => {
      if (isRecording) {
        stopRecordingNow();
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        recStatus.textContent = "এই ব্রাউজারে মাইক্রোফোন রেকর্ডিং সাপোর্ট করছে না।";
        return;
      }

      try {
        stopCurrentAudio();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          stopRecorderCleanup();
          const mime = mediaRecorder.mimeType || "audio/webm";
          const blob = new Blob(recordedChunks, { type: mime });
          if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
          recordedAudioUrl = URL.createObjectURL(blob);
          recPlayBtn.disabled = false;
          recToggleBtn.textContent = "🔴 আবার রেকর্ড";
          recStatus.textContent = "রেকর্ড সম্পন্ন! 'নিজের কণ্ঠ শুনুন' এ ক্লিক করে মিলিয়ে দেখুন।";
        };

        mediaRecorder.start();
        isRecording = true;
        recWaveform.classList.add("visible");
        recToggleBtn.textContent = "⏹ থামান";
        recStatus.textContent = settings.autoStopRecorder
          ? "🎙️ শুনছি... হরফটি বলুন (বলা শেষে নিজে থেকেই থেমে যাবে)"
          : "🎙️ রেকর্ডিং চলছে... থামাতে 'থামান' চাপুন।";

        // Live Waveform + Silence Detection via Web Audio API
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          recAudioCtx = new AudioCtx();
          const src = recAudioCtx.createMediaStreamSource(stream);
          const analyser = recAudioCtx.createAnalyser();
          analyser.fftSize = 1024;
          src.connect(analyser);
          const buf = new Uint8Array(analyser.fftSize);

          let speechStarted = false;
          let silenceStart = null;
          const startedAt = performance.now();

          const monitorSilence = () => {
            if (!isRecording) return;
            analyser.getByteTimeDomainData(buf);

            // Draw waveform
            waveCtx.clearRect(0, 0, recWaveform.width, recWaveform.height);
            waveCtx.lineWidth = 2;
            waveCtx.strokeStyle = settings.darkTheme ? "#3ecf8e" : "#0f5132";
            waveCtx.beginPath();
            const slice = recWaveform.width / buf.length;
            let x = 0;
            for (let i = 0; i < buf.length; i++) {
              const y = (buf[i] / 128.0) * (recWaveform.height / 2);
              if (i === 0) waveCtx.moveTo(x, y);
              else waveCtx.lineTo(x, y);
              x += slice;
            }
            waveCtx.stroke();

            let sum = 0;
            for (let i = 0; i < buf.length; i++) {
              const v = (buf[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / buf.length);
            const now = performance.now();

            if (settings.autoStopRecorder) {
              if (rms > 0.022) {
                speechStarted = true;
                silenceStart = null;
                recStatus.textContent = "🗣️ কণ্ঠ ধরা পড়েছে... বলা শেষ হলেই থামবে।";
              } else if (speechStarted) {
                if (!silenceStart) silenceStart = now;
                if (now - silenceStart > 850) {
                  stopRecordingNow();
                  return;
                }
              } else if (now - startedAt > 4500) {
                stopRecordingNow();
                return;
              }
            }
            recRafId = requestAnimationFrame(monitorSilence);
          };
          recRafId = requestAnimationFrame(monitorSilence);
        }

        if (settings.autoStopRecorder) {
          recMaxTimer = setTimeout(() => {
            if (isRecording) stopRecordingNow();
          }, 6000);
        }
      } catch {
        stopRecorderCleanup();
        recStatus.textContent = "মাইক্রোফোনের অনুমতি পাওয়া যায়নি।";
      }
    });

    recPlayBtn.addEventListener("click", () => {
      if (recordedAudioUrl) playAudioFile(recordedAudioUrl);
    });
  }

  // Dua & Auto-play
  document.getElementById("playDuaBtn").addEventListener("click", () => {
    stopAutoPlay();
    playAudioFile("audio/dua_rabbana.mp3");
  });

  const autoPlayBtn = document.getElementById("autoPlayBtn");
  function stopAutoPlay() {
    isAutoPlaying = false;
    clearTimeout(autoPlayTimer);
    autoPlayBtn.textContent = "▶ সব হরফ ধারাবাহিক শুনুন";
  }

  function runAutoPlayStep(idx) {
    if (!isAutoPlaying || idx >= LETTERS.length) {
      stopAutoPlay();
      return;
    }
    selectLetter(idx, false);
    const letter = LETTERS[selectedIndex];
    const cards = document.querySelectorAll("#alphabetGrid .letter-card");
    const cardEl = cards[selectedIndex];
    document.querySelectorAll(".letter-card.playing").forEach((el) => el.classList.remove("playing"));
    if (cardEl) cardEl.classList.add("playing");

    learnedSet.add(letter.id);
    localStorage.setItem("madani_learned", JSON.stringify([...learnedSet]));
    updateProgressUI();
    updateStreakUI(true);
    if (cardEl) cardEl.classList.add("learned");

    playAudioFile(letter.audio, () => {
      if (cardEl) cardEl.classList.remove("playing");
      if (isAutoPlaying) {
        autoPlayTimer = setTimeout(() => runAutoPlayStep(idx + 1), 380);
      }
    });
  }

  autoPlayBtn.addEventListener("click", () => {
    if (isAutoPlaying) {
      stopAutoPlay();
      stopCurrentAudio();
    } else {
      isAutoPlaying = true;
      autoPlayBtn.textContent = "⏹ থামান";
      runAutoPlayStep(0);
    }
  });

  document.getElementById("resetProgressBtn").addEventListener("click", () => {
    learnedSet.clear();
    localStorage.removeItem("madani_learned");
    updateProgressUI();
    renderAlphabetGrid();
  });

  // TAB 2: Murakkab + Word Breakdown
  document.getElementById("murakkabNoteText").textContent = DATA.murakkabNote;

  function renderMurakkabTable(filter = "all") {
    const tbody = document.getElementById("murakkabTableBody");
    tbody.innerHTML = "";
    const rows = LETTERS.filter((l) => l.id !== "yaa_maqsura").filter((l) => {
      if (filter === "nonjoin") return l.nonJoiningLeft;
      if (filter === "nuqta") return !l.nuqta.includes("নুকতা নেই");
      if (filter === "no-nuqta") return l.nuqta.includes("নুকতা নেই");
      return true;
    });

    rows.forEach((l) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><div class="m-cell-ar ar" data-id="${l.id}">${l.forms.isolated}</div></td>
        <td>
          <div class="m-cell-ar ar" data-id="${l.id}">${l.forms.initial}</div>
          <div class="m-cell-ex ar">${l.examples.initial}</div>
        </td>
        <td>
          <div class="m-cell-ar ar" data-id="${l.id}">${l.forms.medial}</div>
          <div class="m-cell-ex ar">${l.examples.medial}</div>
        </td>
        <td>
          <div class="m-cell-ar ar" data-id="${l.id}">${l.forms.final}</div>
          <div class="m-cell-ex ar">${l.examples.final}</div>
        </td>
        <td>
          <strong>${l.bnName}</strong>
          <div style="font-size:0.78rem; color:var(--text-muted);">${l.nuqta}</div>
          ${l.nonJoiningLeft ? `<span class="non-join-tag">বামে মিলে না</span>` : ""}
        </td>
        <td><button class="btn btn-primary" data-id="${l.id}" type="button" style="padding:5px 10px; font-size:0.82rem;">🔊 শুনুন</button></td>
      `;
      tr.querySelectorAll("[data-id]").forEach((el) => {
        el.addEventListener("click", () => playLetter(LETTER_BY_ID[el.dataset.id]));
      });
      tbody.appendChild(tr);
    });
  }

  document.querySelectorAll(".murakkab-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".murakkab-filter").forEach((b) => b.classList.remove("btn-primary", "active"));
      btn.classList.add("btn-primary", "active");
      renderMurakkabTable(btn.dataset.filter);
    });
  });

  function renderWordBreakdowns() {
    const grid = document.getElementById("wordBreakdownGrid");
    grid.innerHTML = "";
    DATA.wordBreakdowns.forEach((w) => {
      const card = document.createElement("div");
      card.className = "word-card";
      const partsHtml = w.parts
        .map((p) => {
          const l = LETTER_BY_ID[p.letterId];
          return `
            <button type="button" class="word-part-pill" data-id="${p.letterId}" title="${l.bnName} — ${p.pos}">
              <div class="ar">${p.form}</div>
              <div style="font-size:0.72rem; color:var(--primary); font-weight:600;">${l.bnName}</div>
            </button>
          `;
        })
        .join("");

      card.innerHTML = `
        <button type="button" class="btn btn-primary play-word-btn">
          ${w.word}
        </button>
        <div style="font-size:0.84rem; color:var(--text-muted); margin-top:4px;">অর্থ: ${w.meaning}</div>
        <div class="word-parts">${partsHtml}</div>
      `;

      card.querySelector(".play-word-btn").addEventListener("click", () => playAudioFile(w.audio));
      card.querySelectorAll(".word-part-pill").forEach((pill) => {
        pill.addEventListener("click", () => playLetter(LETTER_BY_ID[pill.dataset.id]));
      });
      grid.appendChild(card);
    });
  }

  function renderMurakkabExam() {
    const grid = document.getElementById("murakkabExamGrid");
    grid.innerHTML = "";
    DATA.murakkabExam.forEach((item) => {
      const letter = LETTER_BY_ID[item.letterId];
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "exam-cell";
      cell.innerHTML = `
        <div class="ar-form ar">${item.form}</div>
        <div class="reveal-bn">${revealAllExam ? `${letter.bnName} (${item.position})` : "ক্লিক করুন"}</div>
      `;
      cell.addEventListener("click", () => {
        playLetter(letter);
        cell.querySelector(".reveal-bn").textContent = `${letter.bnName} (${item.position})`;
      });
      grid.appendChild(cell);
    });
  }

  document.getElementById("toggleRevealExamBtn").addEventListener("click", () => {
    revealAllExam = !revealAllExam;
    renderMurakkabExam();
  });

  // TAB 3: Harakat, Qalqalah & Tashdeed
  function renderHarakatTab() {
    const grid = document.getElementById("harakatGrid");
    grid.innerHTML = "";

    const harakatLetters = LETTERS.filter((l) => l.id !== "hamzah" && l.id !== "yaa_maqsura");
    harakatLetters.forEach((l) => {
      const baseA = l.id === "alif" ? "أَ" : `${l.char}َ`;
      const baseI = l.id === "alif" ? "إِ" : `${l.char}ِ`;
      const baseU = l.id === "alif" ? "أُ" : `${l.char}ُ`;

      const card = document.createElement("div");
      card.className = "harakat-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
          <strong>${l.bnName}</strong>
          <button type="button" class="btn btn-primary harakat-play-all-btn" style="padding:3px 10px; font-size:0.76rem; border-radius:999px;" title="৩টি একসাথে শুনুন">▶ ৩টি</button>
          <span class="ar" style="font-size:1.35rem; color:var(--primary);">${l.char}</span>
        </div>
        <div class="harakat-row">
          <button type="button" class="harakat-pill" data-audio="audio/hz_${l.id}_a.mp3">
            <span class="ar">${baseA}</span>
            <span>যবর</span>
          </button>
          <button type="button" class="harakat-pill" data-audio="audio/hz_${l.id}_i.mp3">
            <span class="ar">${baseI}</span>
            <span>যের</span>
          </button>
          <button type="button" class="harakat-pill" data-audio="audio/hz_${l.id}_u.mp3">
            <span class="ar">${baseU}</span>
            <span>পেশ</span>
          </button>
        </div>
      `;

      const pills = [...card.querySelectorAll(".harakat-pill")];
      pills.forEach((pill) => {
        pill.addEventListener("click", () => {
          document.querySelectorAll(".harakat-pill.playing").forEach((el) => el.classList.remove("playing"));
          pill.classList.add("playing");
          updateStreakUI(true);
          playAudioFile(pill.dataset.audio, () => pill.classList.remove("playing"));
        });
      });

      card.querySelector(".harakat-play-all-btn").addEventListener("click", () => {
        updateStreakUI(true);
        const seq = [
          { src: `audio/hz_${l.id}_a.mp3`, pill: pills[0] },
          { src: `audio/hz_${l.id}_i.mp3`, pill: pills[1] },
          { src: `audio/hz_${l.id}_u.mp3`, pill: pills[2] },
          { src: `audio/h_${l.id}_a.mp3`, pill: pills[0] },
          { src: `audio/h_${l.id}_i.mp3`, pill: pills[1] },
          { src: `audio/h_${l.id}_u.mp3`, pill: pills[2] },
        ];
        let stepIdx = 0;
        const runStep = () => {
          document.querySelectorAll(".harakat-pill.playing").forEach((el) => el.classList.remove("playing"));
          if (stepIdx >= seq.length) return;
          const item = seq[stepIdx++];
          if (item.pill) item.pill.classList.add("playing");
          playAudioFile(item.src, runStep);
        };
        runStep();
      });
      grid.appendChild(card);
    });

    const qGrid = document.getElementById("qalqalahGrid");
    qGrid.innerHTML = "";
    DATA.qalqalahExamples.forEach((q) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.style.flexDirection = "column";
      btn.style.padding = "10px 16px";
      btn.innerHTML = `<span class="ar" style="font-size:2.1rem; color:var(--primary);">${q.text}</span><span style="font-size:0.78rem;">${q.note}</span>`;
      btn.addEventListener("click", () => playAudioFile(q.audio));
      qGrid.appendChild(btn);
    });

    const tGrid = document.getElementById("tashdeedGrid");
    tGrid.innerHTML = "";
    DATA.tashdeedExamples.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.style.flexDirection = "column";
      btn.style.padding = "10px 16px";
      btn.innerHTML = `<span class="ar" style="font-size:2.1rem; color:var(--primary);">${t.text}</span><span style="font-size:0.78rem;">${t.note}</span>`;
      btn.addEventListener("click", () => playAudioFile(t.audio));
      tGrid.appendChild(btn);
    });

    const twGrid = document.getElementById("tanweenGrid");
    twGrid.innerHTML = "";
    DATA.tanweenExamples.forEach((tw) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.style.flexDirection = "column";
      btn.style.padding = "10px 14px";
      btn.innerHTML = `<span class="ar" style="font-size:2rem; color:var(--primary);">${tw.text}</span><span style="font-size:0.76rem;">${tw.note}</span>`;
      btn.addEventListener("click", () => {
        updateStreakUI(true);
        playAudioFile(tw.audio);
      });
      twGrid.appendChild(btn);
    });

    const mGrid = document.getElementById("maddGrid");
    mGrid.innerHTML = "";
    DATA.maddExamples.forEach((md) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.style.flexDirection = "column";
      btn.style.padding = "10px 14px";
      btn.innerHTML = `<span class="ar" style="font-size:2rem; color:var(--primary);">${md.text}</span><span class="region-tag" style="margin:2px 0;">${md.tag}</span><span style="font-size:0.74rem;">${md.note}</span>`;
      btn.addEventListener("click", () => {
        updateStreakUI(true);
        playAudioFile(md.audio);
      });
      mGrid.appendChild(btn);
    });

    function getTajweedClass(rule) {
      if (!rule) return "";
      if (rule.includes("কলকলাহ")) return "tj-qalqalah";
      if (rule.includes("গুন্নাহ")) return "tj-ghunnah";
      if (rule.includes("মাদ") || rule.includes("খাঁড়া") || rule.includes("উল্টা")) return "tj-madd";
      if (rule.includes("মোটা") || rule.includes("হলকী")) return "tj-heavy";
      return "";
    }

    const surahContainer = document.getElementById("surahContainer");
    surahContainer.innerHTML = "";
    DATA.surahs.forEach((surah) => {
      const card = document.createElement("div");
      card.className = "surah-card";
      const ayahsHtml = surah.ayahs
        .map(
          (ayah) => `
          <div class="ayah-row">
            ${ayah
              .map(
                (w) => `
              <button type="button" class="surah-word ${getTajweedClass(w.rule)}" data-audio="${w.audio}">
                <span class="ar-word">${w.ar}</span>
                <span class="bn-word">${w.bn}</span>
                <span class="rule-word">${w.rule}</span>
              </button>
            `
              )
              .join("")}
          </div>
        `
        )
        .join("");

      card.innerHTML = `
        <h3 style="margin:0 0 2px; color:var(--primary);">${surah.title}</h3>
        <p style="margin:0 0 8px; font-size:0.84rem; color:var(--text-muted);">${surah.subtitle}</p>
        ${ayahsHtml}
      `;
      card.querySelectorAll(".surah-word").forEach((wordBtn) => {
        wordBtn.addEventListener("click", () => {
          card.querySelectorAll(".surah-word.playing").forEach((el) => el.classList.remove("playing"));
          wordBtn.classList.add("playing");
          updateStreakUI(true);
          triggerHaptic(12);
          playAudioFile(wordBtn.dataset.audio, () => wordBtn.classList.remove("playing"));
        });
      });
      surahContainer.appendChild(card);
    });
  }

  document.querySelectorAll(".harakat-subtab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("madani_harakat_subtab", btn.dataset.hview);
      document.querySelectorAll(".harakat-subtab-btn").forEach((b) => b.classList.remove("btn-primary", "active"));
      btn.classList.add("btn-primary", "active");
      document.querySelectorAll(".harakat-subview").forEach((v) => {
        v.style.display = v.id === btn.dataset.hview ? "block" : "none";
      });
    });
  });

  // TAB 4: Makhraj
  function renderMakhrajList(regionFilter = "all") {
    const container = document.getElementById("makhrajCards");
    container.innerHTML = "";
    const items =
      regionFilter === "all"
        ? DATA.makhrajList
        : DATA.makhrajList.filter((m) => m.region === regionFilter);

    items.forEach((m) => {
      const card = document.createElement("div");
      card.className = "makhraj-card";
      card.id = `makhraj-card-${m.num}`;

      const letterPills = m.letterIds
        .map((id, i) => {
          const l = LETTER_BY_ID[id];
          const displayChar = m.letters[i] || l.char;
          return `
            <button class="makhraj-letter-pill" data-id="${id}" type="button">
              <span class="ar">${displayChar}</span>
              <span>${l.bnName}</span>
            </button>
          `;
        })
        .join("");

      const exampleBtn = m.exampleAudio
        ? `<button class="btn btn-gold makhraj-ex-btn" data-audio="${m.exampleAudio}" type="button" style="margin-top:10px; font-size:0.85rem;">🔊 উদাহরণ শুনুন: <span class="ar" style="font-size:1.25rem;">${m.exampleText}</span></button>`
        : "";

      card.innerHTML = `
        <div class="makhraj-header">
          <div>
            <span class="makhraj-num">${toBnNum(m.num)} নাম্বার মাখরাজ</span>
            <strong style="margin-left:8px; font-size:1rem;">${m.title}</strong>
          </div>
          <span class="region-tag">${m.regionBn}</span>
        </div>
        <p style="margin: 4px 0 0; font-size: 0.92rem;">${m.description}</p>
        <div class="makhraj-letters">${letterPills}</div>
        ${exampleBtn}
      `;

      card.addEventListener("click", (e) => {
        if (!e.target.closest("button")) highlightSvgZone(m.region);
      });
      card.querySelectorAll(".makhraj-letter-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          playLetter(LETTER_BY_ID[pill.dataset.id]);
          highlightSvgZone(m.region);
        });
      });
      const exBtn = card.querySelector(".makhraj-ex-btn");
      if (exBtn) {
        exBtn.addEventListener("click", () => {
          playAudioFile(exBtn.dataset.audio);
          highlightSvgZone(m.region);
        });
      }
      container.appendChild(card);
    });
  }

  function highlightSvgZone(region) {
    document.querySelectorAll(".svg-zone").forEach((z) => {
      z.classList.toggle("active-zone", z.dataset.region === region);
    });
  }

  function setMakhrajFilter(region) {
    document.querySelectorAll(".makhraj-region-btn").forEach((b) => {
      const active = b.dataset.region === region;
      b.classList.toggle("btn-primary", active);
      b.classList.toggle("active", active);
    });
    highlightSvgZone(region === "all" ? "" : region);
    renderMakhrajList(region);
  }

  function highlightMakhrajCard(num) {
    setMakhrajFilter("all");
    const target = document.getElementById(`makhraj-card-${num}`);
    if (target) {
      document.querySelectorAll(".makhraj-card.highlighted").forEach((c) => c.classList.remove("highlighted"));
      target.classList.add("highlighted");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  document.querySelectorAll(".makhraj-region-btn").forEach((btn) => {
    btn.addEventListener("click", () => setMakhrajFilter(btn.dataset.region));
  });
  document.querySelectorAll(".svg-zone").forEach((zone) => {
    zone.addEventListener("click", () => setMakhrajFilter(zone.dataset.region));
  });

  // TAB 1.5: Dedicated Writing Tab + Madani Qaida Page 6 & 7 (8 Groups, Nuqta, Mashq)
  function switchWritingSubtab(viewId) {
    localStorage.setItem("madani_writing_subtab", viewId);
    document.querySelectorAll(".writing-subtab-btn").forEach((b) => {
      const active = b.dataset.wview === viewId;
      b.classList.toggle("btn-primary", active);
      b.classList.toggle("active", active);
    });
    document.querySelectorAll(".writing-subview").forEach((v) => {
      v.style.display = v.id === viewId ? "block" : "none";
    });
    if (viewId === "w-canvas") drawTraceWatermark();
  }

  document.querySelectorAll(".writing-subtab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchWritingSubtab(btn.dataset.wview));
  });

  function renderWritingGroupsAndNuqta() {
    const groupsEl = document.getElementById("eightGroupsList");
    if (groupsEl && DATA.eightWritingGroups) {
      groupsEl.innerHTML = "";
      DATA.eightWritingGroups.forEach((g) => {
        const row = document.createElement("div");
        row.className = "group-row";
        const btns = g.ids
          .map((id) => {
            const l = LETTER_BY_ID[id];
            return `<button type="button" class="qaida-mini-btn" data-id="${id}"><span class="ar">${l.char}</span><span style="font-size:0.76rem; color:var(--text-muted);">${l.bnName}</span></button>`;
          })
          .join("");
        row.innerHTML = `<div class="group-label">${g.group}</div><div class="group-letters">${btns}</div>`;
        row.querySelectorAll(".qaida-mini-btn").forEach((b) => {
          b.addEventListener("click", () => {
            const idx = LETTERS.findIndex((x) => x.id === b.dataset.id);
            if (idx >= 0) {
              traceIndex = idx;
              updateTraceLetter(false);
            }
            playLetter(LETTER_BY_ID[b.dataset.id]);
          });
        });
        groupsEl.appendChild(row);
      });
    }

    const renderNuqtaGrid = (elId, ids) => {
      const el = document.getElementById(elId);
      if (!el || !ids) return;
      el.innerHTML = "";
      ids.forEach((id) => {
        const l = LETTER_BY_ID[id];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "qaida-mini-btn";
        btn.style.justifyContent = "center";
        btn.innerHTML = `<span class="ar">${l.char}</span><span style="font-size:0.75rem; color:var(--text-muted);">${l.bnName}</span>`;
        btn.addEventListener("click", () => playLetter(l));
        el.appendChild(btn);
      });
    };

    renderNuqtaGrid("noNuqtaGrid", DATA.noNuqta14);
    renderNuqtaGrid("withNuqtaGrid", DATA.withNuqta15);

    const mashqEl = document.getElementById("mashqGrid");
    if (mashqEl && DATA.mashqPairs) {
      mashqEl.innerHTML = "";
      DATA.mashqPairs.forEach(([id1, id2]) => {
        const l1 = LETTER_BY_ID[id1];
        const l2 = LETTER_BY_ID[id2];
        const box = document.createElement("div");
        box.className = "mashq-pair-box";
        box.innerHTML = `
          <button type="button" data-id="${id1}" title="${l1.bnName}">${l1.char}</button>
          <span style="color:var(--text-muted);">-</span>
          <button type="button" data-id="${id2}" title="${l2.bnName}">${l2.char}</button>
        `;
        box.querySelectorAll("button").forEach((b) => {
          b.addEventListener("click", () => playLetter(LETTER_BY_ID[b.dataset.id]));
        });
        mashqEl.appendChild(box);
      });
    }
  }

  // TAB 5: Practice Sub-views (Quiz, Confusing Pairs, Report)
  function switchPracticeSubtab(viewId) {
    localStorage.setItem("madani_practice_subtab", viewId);
    document.querySelectorAll(".practice-view-btn").forEach((b) => {
      const active = b.dataset.view === viewId;
      b.classList.toggle("btn-primary", active);
      b.classList.toggle("active", active);
    });
    document.querySelectorAll(".practice-subview").forEach((v) => {
      v.style.display = v.id === viewId ? "block" : "none";
    });
    if (viewId === "trace-view") drawTraceWatermark();
  }

  document.querySelectorAll(".practice-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchPracticeSubtab(btn.dataset.view));
  });

  function renderConfusingPairs() {
    const grid = document.getElementById("pairsGrid");
    grid.innerHTML = "";
    DATA.confusingPairs.forEach((pair) => {
      const card = document.createElement("div");
      card.className = "pair-card";
      const btns = pair.ids
        .map((id) => {
          const l = LETTER_BY_ID[id];
          return `
            <button type="button" class="pair-btn" data-id="${id}">
              <span class="ar">${l.char}</span>
              <strong>${l.bnName}</strong>
            </button>
          `;
        })
        .join("");

      card.innerHTML = `
        <span class="region-tag">${pair.category}</span>
        <h3 style="margin:6px 0 4px; font-size:1.02rem;">${pair.title}</h3>
        <div class="pair-letters">${btns}</div>
        <p style="margin:6px 0 0; font-size:0.86rem; color:var(--text-muted);">${pair.note}</p>
      `;
      card.querySelectorAll(".pair-btn").forEach((b) => {
        b.addEventListener("click", () => playLetter(LETTER_BY_ID[b.dataset.id]));
      });
      grid.appendChild(card);
    });
  }

  // Handwriting Tracing Canvas
  const traceCanvas = document.getElementById("traceCanvas");
  const traceCtx = traceCanvas.getContext("2d");
  let isDrawing = false;

  let showTraceGuide = true;

  function syncTraceCanvasSizes() {
    const box = traceCanvas.parentElement;
    const w = box.clientWidth || 332;
    const h = box.clientHeight || 240;
    if (traceCanvas.width !== w || traceCanvas.height !== h) {
      traceCanvas.width = w;
      traceCanvas.height = h;
      traceDemoCanvas.width = w;
      traceDemoCanvas.height = h;
    }
    return { w, h };
  }

  function sampleSvgPath(pathStr, w, h) {
    const tokens = pathStr.match(/[A-Za-z]|-?\d*\.?\d+/g) || [];
    const pts = [];
    let i = 0;
    let cx = 0;
    let cy = 0;

    const pushSeg = (fn, steps = 28) => {
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const p = fn(t);
        if (pts.length === 0 || Math.hypot(p[0] - pts[pts.length - 1][0], p[1] - pts[pts.length - 1][1]) > 0.5) {
          pts.push(p);
        }
      }
    };

    while (i < tokens.length) {
      const cmd = tokens[i++];
      if (cmd === "M") {
        cx = Number(tokens[i++]) * w;
        cy = Number(tokens[i++]) * h;
        pts.push([cx, cy]);
      } else if (cmd === "L") {
        const x2 = Number(tokens[i++]) * w;
        const y2 = Number(tokens[i++]) * h;
        const x1 = cx;
        const y1 = cy;
        pushSeg((t) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t], 18);
        cx = x2;
        cy = y2;
      } else if (cmd === "Q") {
        const qx = Number(tokens[i++]) * w;
        const qy = Number(tokens[i++]) * h;
        const x2 = Number(tokens[i++]) * w;
        const y2 = Number(tokens[i++]) * h;
        const x1 = cx;
        const y1 = cy;
        pushSeg((t) => {
          const mt = 1 - t;
          return [
            mt * mt * x1 + 2 * mt * t * qx + t * t * x2,
            mt * mt * y1 + 2 * mt * t * qy + t * t * y2,
          ];
        }, 28);
        cx = x2;
        cy = y2;
      } else if (cmd === "C") {
        const c1x = Number(tokens[i++]) * w;
        const c1y = Number(tokens[i++]) * h;
        const c2x = Number(tokens[i++]) * w;
        const c2y = Number(tokens[i++]) * h;
        const x2 = Number(tokens[i++]) * w;
        const y2 = Number(tokens[i++]) * h;
        const x1 = cx;
        const y1 = cy;
        pushSeg((t) => {
          const mt = 1 - t;
          return [
            mt * mt * mt * x1 + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * x2,
            mt * mt * mt * y1 + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * y2,
          ];
        }, 36);
        cx = x2;
        cy = y2;
      }
    }
    return pts;
  }

  function drawTraceWatermark() {
    const { w, h } = syncTraceCanvasSizes();
    traceDemoCtx.clearRect(0, 0, w, h);

    // Ruled Notebook Baseline at y = 0.60 * h
    const baseY = Math.round(h * 0.60);
    traceDemoCtx.save();
    traceDemoCtx.strokeStyle = settings.darkTheme ? "rgba(74, 222, 151, 0.22)" : "rgba(2, 132, 199, 0.22)";
    traceDemoCtx.lineWidth = 1.5;
    traceDemoCtx.setLineDash([6, 5]);
    traceDemoCtx.beginPath();
    traceDemoCtx.moveTo(14, baseY);
    traceDemoCtx.lineTo(w - 14, baseY);
    traceDemoCtx.stroke();
    traceDemoCtx.restore();

    if (!showTraceGuide) return;
    const l = LETTERS[traceIndex];
    const strokeData = window.ARABIC_STROKES && window.ARABIC_STROKES[l.id];
    if (!strokeData) return;

    // Draw smooth Bezier watermark
    traceDemoCtx.save();
    traceDemoCtx.lineWidth = 11;
    traceDemoCtx.lineCap = "round";
    traceDemoCtx.lineJoin = "round";
    traceDemoCtx.strokeStyle = settings.darkTheme ? "rgba(62, 207, 142, 0.20)" : "rgba(15, 81, 50, 0.14)";

    strokeData.strokes.forEach((s) => {
      const pts = sampleSvgPath(s, w, h);
      if (pts.length < 2) return;
      traceDemoCtx.beginPath();
      traceDemoCtx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) traceDemoCtx.lineTo(pts[i][0], pts[i][1]);
      traceDemoCtx.stroke();
    });

    // Watermark dots
    traceDemoCtx.fillStyle = settings.darkTheme ? "rgba(62, 207, 142, 0.22)" : "rgba(15, 81, 50, 0.16)";
    strokeData.dots.forEach(([dx, dy]) => {
      traceDemoCtx.beginPath();
      traceDemoCtx.arc(dx * w, dy * h, 7, 0, Math.PI * 2);
      traceDemoCtx.fill();
    });

    // Green Start Dot on first stroke
    const firstPts = sampleSvgPath(strokeData.strokes[0], w, h);
    if (firstPts.length > 0) {
      traceDemoCtx.fillStyle = "#16a34a";
      traceDemoCtx.beginPath();
      traceDemoCtx.arc(firstPts[0][0], firstPts[0][1], 5.5, 0, Math.PI * 2);
      traceDemoCtx.fill();
    }
    traceDemoCtx.restore();
  }

  function updateTraceLetter(play = false) {
    stopTraceAnimation();
    localStorage.setItem("madani_trace_index", String(traceIndex));
    const l = LETTERS[traceIndex];
    document.getElementById("traceGuide").textContent = l.char;
    document.getElementById("traceLetterLabel").textContent = `${l.bnName} (${l.char})`;
    document.querySelectorAll("#tracePickerGrid .letter-card").forEach((c, i) => {
      c.classList.toggle("selected", i === traceIndex);
    });

    const strokeData = window.ARABIC_STROKES && window.ARABIC_STROKES[l.id];
    const baseTag = document.getElementById("traceBaselineTag");
    const tipBox = document.getElementById("traceTipBox");
    const famBox = document.getElementById("traceFamilyPills");

    if (strokeData) {
      baseTag.textContent = strokeData.baseline === "below" ? "📏 লেজ লাইনের নিচে নামে" : "📏 লাইনের উপরে বসে";
      tipBox.textContent = `💡 লেখার নিয়ম: ${strokeData.tip}`;
      famBox.innerHTML = strokeData.family
        .map((fid) => {
          const fl = LETTER_BY_ID[fid];
          const isCur = fid === l.id;
          return `<button type="button" class="btn ${isCur ? "btn-primary" : ""}" data-fid="${fid}" style="padding:2px 9px; font-size:1.1rem; font-family:var(--font-ar);">${fl.char}</button>`;
        })
        .join("");
      famBox.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => {
          const idx = LETTERS.findIndex((x) => x.id === b.dataset.fid);
          if (idx >= 0) {
            traceIndex = idx;
            updateTraceLetter(true);
          }
        });
      });
    }

    clearTraceCanvas();
    drawTraceWatermark();
    const evalBox = document.getElementById("traceEvalFeedback");
    if (evalBox) evalBox.style.display = "none";
    if (play) playLetter(l);
  }

  function clearTraceCanvas() {
    traceCtx.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
  }

  function getCanvasPos(e) {
    const rect = traceCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * traceCanvas.width,
      y: ((clientY - rect.top) / rect.height) * traceCanvas.height,
    };
  }

  function startDraw(e) {
    isDrawing = true;
    const pos = getCanvasPos(e);
    traceCtx.beginPath();
    traceCtx.moveTo(pos.x, pos.y);
    traceCtx.lineWidth = 10;
    traceCtx.lineCap = "round";
    traceCtx.lineJoin = "round";
    traceCtx.strokeStyle = document.documentElement.getAttribute("data-theme") === "dark" ? "#3ecf8e" : "#0f5132";
  }

  function moveDraw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    traceCtx.lineTo(pos.x, pos.y);
    traceCtx.stroke();
  }

  function endDraw() {
    isDrawing = false;
  }

  traceCanvas.addEventListener("mousedown", startDraw);
  traceCanvas.addEventListener("mousemove", moveDraw);
  window.addEventListener("mouseup", endDraw);
  traceCanvas.addEventListener("touchstart", startDraw, { passive: true });
  traceCanvas.addEventListener("touchmove", moveDraw, { passive: false });
  traceCanvas.addEventListener("touchend", endDraw);

  // Tracing Letter Grid Picker Popup
  const tracePickerModal = document.getElementById("tracePickerModal");
  const tracePickerBackdrop = document.getElementById("tracePickerBackdrop");
  const tracePickerGrid = document.getElementById("tracePickerGrid");

  function renderTracePickerGrid() {
    tracePickerGrid.innerHTML = "";
    LETTERS.forEach((l, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "letter-card";
      if (idx === traceIndex) btn.classList.add("selected");
      btn.style.padding = "7px 4px";
      btn.innerHTML = `
        <div class="card-ar ar" style="font-size:1.75rem; margin:2px 0;">${l.char}</div>
        <div class="card-bn" style="font-size:0.75rem;">${l.bnName}</div>
      `;
      btn.addEventListener("click", () => {
        traceIndex = idx;
        closeTracePicker();
        updateTraceLetter(true);
      });
      tracePickerGrid.appendChild(btn);
    });
  }

  function openTracePicker() {
    renderTracePickerGrid();
    tracePickerBackdrop.classList.add("open");
    tracePickerModal.classList.add("open");
  }

  function closeTracePicker() {
    tracePickerBackdrop.classList.remove("open");
    tracePickerModal.classList.remove("open");
  }

  document.getElementById("tracePickerOpenBtn").addEventListener("click", openTracePicker);
  document.getElementById("tracePickerCloseBtn").addEventListener("click", closeTracePicker);
  tracePickerBackdrop.addEventListener("click", closeTracePicker);

  document.getElementById("traceStartBtn").addEventListener("click", () => {
    traceIndex = 0;
    updateTraceLetter(true);
  });
  document.getElementById("tracePrevBtn").addEventListener("click", () => {
    traceIndex = (traceIndex - 1 + LETTERS.length) % LETTERS.length;
    updateTraceLetter(true);
  });
  document.getElementById("traceNextBtn").addEventListener("click", () => {
    traceIndex = (traceIndex + 1) % LETTERS.length;
    updateTraceLetter(true);
  });
  document.getElementById("tracePlayBtn").addEventListener("click", () => playLetter(LETTERS[traceIndex]));
  document.getElementById("traceClearBtn").addEventListener("click", () => {
    clearTraceCanvas();
    drawTraceWatermark();
    const evalBox = document.getElementById("traceEvalFeedback");
    if (evalBox) evalBox.style.display = "none";
  });

  function playAudioSequence(files) {
    if (!files || !files.length) return;
    let idx = 0;
    const next = () => {
      if (idx >= files.length) return;
      const src = files[idx++];
      playAudioFile(src, next);
    };
    next();
  }

  function evaluateHandwriting() {
    const l = LETTERS[traceIndex];
    const strokeData = window.ARABIC_STROKES && window.ARABIC_STROKES[l.id];
    const evalBox = document.getElementById("traceEvalFeedback");
    const w = traceCanvas.width;
    const h = traceCanvas.height;
    const userImg = traceCtx.getImageData(0, 0, w, h).data;

    let userCount = 0;
    for (let i = 3; i < userImg.length; i += 4) {
      if (userImg[i] > 20) userCount += 1;
    }

    if (userCount < 35) {
      const msg = "আপনি এখনো ক্যানভাসে কিছু লেখেননি। হালকা চিহ্নের উপর লিখে তারপর যাচাই করুন।";
      evalBox.style.display = "block";
      evalBox.innerHTML = `<strong>🗣️ মূল্যায়ন:</strong><div>${msg}</div>`;
      playAudioSequence(["audio/bn_empty.mp3"]);
      return;
    }

    if (!strokeData) return;

    // 1. Check path point coverage directly along the Bezier curve (fair & accurate)
    const allStrokePts = [];
    strokeData.strokes.forEach((s) => {
      allStrokePts.push(...sampleSvgPath(s, w, h));
    });

    const hitRadius = 26;
    let totalSamples = 0;
    let hitSamples = 0;
    let missLeft = 0;
    let missRight = 0;

    for (let i = 0; i < allStrokePts.length; i += 3) {
      const [px, py] = allStrokePts[i];
      const cx = Math.round(px);
      const cy = Math.round(py);
      totalSamples += 1;
      let hit = false;
      for (let yy = Math.max(0, cy - hitRadius); yy <= Math.min(h - 1, cy + hitRadius) && !hit; yy += 2) {
        for (let xx = Math.max(0, cx - hitRadius); xx <= Math.min(w - 1, cx + hitRadius); xx += 2) {
          if (userImg[(yy * w + xx) * 4 + 3] > 20) {
            hit = true;
            break;
          }
        }
      }
      if (hit) hitSamples += 1;
      else if (px < w * 0.5) missLeft += 1;
      else missRight += 1;
    }

    // 2. Check precision & detect extra/stray ink clusters (e.g. extra dot like ث instead of ت)
    const expCanvas = document.createElement("canvas");
    expCanvas.width = w;
    expCanvas.height = h;
    const expCtx = expCanvas.getContext("2d");
    expCtx.lineWidth = 32;
    expCtx.lineCap = "round";
    expCtx.lineJoin = "round";
    expCtx.strokeStyle = "#000";

    strokeData.strokes.forEach((s) => {
      const pts = sampleSvgPath(s, w, h);
      if (pts.length < 2) return;
      expCtx.beginPath();
      expCtx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) expCtx.lineTo(pts[i][0], pts[i][1]);
      expCtx.stroke();
    });
    strokeData.dots.forEach(([dx, dy]) => {
      expCtx.beginPath();
      expCtx.arc(dx * w, dy * h, 20, 0, Math.PI * 2);
      expCtx.fill();
    });

    const expImg = expCtx.getImageData(0, 0, w, h).data;
    let insideUser = 0;
    let outTop = 0;
    let outBottom = 0;
    const outMask = new Uint8Array(w * h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pxIdx = y * w + x;
        const aIdx = pxIdx * 4 + 3;
        if (userImg[aIdx] > 20) {
          if (expImg[aIdx] > 20) insideUser += 1;
          else {
            outMask[pxIdx] = 1;
            if (y < h * 0.60) outTop += 1;
            else outBottom += 1;
          }
        }
      }
    }

    // Count distinct outside ink clusters (size >= 25px catches an extra dot!)
    let extraClusters = 0;
    const visitedOut = new Uint8Array(w * h);
    const outQ = new Int32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      if (!outMask[i] || visitedOut[i]) continue;
      let qh = 0;
      let qt = 0;
      outQ[qt++] = i;
      visitedOut[i] = 1;
      while (qh < qt) {
        const idx = outQ[qh++];
        const x = idx % w;
        const y = (idx / w) | 0;
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;
            const nIdx = ny * w + nx;
            if (outMask[nIdx] && !visitedOut[nIdx]) {
              visitedOut[nIdx] = 1;
              outQ[qt++] = nIdx;
            }
          }
        }
      }
      if (qt >= 25) extraClusters += 1;
    }

    const coverage = totalSamples > 0 ? hitSamples / totalSamples : 0;
    const precision = userCount > 0 ? insideUser / userCount : 0;

    // 3. Check dots specifically
    let missingDots = 0;
    strokeData.dots.forEach(([dx, dy]) => {
      const cx = Math.round(dx * w);
      const cy = Math.round(dy * h);
      let foundDot = false;
      for (let yy = Math.max(0, cy - 24); yy <= Math.min(h - 1, cy + 24) && !foundDot; yy += 2) {
        for (let xx = Math.max(0, cx - 24); xx <= Math.min(w - 1, cx + 24); xx += 2) {
          if (userImg[(yy * w + xx) * 4 + 3] > 20) {
            foundDot = true;
            break;
          }
        }
      }
      if (!foundDot) missingDots += 1;
    });

    const dotScore = strokeData.dots.length > 0 ? (strokeData.dots.length - missingDots) / strokeData.dots.length : 1;
    let score = Math.round((coverage * 0.5 + precision * 0.3 + dotScore * 0.2) * 100);
    if (extraClusters > 0) {
      score = Math.max(15, Math.min(72, score - extraClusters * 20));
    }

    const issues = [];
    const voiceClips = [];

    if (score >= 82 && missingDots === 0 && extraClusters === 0) {
      voiceClips.push("audio/bn_excellent.mp3");
    } else if (score >= 58) {
      voiceClips.push("audio/bn_good.mp3");
    } else {
      voiceClips.push("audio/bn_practice.mp3");
    }

    if (missingDots > 0) {
      issues.push(`${toBnNum(missingDots)}টি নুকতা সঠিক জায়গায় বসানো হয়নি।`);
      voiceClips.push("audio/bn_dot_missing.mp3");
    }
    if (extraClusters > 0) {
      issues.push("অতিরিক্ত নুকতা বা মূল আকৃতির বাইরে দাগ পড়েছে।");
      voiceClips.push("audio/bn_out_bounds.mp3");
    }
    if (coverage < 0.72) {
      if (missRight > missLeft * 1.3) {
        issues.push("ডান দিকের শুরুর অংশ পুরোপুরি টানা হয়নি।");
        voiceClips.push("audio/bn_miss_right.mp3");
      } else if (missLeft > missRight * 1.3) {
        issues.push("বাম দিকের শেষ অংশ পুরোপুরি টানা হয়নি।");
        voiceClips.push("audio/bn_miss_left.mp3");
      } else {
        issues.push("হরফটির মূল আকৃতি সম্পূর্ণভাবে টানা হয়নি।");
        voiceClips.push("audio/bn_miss_shape.mp3");
      }
    }
    if (precision < 0.62 && extraClusters === 0) {
      if (outBottom > outTop * 1.3) {
        issues.push("রেখা বেসলাইনের নিচে বেশি সরে গেছে।");
        voiceClips.push("audio/bn_out_baseline.mp3");
      } else {
        issues.push("কিছু দাগ মূল আকৃতির বাইরে চলে গেছে।");
        voiceClips.push("audio/bn_out_bounds.mp3");
      }
    }

    if (issues.length > 0 || score < 82) {
      voiceClips.push(`audio/bn_tip_${l.id}.mp3`);
    }

    let summary = "";
    if (score >= 82 && issues.length === 0) {
      summary = `মাশাআল্লাহ! ${l.bnName} হরফটি চমৎকার লিখেছেন (${toBnNum(score)}%)।`;
    } else if (score >= 58) {
      summary = `ভালো চেষ্টা! নম্বর: ${toBnNum(score)}%। ${issues.join(" ")} সঠিক নিয়ম: ${strokeData.tip}`;
    } else {
      summary = `আরও একটু অনুশীলন প্রয়োজন (${toBnNum(score)}%)। ভুল: ${issues.join(" ")} সমাধান: ${strokeData.tip}`;
    }

    evalBox.style.display = "block";
    evalBox.innerHTML = `
      <strong>🗣️ লেখা মূল্যায়ন (${toBnNum(score)}%):</strong>
      <div style="margin-top:4px;">${summary}</div>
    `;
    playAudioSequence(voiceClips);
  }

  document.getElementById("traceEvalBtn").addEventListener("click", evaluateHandwriting);

  // Animated Slow Handwriting Stroke Guide
  const traceDemoCanvas = document.getElementById("traceDemoCanvas");
  const traceDemoCtx = traceDemoCanvas.getContext("2d");
  const traceSpeedBtn = document.getElementById("traceSpeedBtn");

  traceSpeedBtn.addEventListener("click", () => {
    traceDemoSpeed = traceDemoSpeed === 0.5 ? 1.0 : 0.5;
    traceSpeedBtn.textContent = traceDemoSpeed === 0.5 ? "গতি: ০.৫x" : "গতি: ১.০x";
  });

  function stopTraceAnimation() {
    if (traceDemoRaf) cancelAnimationFrame(traceDemoRaf);
    traceDemoRaf = null;
  }

  function animateLetterStroke() {
    stopTraceAnimation();
    const l = LETTERS[traceIndex];
    const { w, h } = syncTraceCanvasSizes();
    const strokeData = window.ARABIC_STROKES && window.ARABIC_STROKES[l.id];
    if (!strokeData) return;

    const sampledStrokes = strokeData.strokes.map((s) => sampleSvgPath(s, w, h));
    const segments = [];
    sampledStrokes.forEach((pts) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        segments.push({ x1: pts[i][0], y1: pts[i][1], x2: pts[i + 1][0], y2: pts[i + 1][1], len, startNew: i === 0 });
      }
    });

    const totalLen = segments.reduce((acc, s) => acc + s.len, 0) || 1;
    const dotStepLen = 45; // pause/reveal length per dot after main strokes
    const grandTotal = totalLen + strokeData.dots.length * dotStepLen;
    const speedPxPerSec = traceDemoSpeed === 0.5 ? 110 : 230;
    let progress = 2;
    let lastTs = null;

    const step = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      progress = Math.min(grandTotal, progress + dt * speedPxPerSec);

      drawTraceWatermark();
      traceDemoCtx.save();
      traceDemoCtx.lineWidth = 10;
      traceDemoCtx.lineCap = "round";
      traceDemoCtx.lineJoin = "round";
      traceDemoCtx.strokeStyle = "#d97706";

      let remaining = Math.min(progress, totalLen);
      let penX = null;
      let penY = null;

      traceDemoCtx.beginPath();
      for (const seg of segments) {
        if (remaining <= 0) break;
        if (seg.startNew) traceDemoCtx.moveTo(seg.x1, seg.y1);
        if (remaining >= seg.len) {
          traceDemoCtx.lineTo(seg.x2, seg.y2);
          penX = seg.x2;
          penY = seg.y2;
          remaining -= seg.len;
        } else {
          const r = remaining / seg.len;
          penX = seg.x1 + (seg.x2 - seg.x1) * r;
          penY = seg.y1 + (seg.y2 - seg.y1) * r;
          traceDemoCtx.lineTo(penX, penY);
          remaining = 0;
        }
      }
      traceDemoCtx.stroke();

      // Reveal dots one by one after main strokes finish
      if (progress > totalLen) {
        const dotProgress = progress - totalLen;
        strokeData.dots.forEach(([dx, dy], idx) => {
          const threshold = idx * dotStepLen + 10;
          if (dotProgress >= threshold) {
            traceDemoCtx.fillStyle = "#d97706";
            traceDemoCtx.beginPath();
            traceDemoCtx.arc(dx * w, dy * h, 7, 0, Math.PI * 2);
            traceDemoCtx.fill();
            penX = dx * w;
            penY = dy * h;
          }
        });
      }

      if (progress < grandTotal && penX !== null) {
        traceDemoCtx.fillStyle = "#0f5132";
        traceDemoCtx.strokeStyle = "#fde68a";
        traceDemoCtx.lineWidth = 3;
        traceDemoCtx.beginPath();
        traceDemoCtx.arc(penX, penY, 7, 0, Math.PI * 2);
        traceDemoCtx.fill();
        traceDemoCtx.stroke();
        traceDemoCtx.restore();
        traceDemoRaf = requestAnimationFrame(step);
      } else {
        traceDemoCtx.restore();
      }
    };

    traceDemoRaf = requestAnimationFrame(step);
  }

  document.getElementById("traceAnimateBtn").addEventListener("click", () => {
    playLetter(LETTERS[traceIndex]);
    animateLetterStroke();
  });

  // Mastery Heatmap & Completion Badge
  function renderHeatmap() {
    const grid = document.getElementById("heatmapGrid");
    const badgeBox = document.getElementById("completionBadgeBox");
    if (!grid) return;
    grid.innerHTML = "";

    let masteredCount = 0;
    const pool = LETTERS.filter((l) => l.id !== "yaa_maqsura");
    pool.forEach((l) => {
      const m = masteryMap[l.id] || { ok: 0, total: 0 };
      const pct = m.total > 0 ? Math.round((m.ok / m.total) * 100) : null;
      let cls = "";
      if (pct !== null) {
        if (pct >= 80) {
          cls = "heat-high";
          masteredCount += 1;
        } else if (pct >= 50) cls = "heat-mid";
        else cls = "heat-low";
      }

      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `heat-cell ${cls}`;
      cell.innerHTML = `<span class="ar">${l.char}</span><span class="pct">${pct !== null ? toBnNum(pct) + "%" : "—"}</span>`;
      cell.addEventListener("click", () => playLetter(l));
      grid.appendChild(cell);
    });

    const pctAll = Math.round((learnedSet.size / LETTERS.length) * 100);
    badgeBox.innerHTML =
      masteredCount >= 20 || learnedSet.size >= 29
        ? `<div style="font-size:2rem;">🏅</div><strong>মাশাআল্লাহ! আপনি ${toBnNum(learnedSet.size)}টি হরফ অনুশীলন ও ${toBnNum(masteredCount)}টি হরফে ৮০%+ দক্ষতা অর্জন করেছেন!</strong>`
        : `<div>অগ্রগতি: <strong>${toBnNum(pctAll)}%</strong> (${toBnNum(masteredCount)}/${toBnNum(pool.length)} হরফে ৮০%+ দক্ষতা)। সব হরফ আয়ত্ত করলে সাফল্যের ব্যাজ আনলক হবে!</div>`;
  }

  document.getElementById("badgeModalBtn").addEventListener("click", renderHeatmap);

  // Smart Quiz
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function updateQuizScoreUI() {
    document.getElementById("quizScore").textContent = toBnNum(quizScore);
    document.getElementById("quizTotal").textContent = toBnNum(quizTotal);
    document.getElementById("quizStreak").textContent = `🔥 ধারাবাহিক: ${toBnNum(quizStreak)}`;
  }

  // Timed 60s Challenge Controls
  const timedHud = document.getElementById("timedHud");
  const timedClockEl = document.getElementById("timedClock");
  const timedBestEl = document.getElementById("timedBest");
  const timedStartBtn = document.getElementById("timedStartBtn");
  timedBestEl.textContent = toBnNum(timedBest);

  function stopTimedChallenge() {
    timedRunning = false;
    clearInterval(timedTimerId);
    timedTimerId = null;
    timedStartBtn.textContent = "আবার শুরু";
  }

  timedStartBtn.addEventListener("click", () => {
    stopTimedChallenge();
    timedRunning = true;
    timedLeft = 60;
    timedScore = 0;
    timedClockEl.textContent = toBnNum(timedLeft);
    timedStartBtn.textContent = "চলছে...";
    generateQuizQuestion(true);
    timedTimerId = setInterval(() => {
      timedLeft -= 1;
      timedClockEl.textContent = toBnNum(Math.max(0, timedLeft));
      if (timedLeft <= 0) {
        stopTimedChallenge();
        if (timedScore > timedBest) {
          timedBest = timedScore;
          localStorage.setItem("madani_timed_best", String(timedBest));
          timedBestEl.textContent = toBnNum(timedBest);
        }
        document.getElementById("quizFeedback").style.color = "var(--primary)";
        document.getElementById("quizFeedback").textContent = `⏱️ সময় শেষ! ৬০ সেকেন্ডে আপনার স্কোর: ${toBnNum(timedScore)} (সর্বোচ্চ: ${toBnNum(timedBest)})`;
      }
    }, 1000);
  });

  function generateQuizQuestion(shouldPlay = true) {
    quizAnswered = false;
    document.getElementById("quizFeedback").textContent = "";
    const basePool = LETTERS.filter((l) => l.id !== "yaa_maqsura");

    timedHud.style.display = quizMode === "timed" ? "flex" : "none";
    if (quizMode !== "timed" && timedRunning) stopTimedChallenge();

    let targetPool = basePool;
    if (quizMode === "weak") {
      const weakLetters = basePool.filter((l) => weakSet.has(l.id));
      if (weakLetters.length === 0) {
        document.getElementById("quizPromptBox").innerHTML =
          `<p style="margin:0; font-weight:600; color:var(--primary);">মাশাআল্লাহ! এই মুহূর্তে আপনার কোনো দুর্বল হরফ নেই। অন্য মোডে অনুশীলন করুন।</p>`;
        document.getElementById("quizOptions").innerHTML = "";
        return;
      }
      targetPool = weakLetters;
    } else if (quizMode === "srs") {
      // Spaced Repetition: sort by lowest accuracy / oldest lastSeen
      const sorted = [...basePool].sort((a, b) => {
        const ma = masteryMap[a.id] || { ok: 0, total: 0, lastSeen: 0 };
        const mb = masteryMap[b.id] || { ok: 0, total: 0, lastSeen: 0 };
        const accA = ma.total ? ma.ok / ma.total : 0;
        const accB = mb.total ? mb.ok / mb.total : 0;
        if (accA !== accB) return accA - accB;
        return (ma.lastSeen || 0) - (mb.lastSeen || 0);
      });
      targetPool = sorted.slice(0, 6);
    }

    const target = targetPool[Math.floor(Math.random() * targetPool.length)];
    const distractors = shuffle(basePool.filter((l) => l.id !== target.id)).slice(0, 3);
    const options = shuffle([target, ...distractors]);

    const promptBox = document.getElementById("quizPromptBox");
    const optionsBox = document.getElementById("quizOptions");
    optionsBox.innerHTML = "";
    optionsBox.classList.toggle("list-mode", quizMode === "makhraj");

    if (quizMode === "audio" || quizMode === "weak" || quizMode === "srs" || quizMode === "timed") {
      const label =
        quizMode === "weak"
          ? "দুর্বল হরফ রিভিশন — "
          : quizMode === "srs"
          ? "স্মার্ট রিভিশন — "
          : quizMode === "timed"
          ? "দ্রুত উত্তর দিন — "
          : "";
      promptBox.innerHTML = `
        <p style="margin:0 0 10px; font-weight:600;">${label}নিচের অডিও শুনে সঠিক হরফটি বাছাই করুন:</p>
        <button class="btn btn-primary" id="quizPlayAudioBtn" type="button" style="font-size:1.05rem; padding:10px 20px;">
          🔊 উচ্চারণ শুনুন
        </button>
      `;
      document.getElementById("quizPlayAudioBtn").addEventListener("click", () => playAudioFile(target.audio));
      if (shouldPlay) playAudioFile(target.audio);

      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt-btn";
        btn.innerHTML = `<span class="ar">${opt.char}</span>`;
        btn.addEventListener("click", () => handleQuizAnswer(btn, opt.id === target.id, target));
        optionsBox.appendChild(btn);
      });
    } else if (quizMode === "harakat") {
      const hPool = basePool.filter((l) => l.id !== "hamzah");
      const hTarget = hPool[Math.floor(Math.random() * hPool.length)];
      const hTypes = [
        { key: "a", name: "যবর", mark: (l) => (l.id === "alif" ? "أَ" : `${l.char}َ`) },
        { key: "i", name: "যের", mark: (l) => (l.id === "alif" ? "إِ" : `${l.char}ِ`) },
        { key: "u", name: "পেশ", mark: (l) => (l.id === "alif" ? "أُ" : `${l.char}ُ`) },
      ];
      const chosen = hTypes[Math.floor(Math.random() * hTypes.length)];
      const hAudio = `audio/h_${hTarget.id}_${chosen.key}.mp3`;

      promptBox.innerHTML = `
        <p style="margin:0 0 10px; font-weight:600;">উচ্চারণ শুনে সঠিক হরকতযুক্ত হরফটি বাছাই করুন:</p>
        <button class="btn btn-primary" id="quizPlayAudioBtn" type="button" style="font-size:1.05rem; padding:10px 20px;">
          🔊 হরকত শুনুন
        </button>
      `;
      document.getElementById("quizPlayAudioBtn").addEventListener("click", () => playAudioFile(hAudio));
      if (shouldPlay) playAudioFile(hAudio);

      const hOptions = shuffle(
        hTypes.map((ht) => ({ label: ht.mark(hTarget), name: `${hTarget.bnName} (${ht.name})`, isRight: ht.key === chosen.key }))
      );
      hOptions.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt-btn";
        btn.innerHTML = `<span class="ar">${opt.label}</span><span style="font-size:0.82rem;">${opt.name}</span>`;
        btn.addEventListener("click", () => handleQuizAnswer(btn, opt.isRight, hTarget));
        optionsBox.appendChild(btn);
      });
    } else if (quizMode === "word") {
      const pool = window.QURAN_WORDS && window.QURAN_WORDS.length ? window.QURAN_WORDS : [];
      const w = pool[Math.floor(Math.random() * pool.length)];
      const posChoices = [
        { key: "firstId", label: "শুরুর (ডানের) হরফ" },
        { key: "midId", label: "মাঝের হরফ" },
        { key: "lastId", label: "শেষের (বামের) হরফ" },
      ];
      const chosenPos = posChoices[Math.floor(Math.random() * posChoices.length)];
      const ansId = w[chosenPos.key];
      const ansLetter = LETTER_BY_ID[ansId];
      const wDistractors = shuffle(basePool.filter((l) => l.id !== ansLetter.id)).slice(0, 3);
      const wOptions = shuffle([ansLetter, ...wDistractors]);

      promptBox.innerHTML = `
        <p style="margin:0 0 6px; font-weight:600;">এই শব্দটির <strong>${chosenPos.label}</strong> কোনটি?</p>
        <div class="ar" style="font-size:3.2rem; color:var(--primary); line-height:1.3;">${w.word}</div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">অর্থ: ${w.bn}</div>
        <button class="btn" id="quizPlayAudioBtn" type="button" style="margin-top:8px; padding:4px 12px; font-size:0.82rem;">🔊 শব্দ শুনুন</button>
      `;
      document.getElementById("quizPlayAudioBtn").addEventListener("click", () => playAudioFile(w.audio));
      if (shouldPlay) playAudioFile(w.audio);

      wOptions.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt-btn";
        btn.innerHTML = `<span class="ar">${opt.char}</span><span>${opt.bnName}</span>`;
        btn.addEventListener("click", () => handleQuizAnswer(btn, opt.id === ansLetter.id, ansLetter));
        optionsBox.appendChild(btn);
      });
    } else if (quizMode === "pairs") {
      const pair = DATA.confusingPairs[Math.floor(Math.random() * DATA.confusingPairs.length)];
      const pLetters = pair.ids.map((id) => LETTER_BY_ID[id]);
      const pTarget = pLetters[Math.floor(Math.random() * pLetters.length)];

      promptBox.innerHTML = `
        <p style="margin:0 0 8px; font-weight:600;">কঠিন জোড়া (${pair.title}) — সঠিক হরফটি চিনুন:</p>
        <button class="btn btn-primary" id="quizPlayAudioBtn" type="button" style="font-size:1.05rem; padding:10px 20px;">
          🔊 উচ্চারণ শুনুন
        </button>
      `;
      document.getElementById("quizPlayAudioBtn").addEventListener("click", () => playAudioFile(pTarget.audio));
      if (shouldPlay) playAudioFile(pTarget.audio);

      shuffle(pLetters).forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt-btn";
        btn.innerHTML = `<span class="ar">${opt.char}</span><span>${opt.bnName}</span>`;
        btn.addEventListener("click", () => handleQuizAnswer(btn, opt.id === pTarget.id, pTarget));
        optionsBox.appendChild(btn);
      });
    } else if (quizMode === "murakkab") {
      const formKeys = ["initial", "medial", "final"];
      const formLabels = { initial: "শুরুর রূপ", medial: "মাঝের রূপ", final: "শেষের রূপ" };
      const chosenKey = formKeys[Math.floor(Math.random() * formKeys.length)];
      promptBox.innerHTML = `
        <p style="margin:0 0 6px; font-weight:600;">এই মিলিত (${formLabels[chosenKey]}) হরফটি কোন বর্ণ?</p>
        <div class="ar" style="font-size:3.5rem; color:var(--primary); line-height:1.3;">${target.forms[chosenKey]}</div>
      `;
      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt-btn";
        btn.innerHTML = `<span class="ar">${opt.char}</span><span>${opt.bnName}</span>`;
        btn.addEventListener("click", () => handleQuizAnswer(btn, opt.id === target.id, target));
        optionsBox.appendChild(btn);
      });
    } else {
      const correctM = DATA.makhrajList.find((m) => m.num === target.makhrajIds[0]);
      const otherMs = shuffle(DATA.makhrajList.filter((m) => m.num !== correctM.num)).slice(0, 3);
      const mOptions = shuffle([correctM, ...otherMs]);

      promptBox.innerHTML = `
        <p style="margin:0 0 6px; font-weight:600;">এই হরফটির মাখরাজ কোনটি?</p>
        <div class="ar" style="font-size:3.4rem; color:var(--primary); line-height:1.3;">${target.char}</div>
        <div style="font-weight:600;">${target.bnName}</div>
      `;
      if (shouldPlay) playAudioFile(target.audio);

      mOptions.forEach((mOpt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt-btn";
        btn.style.fontSize = "0.9rem";
        btn.innerHTML = `<strong>মাখরাজ ${toBnNum(mOpt.num)} (${mOpt.regionBn})</strong><br><span style="font-weight:400;">${mOpt.title}</span>`;
        btn.addEventListener("click", () => handleQuizAnswer(btn, mOpt.num === correctM.num, target, correctM));
        optionsBox.appendChild(btn);
      });
    }
  }

  function handleQuizAnswer(clickedBtn, isCorrect, target, correctMakhraj) {
    if (quizAnswered) return;
    quizAnswered = true;
    quizTotal += 1;
    updateStreakUI(true);

    const feedback = document.getElementById("quizFeedback");
    document.querySelectorAll(".quiz-opt-btn").forEach((b) => (b.disabled = true));

    // Update per-letter Mastery Heatmap & SRS stats
    const prevM = masteryMap[target.id] || { ok: 0, total: 0, lastSeen: 0 };
    masteryMap[target.id] = {
      ok: prevM.ok + (isCorrect ? 1 : 0),
      total: prevM.total + 1,
      lastSeen: Date.now(),
    };
    localStorage.setItem("madani_mastery", JSON.stringify(masteryMap));
    renderHeatmap();

    if (isCorrect) {
      quizScore += 1;
      quizStreak += 1;
      if (timedRunning) timedScore += 1;
      clickedBtn.classList.add("correct");
      feedback.style.color = "var(--primary)";
      feedback.textContent = `মাশাআল্লাহ! সঠিক উত্তর — ${target.bnName} (${target.char})`;
      playFeedbackTone(true);
      triggerHaptic(20);
      if ((quizMode === "weak" || quizMode === "srs") && weakSet.has(target.id)) {
        weakSet.delete(target.id);
      }
      if (timedRunning && timedLeft > 0) {
        setTimeout(() => { if (timedRunning) generateQuizQuestion(true); }, 550);
      }
    } else {
      quizStreak = 0;
      clickedBtn.classList.add("wrong");
      feedback.style.color = "var(--danger)";
      feedback.textContent = correctMakhraj
        ? `ভুল হয়েছে। সঠিক উত্তর: মাখরাজ ${toBnNum(correctMakhraj.num)} — ${correctMakhraj.title}`
        : `ভুল হয়েছে। সঠিক উত্তর: ${target.bnName} (${target.char})`;
      playFeedbackTone(false);
      triggerHaptic([35, 30, 35]);
      weakSet.add(target.id);
      if (timedRunning && timedLeft > 0) {
        setTimeout(() => { if (timedRunning) generateQuizQuestion(true); }, 950);
      }
    }

    localStorage.setItem("madani_weak", JSON.stringify([...weakSet]));
    updateWeakBtnUI();
    playAudioFile(target.audio);
    updateQuizScoreUI();
  }

  document.querySelectorAll(".quiz-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".quiz-mode-btn").forEach((b) => b.classList.remove("btn-primary", "active"));
      btn.classList.add("btn-primary", "active");
      quizMode = btn.dataset.mode;
      generateQuizQuestion();
    });
  });

  document.getElementById("nextQuizBtn").addEventListener("click", generateQuizQuestion);
  document.getElementById("clearWeakBtn").addEventListener("click", () => {
    weakSet.clear();
    localStorage.removeItem("madani_weak");
    updateWeakBtnUI();
    if (quizMode === "weak") generateQuizQuestion();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!document.getElementById("panel-alphabet").classList.contains("active")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      selectLetter(selectedIndex + 1, true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      selectLetter(selectedIndex - 1, true);
    } else if (e.key === " ") {
      e.preventDefault();
      const card = document.querySelectorAll("#alphabetGrid .letter-card")[selectedIndex];
      playLetter(LETTERS[selectedIndex], card);
    }
  });

  // Mobile Swipe Gestures on Inspector Sheet (Down to close, Left/Right to navigate)
  let touchStartX = 0;
  let touchStartY = 0;
  inspectorEl.addEventListener("touchstart", (e) => {
    if (!e.touches.length) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  inspectorEl.addEventListener("touchend", (e) => {
    if (!e.changedTouches.length || window.innerWidth > 980) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (dy > 75 && Math.abs(dy) > Math.abs(dx) * 1.4 && inspectorEl.scrollTop <= 0) {
      closeMobileSheet();
    } else if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      stopAutoPlay();
      selectLetter(dx < 0 ? selectedIndex + 1 : selectedIndex - 1, true);
    }
  }, { passive: true });

  // Force Update App (keeps all localStorage progress & practice data intact)
  const forceUpdateBtn = document.getElementById("forceUpdateAppBtn");
  const updateCheckStatus = document.getElementById("updateCheckStatus");
  if (forceUpdateBtn) {
    forceUpdateBtn.addEventListener("click", async () => {
      updateCheckStatus.style.display = "block";
      if (!navigator.onLine) {
        updateCheckStatus.textContent = "আপনি এখন অফলাইনে আছেন। ইন্টারনেট সংযোগ দিয়ে আবার চেষ্টা করুন।";
        return;
      }
      updateCheckStatus.textContent = "আপডেট চেক করা হচ্ছে... আপনার সব ডেটা সুরক্ষিত আছে।";
      forceUpdateBtn.disabled = true;
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.update().catch(() => {})));
        }
      } catch {}
      window.location.reload();
    });
  }

  // Register Service Worker & show non-intrusive update toast when a new version activates
  const updateToast = document.getElementById("updateToast");
  document.getElementById("reloadAppBtn").addEventListener("click", () => window.location.reload());

  if ("serviceWorker" in navigator && (location.protocol === "http:" || location.protocol === "https:")) {
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController) {
        updateToast.classList.add("show");
      }
      hadController = true;
    });
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((reg) => {
      reg.update().catch(() => {});
    }).catch(() => {});
  }

  let deferredInstallPrompt = null;
  const installAppBtn = document.getElementById("installAppBtn");
  const installAppRow = document.getElementById("installAppRow");
  const installBanner = document.getElementById("installBanner");
  const installBannerSub = document.getElementById("installBannerSub");
  const bannerInstallBtn = document.getElementById("bannerInstallBtn");
  const bannerDismissBtn = document.getElementById("bannerDismissBtn");

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  async function triggerPwaInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (installAppRow) installAppRow.style.display = "none";
      if (installBanner) installBanner.classList.remove("show");
    } else if (isIos) {
      installBannerSub.textContent = "Safari-এর নিচে Share (⬆️) আইকনে ট্যাপ করে 'Add to Home Screen' সিলেক্ট করুন।";
      bannerInstallBtn.style.display = "none";
    }
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installAppRow) installAppRow.style.display = "flex";
    if (!isStandalone && !sessionStorage.getItem("madani_install_dismissed")) {
      installBanner.classList.add("show");
    }
  });

  if (isIos && !isStandalone && !sessionStorage.getItem("madani_install_dismissed")) {
    installBannerSub.textContent = "Safari-এ Share (⬆️) → 'Add to Home Screen' দিয়ে ইনস্টল করুন";
    bannerInstallBtn.style.display = "none";
    setTimeout(() => installBanner.classList.add("show"), 1200);
  }

  installAppBtn.addEventListener("click", triggerPwaInstall);
  bannerInstallBtn.addEventListener("click", triggerPwaInstall);
  bannerDismissBtn.addEventListener("click", () => {
    installBanner.classList.remove("show");
    sessionStorage.setItem("madani_install_dismissed", "1");
  });

  window.addEventListener("appinstalled", () => {
    if (installAppRow) installAppRow.style.display = "none";
    if (installBanner) installBanner.classList.remove("show");
  });

  // Interactive Spotlight Coachmark App Tour
  const TOUR_STEPS = [
    {
      selector: "#alphabetGrid .letter-card",
      tab: "alphabet",
      title: "২৯টি আরবি হরফ",
      desc: "যেকোনো হরফে ক্লিক করলে মাদানী কায়দা অনুযায়ী উচ্চারণ, ৪টি রূপ ও নিজ কণ্ঠ রেকর্ড করার অপশন পাবেন।",
    },
    {
      selector: "#autoPlayBtn",
      tab: "alphabet",
      title: "ধারাবাহিক ও লুপ প্লে",
      desc: "এখানে ক্লিক করে সবগুলো হরফ একটানা শুনুন, অথবা পাশে থাকা 'লুপ' বাটনে হ্যান্ডস-ফ্রি রিভিশন দিন।",
    },
    {
      selector: '[data-tab="writing"]',
      tab: "alphabet",
      title: "✍️ হাতে লেখা ও ৮ ভাগ",
      desc: "মাদানী কায়দার ৮ ভাগ, নুকতা পরিচয়, অ্যানিমেটেড ক্যালিগ্রাফি লেখা এবং বাংলা ভয়েস মূল্যায়ন—সব এখানে পাবেন।",
    },
    {
      selector: '[data-tab="murakkab"]',
      tab: "alphabet",
      title: "মুরাক্কাব (শব্দের রূপ)",
      desc: "বাক্যের শুরু, মাঝ ও শেষে হরফ কীভাবে মিলে লেখা হয়, শব্দ ভেঙে পড়া ও বইয়ের ২৮ ঘরের পরীক্ষা এখানে আছে।",
    },
    {
      selector: '[data-tab="harakat"]',
      tab: "alphabet",
      title: "হরকত, তানবীন, মাদ ও ছোট সূরা",
      desc: "যবর-যের-পেশ, তানবীন, কলকলাহ ও সূরা আল-ফাতিহা/ইখলাস/আসরের প্রতিটি শব্দ আলাদাভাবে শুনে শিখুন।",
    },
    {
      selector: '[data-tab="makhraj"]',
      tab: "alphabet",
      title: "১৭টি মাখরাজ ও বাগযন্ত্রের চিত্র",
      desc: "কোন হরফ গলা, জিহ্বা বা ঠোঁটের কোন জায়গা থেকে উচ্চারিত হয় তা সচিত্র দেখে অনুশীলন করুন।",
    },
    {
      selector: '[data-tab="quiz"]',
      tab: "alphabet",
      title: "অনুশীলন, পরীক্ষা ও রিপোর্ট",
      desc: "৯ ধরনের কুইজ (৬০সে স্পিড চ্যালেঞ্জ, স্মার্ট রিভিশন), একই রকম হরফের পার্থক্য ও Mastery Heatmap এখানে।",
    },
    {
      selector: "#focusToggleBtn",
      tab: "alphabet",
      title: "🎯 মনোযোগ মোড (Focus Mode)",
      desc: "উপরের 🎯 আইকনে ট্যাপ করলে দোয়া ও বাড়তি লেখা লুকিয়ে যাবে—যাতে কেবল হরফ ও অডিওতে পুরো মনোযোগ দিতে পারেন।",
    },
    {
      selector: "#settingsBtn",
      tab: "alphabet",
      title: "⚙️ সেটিংস, অ্যাপ ইনস্টল ও আপডেট",
      desc: "সেটিংসের ভেতর থেকেই অফলাইনে ব্যবহারের জন্য অ্যাপ 📲 ইনস্টল, অগ্রগতি না হারিয়ে 🔄 আপডেট, ডার্ক মোড, ফন্ট সাইজ ও ব্যাকআপ নিয়ন্ত্রণ করতে পারবেন।",
    },
  ];

  let tourStep = 0;
  const tourModal = document.getElementById("tourModal");
  const tourSpotlight = document.getElementById("tourSpotlight");
  const tourTitle = document.getElementById("tourTitle");
  const tourBody = document.getElementById("tourBody");
  const tourStepBadge = document.getElementById("tourStepBadge");
  const tourDots = document.getElementById("tourDots");
  const tourPrevBtn = document.getElementById("tourPrevBtn");
  const tourNextBtn = document.getElementById("tourNextBtn");

  function findVisibleTarget(selector) {
    const els = document.querySelectorAll(selector);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return el;
    }
    return null;
  }

  function positionTourStep() {
    const s = TOUR_STEPS[tourStep];
    if (s.tab) switchTab(s.tab);

    tourTitle.textContent = s.title;
    tourBody.textContent = s.desc;
    tourStepBadge.textContent = `${toBnNum(tourStep + 1)} / ${toBnNum(TOUR_STEPS.length)}`;
    tourDots.innerHTML = TOUR_STEPS.map((_, i) => `<span class="tour-dot ${i === tourStep ? "active" : ""}"></span>`).join("");
    tourPrevBtn.disabled = tourStep === 0;
    tourNextBtn.textContent = tourStep === TOUR_STEPS.length - 1 ? "✓" : ">";

    const target = findVisibleTarget(s.selector);
    if (!target) return;

    const r = target.getBoundingClientRect();
    const pad = 5;
    tourSpotlight.style.left = `${Math.max(2, r.left - pad)}px`;
    tourSpotlight.style.top = `${Math.max(2, r.top - pad)}px`;
    tourSpotlight.style.width = `${r.width + pad * 2}px`;
    tourSpotlight.style.height = `${r.height + pad * 2}px`;

    // Position tooltip below or above target cleanly inside viewport
    const tipW = Math.min(window.innerWidth * 0.92, 350);
    const tipH = tourModal.offsetHeight || 175;
    let top = r.bottom + 14;
    if (top + tipH > window.innerHeight - 16) {
      top = Math.max(12, r.top - tipH - 14);
    }
    let left = r.left + r.width / 2 - tipW / 2;
    left = Math.max(12, Math.min(window.innerWidth - tipW - 12, left));

    tourModal.style.top = `${top}px`;
    tourModal.style.left = `${left}px`;
  }

  function openTour() {
    tourStep = 0;
    tourSpotlight.classList.add("open");
    tourModal.classList.add("open");
    positionTourStep();
  }

  function closeTour() {
    tourSpotlight.classList.remove("open");
    tourModal.classList.remove("open");
    localStorage.setItem("madani_tour_seen", "1");
  }

  document.getElementById("openTourFromSettingsBtn").addEventListener("click", () => {
    closeSettings();
    openTour();
  });
  document.getElementById("tourCloseBtn").addEventListener("click", closeTour);
  tourPrevBtn.addEventListener("click", () => {
    if (tourStep > 0) {
      tourStep -= 1;
      positionTourStep();
    }
  });
  tourNextBtn.addEventListener("click", () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      tourStep += 1;
      positionTourStep();
    } else {
      closeTour();
    }
  });
  window.addEventListener("resize", () => {
    if (tourModal.classList.contains("open")) positionTourStep();
  });

  // Initial render (shouldPlay = false so page reload never auto-plays audio)
  applySettings();
  updateStreakUI(false);
  updateProgressUI();
  updateWeakBtnUI();
  renderAlphabetGrid();
  selectLetter(0, false);
  renderMurakkabTable("all");
  renderWordBreakdowns();
  renderMurakkabExam();
  renderHarakatTab();
  renderMakhrajList("all");
  renderConfusingPairs();
  renderHeatmap();
  renderWritingGroupsAndNuqta();
  updateTraceLetter(false);
  generateQuizQuestion(false);

  // Restore last active tab & sub-tabs after reload
  const savedWritingSubtab = localStorage.getItem("madani_writing_subtab");
  if (savedWritingSubtab) switchWritingSubtab(savedWritingSubtab);
  const savedHarakatSubtab = localStorage.getItem("madani_harakat_subtab");
  if (savedHarakatSubtab) {
    const hBtn = document.querySelector(`.harakat-subtab-btn[data-hview="${savedHarakatSubtab}"]`);
    if (hBtn) hBtn.click();
  }
  let savedPracticeSubtab = localStorage.getItem("madani_practice_subtab");
  if (savedPracticeSubtab === "trace-view") savedPracticeSubtab = "quiz-view";
  if (savedPracticeSubtab) switchPracticeSubtab(savedPracticeSubtab);
  const savedTab = localStorage.getItem("madani_active_tab");
  if (savedTab && document.getElementById(`panel-${savedTab}`)) {
    switchTab(savedTab);
  }

  if (!localStorage.getItem("madani_tour_seen")) {
    setTimeout(openTour, 450);
  }
})();
