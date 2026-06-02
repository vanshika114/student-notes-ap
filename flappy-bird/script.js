(() => {
  const WORLD = {
    width: 100,
    height: 100,
    birdX: 24,
    birdSize: 5.2,
    gravity: 28,
    liftGravity: -38,
    flapVelocity: -11.5,
    liftVelocity: -16,
    pipeSpeed: 20,
    pipeWidth: 12,
    gapSize: 32,
    groundHeight: 12,
    pipeSpacing: 38,
    liftWindow: 120,
  };

  const root = document.getElementById('root');

  root.innerHTML = `
    <div class="app">
      <div class="shell">
        <div class="header">
          <div>
            <h1 class="title">Flappy Bird</h1>
            <p class="subtitle">Hold mouse, touch, or Space to lift. Release to drop and thread the pipes.</p>
          </div>

          <div class="hud">
            <div class="chip" id="scoreChip">Score: 0</div>
            <div class="chip" id="bestChip">Best: 0</div>
          </div>
        </div>

        <div class="frame-wrap">
          <div class="game-frame" id="gameFrame" role="button" tabindex="0" aria-label="Flappy Bird game area">
            <div class="sun"></div>
            <div class="cloud" style="--top: 12%; --left: 10%; --size: 18%;"></div>
            <div class="cloud" style="--top: 24%; --left: 58%; --size: 13%;"></div>
            <div class="cloud" style="--top: 16%; --left: 36%; --size: 10%;"></div>

            <div id="pipeLayer"></div>
            <div id="birdLayer"></div>

            <div class="ground">
              <div class="grass"></div>
            </div>

            <div class="overlay" id="startOverlay">
              <div class="card">
                <h2>Ready to fly</h2>
                <p>Hold the screen, mouse, or Space key to lift the bird. Release to drop. Stay above the ground and pass the pipes.</p>
                <div class="stats">
                  <span class="mini-chip">Mobile friendly</span>
                  <span class="mini-chip">Hold to lift</span>
                  <span class="mini-chip">Release to fall</span>
                </div>
                <div class="cta-row">
                  <button class="button" type="button" id="startButton">Start Game</button>
                </div>
                <div class="hint">Works with mouse, keyboard, and touch input.</div>
              </div>
            </div>

            <div class="overlay overlay--result" id="gameOverOverlay" hidden>
              <div class="card">
                <h2>Game Over</h2>
                <p id="gameOverText">You scored 0. Best score is 0. Press Space, Enter, or tap restart to play again.</p>
                <div class="stats">
                  <span class="mini-chip" id="finalScoreChip">Score 0</span>
                  <span class="mini-chip" id="finalBestChip">Best 0</span>
                </div>
                <div class="cta-row">
                  <button class="button" type="button" id="restartButton">Restart</button>
                  <button class="button secondary" type="button" id="tryAgainButton">Try Again</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const elements = {
    gameFrame: document.getElementById('gameFrame'),
    scoreChip: document.getElementById('scoreChip'),
    bestChip: document.getElementById('bestChip'),
    pipeLayer: document.getElementById('pipeLayer'),
    birdLayer: document.getElementById('birdLayer'),
    startOverlay: document.getElementById('startOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverText: document.getElementById('gameOverText'),
    finalScoreChip: document.getElementById('finalScoreChip'),
    finalBestChip: document.getElementById('finalBestChip'),
    startButton: document.getElementById('startButton'),
    restartButton: document.getElementById('restartButton'),
    tryAgainButton: document.getElementById('tryAgainButton'),
  };

  let state = createInitialState();
  let rafId = 0;
  let lastInputTime = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function makePipe(x) {
    return {
      id: Math.random().toString(36).slice(2),
      x,
      gapCenter: 24 + Math.random() * 46,
      passed: false,
    };
  }

  function createInitialState(best = 0) {
    return {
      birdY: 45,
      birdVelocity: 0,
      score: 0,
      best,
      started: false,
      gameOver: false,
      lastTime: null,
      inputHeld: false,
      liftUntil: 0,
      pipes: [makePipe(115), makePipe(149), makePipe(183)],
    };
  }

  function restart() {
    state = createInitialState(state.best);
    render();
  }

  function startOrLift() {
    const now = performance.now();
    if (state.gameOver) return;
    if (now - lastInputTime < 40 && state.started) return;
    lastInputTime = now;
    state.started = true;
    state.inputHeld = true;
    state.birdVelocity = state.started ? WORLD.liftVelocity : WORLD.flapVelocity;
    state.liftUntil = now + WORLD.liftWindow;
    render();
  }

  function releaseInput() {
    state.inputHeld = false;
  }

  function handleKeyDown(event) {
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
      event.preventDefault();
      if (state.gameOver) {
        restart();
      } else {
        startOrLift();
      }
    }

    if (event.code === 'Enter' && state.gameOver) {
      restart();
    }
  }

  function handleKeyUp(event) {
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
      releaseInput();
    }
  }

  function update(timestamp) {
    if (state.lastTime == null) {
      state.lastTime = timestamp;
      rafId = requestAnimationFrame(update);
      return;
    }

    const delta = Math.min((timestamp - state.lastTime) / 1000, 0.032);
    state.lastTime = timestamp;

    if (!state.gameOver && state.started) {
      const acceleration = state.inputHeld || timestamp < state.liftUntil ? WORLD.liftGravity : WORLD.gravity;
      state.birdVelocity = clamp(state.birdVelocity + acceleration * delta, -14, 18);
      state.birdY += state.birdVelocity * delta;

      state.pipes = state.pipes.map((pipe) => ({ ...pipe, x: pipe.x - WORLD.pipeSpeed * delta }));

      const furthest = Math.max(...state.pipes.map((pipe) => pipe.x));
      if (state.pipes[0].x < -WORLD.pipeWidth - 2) {
        state.pipes = state.pipes.slice(1);
        state.pipes.push(makePipe(furthest + WORLD.pipeSpacing));
      }

      const birdTop = state.birdY;
      const birdBottom = state.birdY + WORLD.birdSize;
      const birdLeft = WORLD.birdX;
      const birdRight = WORLD.birdX + WORLD.birdSize;
      const groundTop = 100 - WORLD.groundHeight;

      if (birdTop <= 0 || birdBottom >= groundTop) {
        state.gameOver = true;
      }

      for (const pipe of state.pipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + WORLD.pipeWidth;
        const gapTop = pipe.gapCenter - WORLD.gapSize / 2;
        const gapBottom = pipe.gapCenter + WORLD.gapSize / 2;
        const hitsPipe = birdRight > pipeLeft && birdLeft < pipeRight;
        const hitsTop = birdTop < gapTop;
        const hitsBottom = birdBottom > gapBottom;

        if (hitsPipe && (hitsTop || hitsBottom)) {
          state.gameOver = true;
          break;
        }

        if (!pipe.passed && pipeRight < birdLeft) {
          pipe.passed = true;
          state.score += 1;
          state.best = Math.max(state.best, state.score);
        }
      }
    }

    if (state.birdY < 0) {
      state.birdY = 0;
      state.birdVelocity = 0;
    }

    if (state.gameOver) {
      state.started = false;
      state.birdVelocity = 0;
    }

    render();
    rafId = requestAnimationFrame(update);
  }

  function render() {
    elements.scoreChip.textContent = `Score: ${state.score}`;
    elements.bestChip.textContent = `Best: ${state.best}`;

    elements.startOverlay.hidden = state.started || state.gameOver;
    elements.gameOverOverlay.hidden = !state.gameOver;
    elements.gameOverText.textContent = `You scored ${state.score}. Best score is ${state.best}. Press Space, Enter, or tap restart to play again.`;
    elements.finalScoreChip.textContent = `Score ${state.score}`;
    elements.finalBestChip.textContent = `Best ${state.best}`;

    const birdRotation = clamp(state.birdVelocity * 2, -28, 90);
    elements.birdLayer.innerHTML = `
      <div class="bird" style="--x: ${WORLD.birdX}%; --y: ${state.birdY}%; --size: ${WORLD.birdSize}%; --rotation: ${birdRotation}deg;">
        <div class="bird-body">
          <div class="bird-eye"></div>
          <div class="bird-beak"></div>
          <div class="bird-wing"></div>
        </div>
      </div>
    `;

    elements.pipeLayer.innerHTML = state.pipes
      .map((pipe) => {
        const gapTop = pipe.gapCenter - WORLD.gapSize / 2;
        const gapBottom = pipe.gapCenter + WORLD.gapSize / 2;

        return `
          <div class="pipe" style="--x: ${pipe.x}%; --width: ${WORLD.pipeWidth}%;">
            <div class="pipe-top" style="height: ${gapTop}%;">
              <div class="pipe-edge" style="bottom: 0;"></div>
            </div>
            <div class="pipe-bottom" style="top: ${gapBottom}%;">
              <div class="pipe-edge" style="top: 0;"></div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  elements.gameFrame.addEventListener('pointerdown', startOrLift);
  elements.gameFrame.addEventListener('pointerup', releaseInput);
  elements.gameFrame.addEventListener('pointerleave', releaseInput);
  elements.gameFrame.addEventListener('pointercancel', releaseInput);
  elements.startButton.addEventListener('click', startOrLift);
  elements.restartButton.addEventListener('click', restart);
  elements.tryAgainButton.addEventListener('click', startOrLift);

  window.addEventListener('keydown', handleKeyDown, { passive: false });
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', releaseInput);

  render();
  rafId = requestAnimationFrame(update);
})();