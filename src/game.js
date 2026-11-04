import {
    GRID_SIZE,
    WIN_TILE,
    addRandomTile,
    canMove,
    createEmptyBoard,
    generateDailyBoard,
    hasWon,
    moveBoard
} from './logic.js';
import { clearGameState, loadGameState, loadSettings, saveGameState, saveSettings } from './storage.js';

const DIRECTION_KEYS = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down'
};

export function createDefaultState(bestScore = 0) {
    const initialBoard = createEmptyBoard();
    const startingBoard = addRandomTile(addRandomTile(initialBoard));

    return {
        board: startingBoard,
        score: 0,
        bestScore,
        moves: 0,
        status: 'playing',
        hasWon: false,
        mode: 'classic',
        history: [],
        stats: {
            totalMoves: 0,
            totalMerges: 0,
            highestTile: 2,
            gamesStarted: 1
        }
    };
}

export class TileFlowGame {
    constructor(root) {
        this.root = root;
        this.settings = loadSettings();
        this.state = loadGameState() || createDefaultState(this.settings.bestScore || 0);
        this.settings.bestScore = this.state.bestScore;
        this.touchStart = null;
        this.audioContext = null;

        this.handleKey = this.handleKey.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleRootClick = this.handleRootClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    init() {
        document.addEventListener('keydown', this.handleKey);
        window.addEventListener('resize', this.handleResize);
        this.root.addEventListener('click', this.handleRootClick);
        this.root.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        this.root.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        this.applyTheme();
        this.updateBestScore();
        this.render();
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKey);
        window.removeEventListener('resize', this.handleResize);
        this.root.removeEventListener('click', this.handleRootClick);
        this.root.removeEventListener('touchstart', this.handleTouchStart);
        this.root.removeEventListener('touchend', this.handleTouchEnd);
    }

    getStatusLabel() {
        if (this.state.status === 'won') {
            return 'You made it to 2048!';
        }

        if (this.state.status === 'lost') {
            return 'No more moves';
        }

        return 'Keep flowing';
    }

    applyTheme() {
        document.documentElement.dataset.theme = this.settings.theme;
        saveSettings(this.settings);
    }

    updateBestScore() {
        if (this.state.bestScore > 0) {
            this.settings.bestScore = this.state.bestScore;
            saveSettings(this.settings);
        }
    }

    persist() {
        const stateToSave = {
            ...this.state,
            history: this.state.history.slice(-12)
        };
        this.state.bestScore = Math.max(this.state.bestScore, this.state.score);
        saveGameState(stateToSave);
        this.updateBestScore();
    }

    playTone(frequency = 420) {
        if (!this.settings.soundEnabled || typeof window === 'undefined') {
            return;
        }

        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) {
            return;
        }

