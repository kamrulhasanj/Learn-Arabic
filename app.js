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

  // Tracing state
  let traceIndex = 0;

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

    document.getElementById("streakPill").textContent =
      `🔥 ${toBnNum(streak)} • ${toBnNum(todayCount)}/১০`;
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
    document.getElementById("weakModeBtn").textContent = `⚠️ দুর্বল হরফ (${toBnNum(weakSet.size)})`;
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
    fontScale: 1.0,
  };
  let settings = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("madani_settings") || "{}") };

  const themeBtn = document.getElementById("themeBtn");
  const setFocusToggle = document.getElementById("setFocusToggle");
  const setDarkToggle = document.getElementById("setDarkToggle");
  const setBnNamesToggle = document.getElementById("setBnNamesToggle");
  const setMakhrajBadgeToggle = document.getElementById("setMakhrajBadgeToggle");
  const setAutoStopToggle = document.getElementById("setAutoStopToggle");
  const setSoundFxToggle = document.getElementById("setSoundFxToggle");
  const setHapticToggle = document.getElementById("setHapticToggle");
  const setFontScale = document.getElementById("setFontScale");
  const fontScaleLabel = document.getElementById("fontScaleLabel");

  function applySettings() {
    localStorage.setItem("madani_settings", JSON.stringify(settings));
    document.body.classList.toggle("focus-mode", settings.focusMode);
    document.body.classList.toggle("hide-bn-names", !settings.showBnNames);
    document.body.classList.toggle("hide-makhraj-badges", !settings.showMakhrajBadges);
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
  document.getElementById("focusExitBtn").addEventListener("click", () => {
    settings.focusMode = false;
    applySettings();
  });

  setFocusToggle.addEventListener("change", () => { settings.focusMode = setFocusToggle.checked; applySettings(); });
  setDarkToggle.addEventListener("change", () => { settings.darkTheme = setDarkToggle.checked; applySettings(); });
  setBnNamesToggle.addEventListener("change", () => { settings.showBnNames = setBnNamesToggle.checked; applySettings(); });
  setMakhrajBadgeToggle.addEventListener("change", () => { settings.showMakhrajBadges = setMakhrajBadgeToggle.checked; applySettings(); });
  setAutoStopToggle.addEventListener("change", () => { settings.autoStopRecorder = setAutoStopToggle.checked; applySettings(); });
  setSoundFxToggle.addEventListener("change", () => { settings.soundFx = setSoundFxToggle.checked; applySettings(); });
  setHapticToggle.addEventListener("change", () => { settings.haptic = setHapticToggle.checked; applySettings(); });
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
    closeMobileSheet();
    document.querySelectorAll(".tab-btn, .bottom-nav-btn").forEach((btn) => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${tabName}`);
    });
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
        বাক্যে হরফের ৪টি রূপ (ডান থেকে বামে):
      </div>
      <div class="forms-strip">
        <div class="form-box">
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
              <div class="ar" style="font-size:1.65rem; line-height:1.2;">${p.form}</div>
              <div style="font-size:0.72rem; color:var(--primary); font-weight:600;">${l.bnName}</div>
            </button>
          `;
        })
        .join("");

      card.innerHTML = `
        <button type="button" class="btn btn-primary play-word-btn" style="font-size:1.8rem; padding:4px 18px; font-family:var(--font-ar);">
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
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${l.bnName}</strong>
          <span class="ar" style="font-size:1.35rem; color:var(--primary);">${l.char}</span>
        </div>
        <div class="harakat-row">
          <button type="button" class="harakat-pill" data-audio="audio/h_${l.id}_a.mp3">
            <span class="ar">${baseA}</span>
            <span>যবর</span>
          </button>
          <button type="button" class="harakat-pill" data-audio="audio/h_${l.id}_i.mp3">
            <span class="ar">${baseI}</span>
            <span>যের</span>
          </button>
          <button type="button" class="harakat-pill" data-audio="audio/h_${l.id}_u.mp3">
            <span class="ar">${baseU}</span>
            <span>পেশ</span>
          </button>
        </div>
      `;
      card.querySelectorAll(".harakat-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          updateStreakUI(true);
          playAudioFile(pill.dataset.audio);
        });
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
              <button type="button" class="surah-word" data-audio="${w.audio}">
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

  // TAB 5: Practice Sub-views (Quiz, Confusing Pairs, Tracing)
  document.querySelectorAll(".practice-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".practice-view-btn").forEach((b) => b.classList.remove("btn-primary", "active"));
      btn.classList.add("btn-primary", "active");
      document.querySelectorAll(".practice-subview").forEach((v) => {
        v.style.display = v.id === btn.dataset.view ? "block" : "none";
      });
    });
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

  function updateTraceLetter(play = false) {
    const l = LETTERS[traceIndex];
    document.getElementById("traceGuide").textContent = l.char;
    document.getElementById("traceLetterLabel").textContent = `${l.bnName} (${l.char})`;
    clearTraceCanvas();
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

  document.getElementById("tracePrevBtn").addEventListener("click", () => {
    traceIndex = (traceIndex - 1 + LETTERS.length) % LETTERS.length;
    updateTraceLetter(true);
  });
  document.getElementById("traceNextBtn").addEventListener("click", () => {
    traceIndex = (traceIndex + 1) % LETTERS.length;
    updateTraceLetter(true);
  });
  document.getElementById("tracePlayBtn").addEventListener("click", () => playLetter(LETTERS[traceIndex]));
  document.getElementById("traceClearBtn").addEventListener("click", clearTraceCanvas);

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
    document.getElementById("quizStreak").textContent = `ধারাবাহিক সঠিক: ${toBnNum(quizStreak)}`;
  }

  function generateQuizQuestion(shouldPlay = true) {
    quizAnswered = false;
    document.getElementById("quizFeedback").textContent = "";
    const basePool = LETTERS.filter((l) => l.id !== "yaa_maqsura");

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
    }

    const target = targetPool[Math.floor(Math.random() * targetPool.length)];
    const distractors = shuffle(basePool.filter((l) => l.id !== target.id)).slice(0, 3);
    const options = shuffle([target, ...distractors]);

    const promptBox = document.getElementById("quizPromptBox");
    const optionsBox = document.getElementById("quizOptions");
    optionsBox.innerHTML = "";

    if (quizMode === "audio" || quizMode === "weak") {
      promptBox.innerHTML = `
        <p style="margin:0 0 10px; font-weight:600;">${quizMode === "weak" ? "দুর্বল হরফ রিভিশন — " : ""}নিচের অডিও শুনে সঠিক হরফটি বাছাই করুন:</p>
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

    if (isCorrect) {
      quizScore += 1;
      quizStreak += 1;
      clickedBtn.classList.add("correct");
      feedback.style.color = "var(--primary)";
      feedback.textContent = `মাশাআল্লাহ! সঠিক উত্তর — ${target.bnName} (${target.char})`;
      playFeedbackTone(true);
      triggerHaptic(20);
      if (quizMode === "weak" && weakSet.has(target.id)) {
        weakSet.delete(target.id);
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
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installAppBtn.style.display = "inline-flex";
  });
  installAppBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installAppBtn.style.display = "none";
  });
  window.addEventListener("appinstalled", () => {
    installAppBtn.style.display = "none";
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
  updateTraceLetter(false);
  generateQuizQuestion(false);
})();
