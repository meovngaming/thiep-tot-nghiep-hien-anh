/**
 * Background Music Controller – "Nụ Cười 18 20" (Doãn Hiếu)
 * - If `config.music.mp3Url` is set, plays that MP3 file in a loop.
 * - Otherwise, synthesizes a warm, expressive Piano & Guitar Ballad rendition
 *   of "Nụ Cười 18 20" (Chorus & Verse in C Major: C - G/B - Am7 - Em7 - Fmaj7 - Em7 - Am7 - Dm7 - G7)
 *   using the Web Audio API with zero external network dependencies.
 */
window.MusicController = (function () {
  let isPlaying = false;
  let audioEl = null;
  let audioCtx = null;
  let masterGain = null;
  let stepTimer = null;
  let eighthIndex = 0;

  // Pitch table (Hz) in C Major
  const N = {
    E2: 82.41,
    F2: 87.31,
    G2: 98.0,
    A2: 110.0,
    B2: 123.47,
    C3: 130.81,
    D3: 146.83,
    E3: 164.81,
    F3: 174.61,
    G3: 196.0,
    A3: 220.0,
    B3: 246.94,
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.0,
  };

  /**
   * "Nụ Cười 18 20" – Doãn Hiếu (64 eighth-note steps = 8 bars chorus loop)
   * Each entry at step `s` can trigger:
   * - `m`: lead vocal melody note (Hz) & `d`: duration in seconds
   * - `b`: left-hand bass/arpeggio accompaniment note (Hz)
   */
  const SCORE = [
    // Bar 1 (C): "Những tháng ngày năm đó ta đã..."
    { m: N.E5, d: 0.7, b: N.C3 },
    { m: N.D5, d: 0.35, b: N.G3 },
    { m: N.C5, d: 0.45, b: N.C4 },
    { m: N.D5, d: 0.45, b: N.E4 },
    { m: N.E5, d: 0.65, b: N.G3 },
    { m: N.E5, d: 0.35, b: N.C4 },
    { m: N.E5, d: 0.45, b: N.E4 },
    { m: N.C5, d: 0.5, b: N.G3 },

    // Bar 2 (G/B): "...cười thật tươi"
    { m: N.G4, d: 0.75, b: N.B2 },
    { b: N.D3 },
    { m: N.D5, d: 1.9, b: N.G3 },
    { b: N.D4 },
    { b: N.G3 },
    { b: N.D4 },
    { b: N.B3 },
    { m: N.D5, d: 0.4, b: N.G3 },

    // Bar 3 (Am7): "Mười tám đôi mươi những nụ..."
    { m: N.E5, d: 0.5, b: N.A2 },
    { m: N.D5, d: 0.45, b: N.E3 },
    { m: N.C5, d: 0.65, b: N.A3 },
    { m: N.B4, d: 0.38, b: N.C4 },
    { m: N.C5, d: 0.65, b: N.E3 },
    { m: N.C5, d: 0.45, b: N.A3 },
    { m: N.D5, d: 0.55, b: N.C4 },
    { b: N.E3 },

    // Bar 4 (Em7): "...cười đẹp nhất đời"
    { m: N.G4, d: 2.1, b: N.E2 },
    { b: N.B2 },
    { b: N.E3 },
    { b: N.G3 },
    { b: N.B3 },
    { b: N.G3 },
    { m: N.A4, d: 0.45, b: N.E3 },
    { m: N.G4, d: 0.4, b: N.B2 },

    // Bar 5 (Fmaj7 -> Em7 -> Am7): "Dẫu gian khó, dẫu phong ba"
    { m: N.A4, d: 0.85, b: N.F2 },
    { b: N.C3 },
    { m: N.A4, d: 0.55, b: N.F3 },
    { m: N.C5, d: 0.75, b: N.A3 },
    { m: N.A4, d: 0.65, b: N.E3 },
    { b: N.G3 },
    { m: N.G4, d: 1.0, b: N.A2 },
    { b: N.E3 },

    // Bar 6 (Dm7 -> G7): "Hiên ngang bước, sóng gió sẽ qua"
    { m: N.E4, d: 0.45, b: N.D3 },
    { m: N.E4, d: 0.45, b: N.A3 },
    { m: N.F4, d: 0.65, b: N.D4 },
    { m: N.C5, d: 0.75, b: N.F4 },
    { m: N.C5, d: 0.5, b: N.G2 },
    { m: N.G4, d: 0.5, b: N.D3 },
    { m: N.D5, d: 1.35, b: N.G3 },
    { b: N.B3 },

    // Bar 7 (Fmaj7 -> Em7 -> Am7): "Yêu bầu trời năm ấy cùng ngàn vệt nắng..."
    { m: N.A4, d: 0.45, b: N.F2 },
    { m: N.G4, d: 0.45, b: N.C3 },
    { m: N.A4, d: 0.45, b: N.F3 },
    { m: N.B4, d: 0.45, b: N.A3 },
    { m: N.C5, d: 0.65, b: N.E3 },
    { m: N.E5, d: 0.55, b: N.G3 },
    { m: N.G5, d: 0.65, b: N.A2 },
    { m: N.E5, d: 0.55, b: N.E3 },

    // Bar 8 (Dm7 -> G7 -> Cmaj7): "...Vẫn nhớ bóng dáng đôi mươi, nhớ nụ cười xuân thời"
    { m: N.F5, d: 0.65, b: N.D3 },
    { m: N.E5, d: 0.5, b: N.A3 },
    { m: N.D5, d: 0.65, b: N.D4 },
    { m: N.B4, d: 0.5, b: N.G2 },
    { m: N.D5, d: 0.65, b: N.D3 },
    { m: N.C5, d: 1.9, b: N.C3 },
    { b: N.G3 },
    { b: N.E4 },
  ];

  function getConfig() {
    return (window.INVITATION_CONFIG && window.INVITATION_CONFIG.music) || {};
  }

  function triggerVoice(freq, durationSec, isLead) {
    if (!audioCtx || !masterGain || !freq) return;
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const env = audioCtx.createGain();
    const harmonicGain = audioCtx.createGain();

    // Warm acoustic piano + guitar timbre
    osc1.type = isLead ? "triangle" : "sine";
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, now);
    harmonicGain.gain.setValueAtTime(isLead ? 0.16 : 0.07, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(isLead ? 2200 : 1200, now);

    const peak = isLead ? 0.25 : 0.13;
    const release = Math.max(0.45, durationSec * 1.45);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.028);
    env.gain.exponentialRampToValueAtTime(peak * 0.52, now + 0.18);
    env.gain.exponentialRampToValueAtTime(0.0006, now + release);

    osc1.connect(filter);
    osc2.connect(harmonicGain);
    harmonicGain.connect(filter);
    filter.connect(env);
    env.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + release + 0.05);
    osc2.stop(now + release + 0.05);
  }

  function playStep() {
    if (!isPlaying) return;
    const step = SCORE[eighthIndex % SCORE.length];
    eighthIndex += 1;

    if (step.b) {
      triggerVoice(step.b, 1.35, false);
    }
    if (step.m) {
      triggerVoice(step.m, step.d || 0.65, true);
    }
  }

  function startSynth() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      const vol =
        typeof getConfig().volume === "number" ? getConfig().volume : 0.42;
      masterGain.gain.setValueAtTime(vol * 0.55, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    playStep();
    // ~78 BPM ballad (eighth-note = 385ms)
    stepTimer = window.setInterval(playStep, 385);
    return true;
  }

  function stopSynth() {
    if (stepTimer) {
      clearInterval(stepTimer);
      stepTimer = null;
    }
  }

  function play() {
    if (isPlaying) return true;
    const cfg = getConfig();

    if (cfg.mp3Url) {
      if (!audioEl) {
        audioEl = new Audio(cfg.mp3Url);
        audioEl.loop = true;
        audioEl.volume = typeof cfg.volume === "number" ? cfg.volume : 0.42;
      }
      audioEl
        .play()
        .then(() => {
          isPlaying = true;
          notify();
        })
        .catch(() => {
          // If MP3 path is missing or blocked, fall back gracefully to built-in "Nụ Cười 18 20" synth
          const ok = startSynth();
          isPlaying = ok;
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
