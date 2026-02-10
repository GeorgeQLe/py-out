import { Game } from './core/Game.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
game.start();

// Expose for debugging
window.GAME = game;
