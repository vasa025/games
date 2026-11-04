import { beforeEach, describe, expect, it } from 'vitest';
import {
    addRandomTile,
    canMove,
    createEmptyBoard,
    generateDailyBoard,
    hasWon,
    moveBoard
} from '../src/logic.js';
import { clearGameState, createMemoryStorage, loadGameState, saveGameState } from '../src/storage.js';
import { TileFlowGame, createDefaultState } from '../src/game.js';

beforeEach(() => {
    globalThis.localStorage = createMemoryStorage();
    clearGameState();
});

describe('movement and validation', () => {
    it('moves tiles left and merges correctly', () => {
        const board = [2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const result = moveBoard(board, 'left');
        expect(result.moved).toBe(true);
        expect(result.board.slice(0, 4)).toEqual([4, 4, 0, 0]);
        expect(result.scoreGain).toBe(4);
    });

    it('moves right and down without moving invalid boards', () => {
        const staticBoard = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
        expect(moveBoard(staticBoard, 'left').moved).toBe(false);
        expect(moveBoard(staticBoard, 'down').moved).toBe(false);
        expect(canMove(staticBoard)).toBe(false);
    });

    it('applies the merge-once rule in a single move', () => {
        const board = [2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const result = moveBoard(board, 'left');
        expect(result.board.slice(0, 4)).toEqual([4, 2, 0, 0]);
    });
});

describe('score and status checks', () => {
    it('adds score for every merge', () => {
        const board = [4, 4, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const result = moveBoard(board, 'left');
        expect(result.scoreGain).toBe(24);
    });

    it('detects a win state', () => {
        const board = [2048, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        expect(hasWon(board)).toBe(true);
    });

    it('detects a game-over state', () => {
        const board = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
        expect(canMove(board)).toBe(false);
    });
});

describe('undo and save restore', () => {
    it('restores a saved board state', () => {
        const saved = {
            board: [2, 4, 8, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            score: 42,
            bestScore: 100,
            status: 'playing',
            hasWon: false,
            moves: 5,
            mode: 'classic',
            history: []
        };

        saveGameState(saved);
        expect(loadGameState()).toEqual(saved);
    });

    it('supports undoing the most recent move in the game controller', () => {
        const root = document.createElement('div');
        const game = new TileFlowGame(root);
        game.state = {
            board: [2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            score: 10,
            bestScore: 10,
            moves: 1,
            status: 'playing',
            hasWon: false,
            mode: 'classic',
            history: [{ board: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], score: 0, moves: 0, status: 'playing', hasWon: false }],
            stats: { totalMoves: 1, totalMerges: 0, highestTile: 4, gamesStarted: 1 }
        };

        game.undo();
        expect(game.state.board[0]).toBe(2);
        expect(game.state.score).toBe(0);
    });
});

describe('random and daily generation', () => {
    it('spawns a 2 or 4 tile', () => {
        const board = createEmptyBoard();
        const updated = addRandomTile(board, () => 0.9);
        const values = updated.filter((value) => value !== 0);
        expect(values.length).toBe(1);
        expect([2, 4]).toContain(values[0]);
    });

    it('creates a stable daily seeded board', () => {
        const boardA = generateDailyBoard(new Date('2026-11-04T00:00:00Z'));
        const boardB = generateDailyBoard(new Date('2026-11-04T00:00:00Z'));
        expect(boardA).toEqual(boardB);
    });
});

describe('default state', () => {
    it('initializes a valid game state', () => {
        const state = createDefaultState(250);
        expect(state.board.filter((value) => value !== 0)).toHaveLength(2);
        expect(state.bestScore).toBe(250);
        expect(state.status).toBe('playing');
    });
});
