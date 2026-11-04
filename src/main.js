import './styles.css';
import { mountGame } from './game.js';

const root = document.querySelector('#app');
if (!root) {
    throw new Error('The app root element was not found.');
}

mountGame(root);
