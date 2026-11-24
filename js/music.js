/**
 * Background Music Controller
 * - If config.music.mp3Url is set, plays that MP3 file in a loop.
 * - Otherwise, plays a gentle, warm Web Audio API piano/chime arpeggio
 *   in D Major so the button works gracefully offline with zero broken links.
 */
window.MusicController = (function () {
  let isPlaying = false;
  let audioEl = null;
  let audioCtx = null;
  let masterGain = null;
  let loopTimer = null;
  let noteStep = 0;

  // Warm celebratory chord arpeggio (Dmaj9 -> Bm7 -> Gmaj7 -> A6)
  const MELODY_HZ = [
    293.66, 369.99, 440.0, 554.37, 587.33, 440.0,
    246.94, 369.99, 440.0, 493.88, 587.33, 440.0,
    196.0, 293.66, 369.99, 493.88, 587.33, 493.88,
    220.0, 329.63, 440.0, 554.37, 659.25, 440.0,
  ];

  function getConfig() {
    return (window.INVITATION_CONFIG && window.INVITATION_CONFIG.music) || {};
  }

  function playPianoNote(freq) {
    if (!audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const overtone = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = "sine";
    overtone.frequency.setValueAtTime(freq * 2, now);

    const overtoneGain = audioCtx.createGain();
    overtoneGain.gain.setValueAtTime(0.14, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.3);

    osc.connect(noteGain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 2.4);
    overtone.stop(now + 2.4);
  }

  function startSynth() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      const vol = typeof getConfig().volume === "number" ? getConfig().volume : 0.35;
      masterGain.gain.setValueAtTime(vol * 0.45, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    playPianoNote(MELODY_HZ[noteStep % MELODY_HZ.length]);
    noteStep += 1;

    loopTimer = window.setInterval(() => {
      if (!isPlaying) return;
      playPianoNote(MELODY_HZ[noteStep % MELODY_HZ.length]);
      noteStep += 1;
    }, 680);

    return true;
  }

  function stopSynth() {
    if (loopTimer) {
      clearInterval(loopTimer);
      loopTimer = null;
    }
  }

  function play() {
    if (isPlaying) return true;
    const cfg = getConfig();

    if (cfg.mp3Url) {
      if (!audioEl) {
        audioEl = new Audio(cfg.mp3Url);
        audioEl.loop = true;
        audioEl.volume = typeof cfg.volume === "number" ? cfg.volume : 0.35;
      }
      audioEl
        .play()
        .then(() => {
          isPlaying = true;
          notify();
        })
        .catch(() => {
          isPlaying = false;
          notify();
        });
      isPlaying = true;
      notify();
      return true;
    }

    const ok = startSynth();
    isPlaying = ok;
    notify();
    return ok;
  }

  function pause() {
    if (!isPlaying) return;
    if (audioEl) {
      audioEl.pause();
    }
    stopSynth();
    isPlaying = false;
    notify();
  }

  function toggle() {
    if (isPlaying) pause();
    else play();
    return isPlaying;
  }

  const listeners = [];
  function onChange(fn) {
    listeners.push(fn);
  }
  function notify() {
    listeners.forEach((fn) => fn(isPlaying));
  }

  return {
    play,
    pause,
    toggle,
    onChange,
    get playing() {
      return isPlaying;
    },
  };
})();
