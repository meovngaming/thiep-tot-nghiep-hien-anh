/**
 * 60fps Celebratory Confetti Burst (HCMUT Navy, Cyan, Gold & White)
 * Zero external dependencies; stops loop automatically when finished.
 */
window.ConfettiEffect = (function () {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const COLORS = ["#032B91", "#1488DB", "#D4AF37", "#F5DF8D", "#FFFFFF"];

  let particles = [];
  let rafId = null;
  let width = 0;
  let height = 0;

  function resize() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(count = 95) {
    if (!canvas || !ctx) return;
    resize();

    const originX = width * 0.5;
    const originY = height * 0.42;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.5 + Math.random() * 9.5;
      particles.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4.2,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.24,
        gravity: 0.16 + Math.random() * 0.08,
        drag: 0.985,
        alpha: 1,
      });
    }

    if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (p.y > height * 0.78) {
        p.alpha -= 0.025;
      }

      if (p.alpha <= 0 || p.y > height + 30) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (particles.length > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, width, height);
      rafId = null;
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  return { burst };
})();