        this.audioContext = this.audioContext || new AudioCtor();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.03;
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.06);
    }

    handleRootClick(event) {
        const actionTarget = event.target.closest('[data-action]');
        if (!actionTarget) {
            return;
        }

        const action = actionTarget.dataset.action;
        if (action === 'toggle-theme') {
            this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme();
            this.render();
            return;
        }

        if (action === 'toggle-sound') {
            this.settings.soundEnabled = !this.settings.soundEnabled;
            saveSettings(this.settings);
            this.render();
            return;
        }

        if (action === 'new-game') {
            this.startNewGame('classic');
            return;
        }

        if (action === 'daily-game') {
            this.startNewGame('daily');
            return;
        }

        if (action === 'undo') {
            this.undo();
            return;
        }

        if (action === 'toggle-help') {
            this.settings.settingsOpen = !this.settings.settingsOpen;
            saveSettings(this.settings);
            this.render();
            return;
        }

        if (action === 'continue-game') {
            this.state.status = 'playing';
            this.persist();
            this.render();
            return;
        }

        if (action === 'reset-progress') {
            clearGameState();
            this.state = createDefaultState(this.state.bestScore || 0);
            this.persist();
            this.render();
        }
    }

    handleKey(event) {
        const key = DIRECTION_KEYS[event.key];
        if (!key) {
            return;
        }

        event.preventDefault();
        this.applyMove(key);
    }

    handleTouchStart(event) {
        const touch = event.changedTouches[0];
        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY
        };
    }

    handleTouchEnd(event) {
        if (!this.touchStart) {
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchStart.x;
        const deltaY = touch.clientY - this.touchStart.y;
        const threshold = 28;

        if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
            this.touchStart = null;
            return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            this.applyMove(deltaX > 0 ? 'right' : 'left');
        } else {
            this.applyMove(deltaY > 0 ? 'down' : 'up');
        }

        this.touchStart = null;
    }

    handleResize() {
        this.root.style.setProperty('--board-size', `${Math.min(window.innerWidth * 0.82, 420)}px`);
    }

    startNewGame(mode = 'classic') {
        const board = mode === 'daily' ? generateDailyBoard() : createEmptyBoard();
        const nextState = createDefaultState(this.state.bestScore || 0);
        nextState.board = mode === 'daily' ? board : addRandomTile(addRandomTile(createEmptyBoard()));
        nextState.mode = mode;
        nextState.stats.gamesStarted = this.state.stats.gamesStarted + 1;
        this.state = nextState;
        this.persist();
        this.render();
    }

    undo() {
        if (!this.state.history.length) {
            return;
        }

        const previous = this.state.history.pop();
        this.state.board = previous.board;
        this.state.score = previous.score;
        this.state.moves = previous.moves;
        this.state.status = previous.status;
        this.state.hasWon = previous.hasWon;
        this.persist();
        this.render();
    }

    applyMove(direction) {
        if (this.state.status === 'lost') {
            return;
        }

        if (this.state.status === 'won') {
            return;
        }

        const previous = {
            board: [...this.state.board],
            score: this.state.score,
            moves: this.state.moves,
            status: this.state.status,
            hasWon: this.state.hasWon
        };

        const result = moveBoard(this.state.board, direction);
        if (!result.moved) {
            this.playTone(180);
            return;
        }

        this.state.board = result.board;
        this.state.score += result.scoreGain;
        this.state.moves += 1;
        this.state.history.push(previous);

        if (result.scoreGain > 0) {
            this.state.stats.totalMerges += 1;
            this.playTone(520);
        }

        const nextBoard = addRandomTile(this.state.board);
        this.state.board = nextBoard;

        const highestTile = Math.max(...this.state.board.filter(Boolean));
        this.state.stats.highestTile = Math.max(this.state.stats.highestTile, highestTile || 2);
        this.state.stats.totalMoves = this.state.moves;

        this.state.bestScore = Math.max(this.state.bestScore, this.state.score);
        this.state.hasWon = hasWon(this.state.board);

        if (this.state.hasWon) {
            this.state.status = 'won';
        } else if (!canMove(this.state.board)) {
            this.state.status = 'lost';
        } else {
            this.state.status = 'playing';
        }

        this.persist();
        this.render();
    }

    render() {
        this.root.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <div class="brand-wrap">
            <div class="brand-mark">T</div>
            <div>
              <p class="eyebrow">Flow puzzle</p>
              <h1>TileFlow</h1>
            </div>
          </div>

          <div class="toolbar">
            <button type="button" class="icon-button" data-action="toggle-theme" aria-label="Toggle theme">
              ${this.settings.theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button type="button" class="icon-button" data-action="toggle-sound" aria-label="Toggle sound">
              ${this.settings.soundEnabled ? '🔊' : '🔇'}
            </button>
            <button type="button" class="icon-button" data-action="toggle-help" aria-label="Open settings">
              ☰
            </button>
          </div>
        </header>

        <main class="game-panel">
          <section class="hud" aria-label="Scoreboard">
            <div class="score-card">
              <span>Score</span>
              <strong>${this.state.score}</strong>
            </div>
            <div class="score-card">
              <span>Best</span>
              <strong>${this.state.bestScore}</strong>
            </div>
          </section>

          <section class="controls" aria-label="Game actions">
            <button type="button" class="primary-button" data-action="new-game">New game</button>
            <button type="button" class="secondary-button" data-action="daily-game">Daily</button>
            <button type="button" class="secondary-button" data-action="undo" ${this.state.history.length ? '' : 'disabled'}>Undo</button>
          </section>

          <div class="board-shell">
            <div class="game-board" role="grid" aria-label="TileFlow board" aria-live="polite">
              ${Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const value = this.state.board[index];
            const tileClass = value ? `tile tile--${value}` : 'tile tile--empty';
            return `
                  <div class="cell" data-index="${index}">
                    <div class="${tileClass}">${value || ''}</div>
                  </div>
                `;
        }).join('')}
            </div>

            ${this.state.status !== 'playing' ? `
              <div class="state-overlay" aria-live="assertive">
                <div class="state-card">
                  <h2>${this.state.status === 'won' ? 'Victory!' : 'Game over'}</h2>
                  <p>${this.getStatusLabel()}</p>
                  <button type="button" class="primary-button" data-action="${this.state.status === 'won' ? 'continue-game' : 'new-game'}">
                    ${this.state.status === 'won' ? 'Keep playing' : 'New game'}
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
        </main>

        <aside class="sidebar ${this.settings.settingsOpen ? 'open' : ''}" aria-label="Settings and help">
          <div class="panel-header">
            <h3>Settings</h3>
            <button type="button" class="ghost-button" data-action="toggle-help">Close</button>
          </div>

          <div class="panel-section">
            <h4>How to play</h4>
            <p>Match numbered tiles and create new values by moving in any direction. Every tile can merge once per move.</p>
          </div>

          <div class="panel-section">
            <h4>Modes</h4>
            <ul>
              <li>Classic: fresh random board</li>
              <li>Daily: same seed every day</li>
            </ul>
          </div>

          <div class="panel-section stats-section">
            <h4>Stats</h4>
            <div class="stat-grid">
              <div>
                <span>Moves</span>
                <strong>${this.state.moves}</strong>
              </div>
              <div>
                <span>Best tile</span>
                <strong>${this.state.stats.highestTile}</strong>
              </div>
              <div>
                <span>Games</span>
                <strong>${this.state.stats.gamesStarted}</strong>
              </div>
              <div>
                <span>Mode</span>
                <strong>${this.state.mode}</strong>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <button type="button" class="secondary-button full-width" data-action="reset-progress">Reset saved progress</button>
          </div>
        </aside>
      </div>
    `;

        this.handleResize();
    }
}

export function mountGame(rootElement) {
    const game = new TileFlowGame(rootElement);
    game.init();
    return game;
}
