/**
 * Animated Chemical Engineering & HCMUT Bách Khoa Background Canvas (60fps)
 * Features:
 * - Lab Coats (Áo blouse thí nghiệm)
 * - Optical Microscopes (Kính hiển vi)
 * - Periodic Table Element Tiles (Ô nguyên tố hóa học: C, H, O, Au, Cu, Th, N...)
 * - Radiation Trefoil Warning Symbols (Biểu tượng cảnh báo phóng xạ ☢)
 * - Bubbling Test Tubes (Ống nghiệm) & Erlenmeyer Conical Flasks (Bình tam giác)
 * - Orbiting Atomic Models (Mô hình nguyên tử), Benzene Rings & Official HCMUT Logos
 */
(function () {
  const canvas = document.getElementById("molecular-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const FORMULAS = ["C₆H₆", "H₂O", "ΔH", "pH", "CO₂", "NH₃", "Keq", "NaOH"];

  const PERIODIC_ELEMENTS = [
    { num: "6", sym: "C", name: "Carbon", mass: "12.01" },
    { num: "1", sym: "H", name: "Hydrogen", mass: "1.008" },
    { num: "79", sym: "Au", name: "Aurum", mass: "197.0" },
    { num: "8", sym: "O", name: "Oxygen", mass: "16.00" },
    { num: "29", sym: "Cu", name: "Copper", mass: "63.55" },
    { num: "90", sym: "Th", name: "Thorium", mass: "232.0" },
    { num: "7", sym: "N", name: "Nitrogen", mass: "14.01" },
    { num: "11", sym: "Na", name: "Sodium", mass: "22.99" },
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;
  let time = 0;

  let nodes = [];
  let chemObjects = [];
  let formulaSprites = [];

  // Official HCMUT Bách Khoa logo image from config.js
  const logoImg = new Image();
  let logoReady = false;
  const logoUrl =
    (window.INVITATION_CONFIG &&
      window.INVITATION_CONFIG.graduate &&
      window.INVITATION_CONFIG.graduate.schoolLogoUrl) ||
    "./assets/hcmut-logo.png";
  logoImg.onload = () => {
    logoReady = true;
  };
  logoImg.src = logoUrl;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initEntities();
  }

  function createBubbles(count) {
    return Array.from({ length: count }, () => ({
      offset: Math.random(),
      xFrac: rand(-0.45, 0.45),
      size: rand(1.6, 3.4),
      speed: rand(0.004, 0.0085),
    }));
  }

  function initEntities() {
    const isMobile = width < 640;

    // 1. Connected molecular network nodes
    const nodeCount = isMobile ? 15 : 24;
    nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: rand(-0.22, 0.22),
      vy: rand(-0.22, 0.22),
      r: rand(1.8, 3.5),
      color:
        Math.random() > 0.72
          ? "rgba(212, 175, 55, 0.46)"
          : Math.random() > 0.45
          ? "rgba(20, 136, 219, 0.34)"
          : "rgba(3, 43, 145, 0.25)",
    }));

    // 2. Balanced variety of animated chemistry, lab & HCMUT objects
    const types = isMobile
      ? [
          "testTube",
          "elementTile",
          "labCoat",
          "microscope",
          "radiation",
          "bkLogo",
          "flask",
          "elementTile",
          "atom",
          "benzene",
          "testTube",
          "radiation",
          "bkLogo",
          "elementTile",
        ]
      : [
          "testTube",
          "elementTile",
          "labCoat",
          "microscope",
          "radiation",
          "bkLogo",
          "flask",
          "elementTile",
          "atom",
          "benzene",
          "testTube",
          "labCoat",
          "microscope",
          "radiation",
          "bkLogo",
          "elementTile",
          "naphthalene",
          "flask",
          "atom",
          "elementTile",
          "bkLogo",
          "radiation",
        ];

    chemObjects = types.map((type, idx) => {
      const cols = isMobile ? 3 : 5;
      const rows = Math.ceil(types.length / cols);
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cellW = width / cols;
      const cellH = height / rows;

      const paletteRoll = idx % 3;
      const liquidColor =
        paletteRoll === 0
          ? "rgba(20, 136, 219, 0.34)"
          : paletteRoll === 1
          ? "rgba(212, 175, 55, 0.34)"
          : "rgba(3, 43, 145, 0.26)";

      const elemData =
        PERIODIC_ELEMENTS[idx % PERIODIC_ELEMENTS.length];

      return {
        type,
        x: col * cellW + rand(cellW * 0.14, cellW * 0.86),
        y: row * cellH + rand(cellH * 0.14, cellH * 0.86),
        vx: rand(-0.14, 0.14),
        vy: rand(-0.22, -0.08),
        scale: isMobile ? rand(0.76, 0.95) : rand(0.88, 1.14),
        angle:
          type === "testTube"
            ? rand(-0.32, 0.32)
            : type === "bkLogo" ||
              type === "labCoat" ||
              type === "microscope" ||
              type === "elementTile"
            ? rand(-0.1, 0.1)
            : rand(0, Math.PI * 2),
        vAngle:
          type === "testTube" ||
          type === "flask" ||
          type === "bkLogo" ||
          type === "labCoat" ||
          type === "microscope" ||
          type === "elementTile"
            ? rand(0.004, 0.0075)
            : rand(-0.0035, 0.0035),
        phase: rand(0, Math.PI * 2),
        gold: idx % 3 === 1,
        liquidColor,
        elemData,
        bubbles:
          type === "testTube" || type === "flask" ? createBubbles(5) : [],
      };
    });

    // 3. Subtle drifting chemical formulas
    const formulaCount = isMobile ? 5 : 9;
    formulaSprites = Array.from({ length: formulaCount }, (_, i) => ({
      text: FORMULAS[i % FORMULAS.length],
      x: rand(24, width - 24),
      y: rand(30, height - 30),
      vx: rand(-0.1, 0.1),
      vy: rand(-0.16, -0.06),
      size: isMobile ? rand(13, 15) : rand(14, 18),
      alpha: rand(0.14, 0.22),
      gold: i % 3 === 0,
    }));
  }

  /* ------------------------------------------------------------------------
   * Drawing Primitives
   * ------------------------------------------------------------------------ */

  // 1. Test Tube (Ống nghiệm)
  function drawTestTube(obj) {
    const sway = Math.sin(time * obj.vAngle * 2.4 + obj.phase) * 0.14;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.angle + sway);
    ctx.scale(obj.scale, obj.scale);

    const w = 22;
    const h = 68;
    const r = w / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-r + 1.5, -h / 2 + 4);
    ctx.lineTo(-r + 1.5, h / 2 - r);
    ctx.arc(0, h / 2 - r, r - 1.5, Math.PI, 0, true);
    ctx.lineTo(r - 1.5, -h / 2 + 4);
    ctx.closePath();
    ctx.clip();

    const liquidTop = 2;
    const wave = Math.sin(time * 0.055 + obj.phase) * 3;
    ctx.beginPath();
    ctx.moveTo(-r - 4, liquidTop + wave);
    ctx.quadraticCurveTo(0, liquidTop - wave, r + 4, liquidTop + wave);
    ctx.lineTo(r + 4, h / 2 + 6);
    ctx.lineTo(-r - 4, h / 2 + 6);
    ctx.closePath();
    ctx.fillStyle = obj.liquidColor;
    ctx.fill();

    obj.bubbles.forEach((b) => {
      if (!prefersReduced) {
        b.offset = (b.offset + b.speed) % 1;
      }
      const bx = b.xFrac * (w - 6);
      const by = h / 2 - 6 - b.offset * (h * 0.56);
      const bubbleAlpha = b.offset < 0.7 ? 0.55 : (1 - b.offset) * 1.8;
      ctx.beginPath();
      ctx.arc(bx, by, b.size, 0, Math.PI * 2);
      ctx.fillStyle = obj.gold
        ? `rgba(212, 175, 55, ${(bubbleAlpha * 0.7).toFixed(2)})`
        : `rgba(20, 136, 219, ${(bubbleAlpha * 0.7).toFixed(2)})`;
      ctx.fill();
    });
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(-r, -h / 2);
    ctx.lineTo(-r, h / 2 - r);
    ctx.arc(0, h / 2 - r, r, Math.PI, 0, true);
    ctx.lineTo(r, -h / 2);
    ctx.strokeStyle = obj.gold
      ? "rgba(184, 134, 11, 0.34)"
      : "rgba(3, 43, 145, 0.28)";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-r - 3.5, -h / 2);
    ctx.lineTo(r + 3.5, -h / 2);
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.strokeStyle = "rgba(3, 43, 145, 0.2)";
    ctx.lineWidth = 1.1;
    [-16, -6, 4, 14].forEach((ty, idx) => {
      ctx.beginPath();
      ctx.moveTo(-r + 2.5, ty);
      ctx.lineTo(-r + (idx % 2 === 0 ? 8 : 6), ty);
      ctx.stroke();
    });

    ctx.restore();
  }

  // 2. Erlenmeyer Conical Flask (Bình tam giác)
  function drawFlask(obj) {
    const sway = Math.sin(time * obj.vAngle * 2 + obj.phase) * 0.09;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(sway);
    ctx.scale(obj.scale, obj.scale);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-8, -32);
    ctx.lineTo(-8, -12);
    ctx.lineTo(-28, 24);
    ctx.quadraticCurveTo(-30, 30, -22, 30);
    ctx.lineTo(22, 30);
    ctx.quadraticCurveTo(30, 30, 28, 24);
    ctx.lineTo(8, -12);
    ctx.lineTo(8, -32);
    ctx.closePath();
    ctx.clip();

    const wave = Math.sin(time * 0.05 + obj.phase) * 2.8;
    ctx.beginPath();
    ctx.moveTo(-34, 8 + wave);
    ctx.quadraticCurveTo(0, 8 - wave, 34, 8 + wave);
    ctx.lineTo(34, 34);
    ctx.lineTo(-34, 34);
    ctx.closePath();
    ctx.fillStyle = obj.liquidColor;
    ctx.fill();

    obj.bubbles.forEach((b) => {
      if (!prefersReduced) {
        b.offset = (b.offset + b.speed * 0.9) % 1;
      }
      const bx = b.xFrac * 26 * (1 - b.offset * 0.55);
      const by = 26 - b.offset * 38;
      ctx.beginPath();
      ctx.arc(bx, by, b.size * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = obj.gold
        ? "rgba(212, 175, 55, 0.45)"
        : "rgba(20, 136, 219, 0.45)";
      ctx.fill();
    });
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(-11, -32);
    ctx.lineTo(11, -32);
    ctx.moveTo(-8, -32);
    ctx.lineTo(-8, -12);
    ctx.lineTo(-28, 24);
    ctx.quadraticCurveTo(-30, 30, -22, 30);
    ctx.lineTo(22, 30);
    ctx.quadraticCurveTo(30, 30, 28, 24);
    ctx.lineTo(8, -12);
    ctx.lineTo(8, -32);
    ctx.strokeStyle = obj.gold
      ? "rgba(184, 134, 11, 0.34)"
      : "rgba(3, 43, 145, 0.28)";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.restore();
  }

  // 3. Lab Coat (Áo blouse trắng phòng thí nghiệm)
  function drawLabCoat(obj) {
    const sway = Math.sin(time * obj.vAngle * 1.8 + obj.phase) * 0.08;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.angle + sway);
    ctx.scale(obj.scale, obj.scale);

    const stroke = obj.gold
      ? "rgba(184, 134, 11, 0.32)"
      : "rgba(3, 43, 145, 0.26)";
    const fill = "rgba(255, 255, 255, 0.46)";

    // Main coat silhouette with sleeves
    ctx.beginPath();
    ctx.moveTo(-9, -30); // Left collar neck
    ctx.lineTo(-20, -26); // Left shoulder
    ctx.lineTo(-34, 0); // Left sleeve outer
    ctx.lineTo(-25, 5); // Left cuff
    ctx.lineTo(-17, -11); // Left armpit
    ctx.lineTo(-21, 30); // Left hem
    ctx.lineTo(21, 30); // Right hem
    ctx.lineTo(17, -11); // Right armpit
    ctx.lineTo(25, 5); // Right cuff
    ctx.lineTo(34, 0); // Right sleeve outer
    ctx.lineTo(20, -26); // Right shoulder
    ctx.lineTo(9, -30); // Right collar neck
    ctx.lineTo(0, -13); // V-neck center
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.65;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Notched lapels
    ctx.beginPath();
    ctx.moveTo(-9, -30);
    ctx.lineTo(-13, -18);
    ctx.lineTo(-7, -16);
    ctx.lineTo(0, -13);
    ctx.moveTo(9, -30);
    ctx.lineTo(13, -18);
    ctx.lineTo(7, -16);
    ctx.lineTo(0, -13);
    // Center button placket
    ctx.moveTo(0, -13);
    ctx.lineTo(0, 30);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 3 Coat buttons
    ctx.fillStyle = "rgba(20, 136, 219, 0.38)";
    [-3, 6, 15].forEach((by) => {
      ctx.beginPath();
      ctx.arc(0, by, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Breast pocket with tiny cyan/gold test tube peeking out
    ctx.strokeRect(5, -7, 9, 10);
    ctx.beginPath();
    ctx.moveTo(9.5, -7);
    ctx.lineTo(9.5, -12);
    ctx.strokeStyle = "rgba(212, 175, 55, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // 4. Laboratory Microscope (Kính hiển vi)
  function drawMicroscope(obj) {
    const sway = Math.sin(time * obj.vAngle * 1.6 + obj.phase) * 0.06;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.angle + sway);
    ctx.scale(obj.scale, obj.scale);

    const stroke = obj.gold
      ? "rgba(184, 134, 11, 0.34)"
      : "rgba(3, 43, 145, 0.28)";
    const accent = "rgba(20, 136, 219, 0.32)";

    ctx.strokeStyle = stroke;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Base plate
    ctx.beginPath();
    ctx.moveTo(-20, 28);
    ctx.lineTo(20, 28);
    ctx.lineTo(16, 22);
    ctx.lineTo(-16, 22);
    ctx.closePath();
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // Curved C-arm pillar
    ctx.beginPath();
    ctx.moveTo(8, 22);
    ctx.quadraticCurveTo(22, 2, 6, -15);
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // Specimen stage (horizontal platform)
    ctx.beginPath();
    ctx.moveTo(-16, 6);
    ctx.lineTo(11, 6);
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Tilted optical body tube & eyepiece
    ctx.save();
    ctx.translate(0, -15);
    ctx.rotate(-0.42);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillRect(-5, -14, 10, 22);
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-5, -14, 10, 22);
    // Eyepiece cap
    ctx.beginPath();
    ctx.moveTo(-7, -14);
    ctx.lineTo(7, -14);
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.restore();

    // Objective lenses pointing toward stage
    ctx.beginPath();
    ctx.moveTo(-2, -6);
    ctx.lineTo(-4, 1);
    ctx.moveTo(2, -6);
    ctx.lineTo(4, 0);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Focus adjustment wheel
    ctx.beginPath();
    ctx.arc(12, 8, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(212, 175, 55, 0.45)";
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.restore();
  }

  // 5. Periodic Table Element Tile (Ô nguyên tố hóa học)
  function drawElementTile(obj) {
    const sway = Math.sin(time * obj.vAngle * 1.7 + obj.phase) * 0.07;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.angle + sway);
    ctx.scale(obj.scale, obj.scale);

    const size = 46;
    const half = size / 2;
    const el = obj.elemData;

    const borderStroke = obj.gold
      ? "rgba(212, 175, 55, 0.38)"
      : "rgba(20, 136, 219, 0.30)";
    const textMain = obj.gold
      ? "rgba(166, 130, 28, 0.52)"
      : "rgba(3, 43, 145, 0.38)";

    // Rounded square tile
    ctx.beginPath();
    ctx.roundRect(-half, -half, size, size, 8);
    ctx.fillStyle = "rgba(255, 255, 255, 0.52)";
    ctx.fill();
    ctx.strokeStyle = borderStroke;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Atomic number (top-left)
    ctx.font = "700 8.5px 'Be Vietnam Pro', sans-serif";
    ctx.fillStyle = "rgba(20, 136, 219, 0.48)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(el.num, -half + 5, -half + 4);

    // Atomic mass (top-right)
    ctx.font = "500 7.5px 'Be Vietnam Pro', sans-serif";
    ctx.fillStyle = "rgba(82, 97, 126, 0.44)";
    ctx.textAlign = "right";
    ctx.fillText(el.mass, half - 5, -half + 4.5);

    // Element Symbol (center)
    ctx.font = "700 18px Georgia, serif";
    ctx.fillStyle = textMain;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(el.sym, 0, 1);

    // Element Name (bottom)
    ctx.font = "600 7.5px 'Be Vietnam Pro', sans-serif";
    ctx.fillStyle = "rgba(82, 97, 126, 0.48)";
    ctx.textBaseline = "bottom";
    ctx.fillText(el.name, 0, half - 4);

    ctx.restore();
  }

  // 6. Radiation Warning Trefoil Symbol (Cảnh báo phóng xạ ☢)
  function drawRadiationSymbol(obj) {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.angle);
    ctx.scale(obj.scale, obj.scale);

    const rOuter = 23;
    const rBladeOut = 18.5;
    const rBladeIn = 6.2;
    const rCore = 3.8;

    const color = obj.gold
      ? "rgba(212, 175, 55, 0.30)"
      : "rgba(20, 136, 219, 0.24)";
    const ringColor = obj.gold
      ? "rgba(212, 175, 55, 0.36)"
      : "rgba(3, 43, 145, 0.24)";

    // Outer warning ring
    ctx.beginPath();
    ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3 Radiation fan blades (60° each, spaced every 120°)
    ctx.fillStyle = color;
    for (let i = 0; i < 3; i++) {
      const startAngle = (i * (Math.PI * 2)) / 3 - Math.PI / 6;
      const endAngle = startAngle + Math.PI / 3;

      ctx.beginPath();
      ctx.arc(0, 0, rBladeOut, startAngle, endAngle, false);
      ctx.arc(0, 0, rBladeIn, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
    }

    // Center core dot
    ctx.beginPath();
    ctx.arc(0, 0, rCore, 0, Math.PI * 2);
    ctx.fillStyle = ringColor;
    ctx.fill();

    ctx.restore();
  }

  // 7. Orbiting Atomic Model
  function drawAtom(obj) {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.scale(obj.scale, obj.scale);

    const rx = 28;
    const ry = 10.5;
    const orbitColor = obj.gold
      ? "rgba(212, 175, 55, 0.28)"
      : "rgba(20, 136, 219, 0.25)";

    for (let i = 0; i < 3; i++) {
      const rot = (Math.PI / 3) * i + obj.angle * 0.2;
      ctx.save();
      ctx.rotate(rot);

      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = orbitColor;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      const eAngle =
        time * 0.028 * (i % 2 === 0 ? 1 : -1) + i * 2.1 + obj.phase;
      const ex = Math.cos(eAngle) * rx;
      const ey = Math.sin(eAngle) * ry;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.8, 0, Math.PI * 2);
      ctx.fillStyle =
        i === 0 ? "rgba(212, 175, 55, 0.65)" : "rgba(20, 136, 219, 0.58)";
      ctx.fill();

      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = obj.gold
      ? "rgba(212, 175, 55, 0.52)"
      : "rgba(3, 43, 145, 0.4)";
    ctx.fill();

    ctx.restore();
  }

  // 8. Benzene & Naphthalene Rings
  function drawHexagon(cx, cy, radius, stroke, innerStroke, dotColor) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const px = cx + Math.cos(a) * radius;
      const py = cy + Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.45;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.56, 0, Math.PI * 2);
    ctx.strokeStyle = innerStroke;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.fillStyle = dotColor;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(a) * radius,
        cy + Math.sin(a) * radius,
        1.9,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  function drawBenzene(obj, fused) {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.angle);
    ctx.scale(obj.scale, obj.scale);

    const r = 24;
    const stroke = obj.gold
      ? "rgba(212, 175, 55, 0.30)"
      : "rgba(3, 43, 145, 0.20)";
    const innerStroke = obj.gold
      ? "rgba(212, 175, 55, 0.22)"
      : "rgba(20, 136, 219, 0.22)";
    const dotColor = obj.gold
      ? "rgba(212, 175, 55, 0.45)"
      : "rgba(20, 136, 219, 0.35)";

    if (fused) {
      const dx = r * Math.cos(Math.PI / 6);
      drawHexagon(-dx * 0.86, 0, r * 0.86, stroke, innerStroke, dotColor);
      drawHexagon(dx * 0.86, 0, r * 0.86, stroke, innerStroke, dotColor);
    } else {
      drawHexagon(0, 0, r, stroke, innerStroke, dotColor);
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(r + 12, 0);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    ctx.restore();
  }

  // 9. Official HCMUT Bách Khoa Logo
  function drawBkLogo(obj) {
    const sway = Math.sin(time * obj.vAngle * 1.8 + obj.phase) * 0.1;
    const pulse = 1 + Math.sin(time * 0.025 + obj.phase) * 0.03;

    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.angle + sway);
    ctx.scale(obj.scale * pulse, obj.scale * pulse);
    ctx.globalAlpha = 0.23;

    if (logoReady && logoImg.naturalWidth > 0) {
      const drawW = 52;
      const drawH = drawW * (logoImg.naturalHeight / logoImg.naturalWidth);
      ctx.drawImage(logoImg, -drawW / 2, -drawH / 2, drawW, drawH);
    }

    ctx.restore();
  }

  /* ------------------------------------------------------------------------
   * Main 60fps Loop
   * ------------------------------------------------------------------------ */
  function wrapEntity(e, pad) {
    if (e.y < -pad) {
      e.y = height + pad;
      e.x = rand(pad * 0.5, width - pad * 0.5);
    }
    if (e.y > height + pad) e.y = -pad;
    if (e.x < -pad) e.x = width + pad;
    if (e.x > width + pad) e.x = -pad;
  }

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);
    if (!prefersReduced) {
      time += 1;
    }

    // 1. Draw molecular bond network
    const maxDist = width < 640 ? 110 : 140;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!prefersReduced) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dist = Math.hypot(n.x - m.x, n.y - m.y);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(20, 136, 219, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
    }

    // 2. Draw subtle drifting chemical formulas
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < formulaSprites.length; i++) {
      const f = formulaSprites[i];
      if (!prefersReduced) {
        f.x += f.vx;
        f.y += f.vy;
        wrapEntity(f, 36);
      }
      ctx.font = `600 ${f.size}px 'Be Vietnam Pro', sans-serif`;
      ctx.fillStyle = f.gold
        ? `rgba(184, 134, 11, ${f.alpha})`
        : `rgba(3, 43, 145, ${f.alpha})`;
      ctx.fillText(f.text, f.x, f.y);
    }

    // 3. Draw all animated Chemistry, Lab & HCMUT Icons
    for (let i = 0; i < chemObjects.length; i++) {
      const obj = chemObjects[i];
      if (!prefersReduced) {
        obj.x += obj.vx;
        obj.y += obj.vy;
        if (
          obj.type === "benzene" ||
          obj.type === "naphthalene" ||
          obj.type === "atom" ||
          obj.type === "radiation"
        ) {
          obj.angle += obj.vAngle;
        }
        wrapEntity(obj, 70);
      }

      switch (obj.type) {
        case "testTube":
          drawTestTube(obj);
          break;
        case "flask":
          drawFlask(obj);
          break;
        case "labCoat":
          drawLabCoat(obj);
          break;
        case "microscope":
          drawMicroscope(obj);
          break;
        case "elementTile":
          drawElementTile(obj);
          break;
        case "radiation":
          drawRadiationSymbol(obj);
          break;
        case "atom":
          drawAtom(obj);
          break;
        case "benzene":
          drawBenzene(obj, false);
          break;
        case "naphthalene":
          drawBenzene(obj, true);
          break;
        case "bkLogo":
          drawBkLogo(obj);
          break;
      }
    }

    if (!prefersReduced) {
      rafId = window.requestAnimationFrame(renderFrame);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !prefersReduced && !rafId) {
      rafId = requestAnimationFrame(renderFrame);
    }
  });

  window.addEventListener("resize", resize, { passive: true });
  resize();
  renderFrame();
})();
