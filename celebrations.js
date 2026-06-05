/**
 * celebrations.js
 * Handles confetti animation, celebration modals, and achievement toasts.
 * Triggered by pomodoro.js, hydration.js, and todo.js via custom events
 * or direct calls from app.js.
 */

const Celebrations = (() => {
  // ── Confetti ──────────────────────────────────────────────────────────────
  const COLORS = ['#00f5d4', '#f5a623', '#ff6b6b', '#a855f7', '#3b82f6', '#22c55e', '#fbbf24'];
  let confettiParticles = [];
  let confettiAnimFrame = null;

  function createConfettiCanvas() {
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        pointer-events:none;z-index:9999;`;
      document.body.appendChild(canvas);
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
  }

  function launchConfetti(duration = 3000) {
    const canvas = createConfettiCanvas();
    const ctx = canvas.getContext('2d');
    confettiParticles = [];

    for (let i = 0; i < 160; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: -10,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        opacity: 1,
      });
    }

    const start = performance.now();

    function animate(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = now - start;
      const fade = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));

      confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotSpeed;
        p.opacity = fade;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < duration) {
        confettiAnimFrame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    if (confettiAnimFrame) cancelAnimationFrame(confettiAnimFrame);
    confettiAnimFrame = requestAnimationFrame(animate);
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  const CELEBRATE_MESSAGES = {
    pomodoro: [
      "🔥 Focus session complete! You're on fire!",
      "⚡ Crushing it! Another Pomodoro down!",
      "🎯 Deep work mastered. Take a well-earned break!",
      "🚀 Session complete! Momentum is building!",
    ],
    task: [
      "✅ Task obliterated! You're unstoppable!",
      "🏆 Done and dusted! What's next?",
      "💪 Task conquered! Keep the streak alive!",
      "⭐ Nailed it! One more win in the books!",
    ],
    hydration: [
      "💧 Hydration goal crushed! Your body thanks you!",
      "🌊 Fully hydrated! Peak performance mode: ON!",
      "🥤 Daily water goal complete! Stay refreshed!",
      "💦 You're a hydration champion today!",
    ],
    badge: [
      "🏅 New achievement unlocked!",
      "🎖️ Badge earned! Your dedication shows!",
      "⚡ Achievement unlocked! Skill level up!",
    ],
  };

  function getRandomMessage(type) {
    const arr = CELEBRATE_MESSAGES[type] || CELEBRATE_MESSAGES.pomodoro;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showModal(type, subtitle = '') {
    const modal = document.getElementById('celebration-modal');
    const msgEl = document.getElementById('celebration-message');
    const subEl = document.getElementById('celebration-subtitle');
    if (!modal || !msgEl) return;

    msgEl.textContent = getRandomMessage(type);
    if (subEl) subEl.textContent = subtitle;

    modal.classList.add('active');
    launchConfetti(3500);

    // Auto-close after 4s
    setTimeout(() => closeModal(), 4000);
  }

  function closeModal() {
    const modal = document.getElementById('celebration-modal');
    if (modal) modal.classList.remove('active');
  }

  // ── Toast notification ────────────────────────────────────────────────────
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ── Badge award ───────────────────────────────────────────────────────────
  function awardBadge(badgeId, badgeName, badgeIcon) {
    const badges = JSON.parse(localStorage.getItem('stats_badges') || '[]');
    if (badges.includes(badgeId)) return; // already awarded
    badges.push(badgeId);
    localStorage.setItem('stats_badges', JSON.stringify(badges));
    showModal('badge', `"${badgeName}" ${badgeIcon}`);
    showToast(`Badge unlocked: ${badgeName} ${badgeIcon}`, 'achievement');
  }

  return { launchConfetti, showModal, closeModal, showToast, awardBadge };
})();
