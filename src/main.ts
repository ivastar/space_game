// The game's pixel font, in normal and bold. It's bundled with the game, so it works offline.
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {

    StartGame('game-container');

});