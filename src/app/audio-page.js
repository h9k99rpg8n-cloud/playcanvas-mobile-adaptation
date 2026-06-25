import { loadAudioFile, playAudio, stopAudio, validateAudioFile } from '../modules/audio/audio-manager.js';

const info = document.querySelector('#audioInfo');
const input = document.querySelector('#audioInput');
const play = document.querySelector('#playButton');
const stop = document.querySelector('#stopButton');

function print(text) {
  info.textContent = text;
}

input.addEventListener('change', () => {
  const file = input.files[0];
  const check = validateAudioFile(file);
  if (!check.ok) {
    print(check.reason);
    return;
  }
  const asset = loadAudioFile(file);
  print('Archivo: ' + asset.name + ' | Tipo: ' + asset.type + ' | Categoria: ' + asset.category);
});

play.addEventListener('click', () => {
  if (!playAudio()) print('Primero importa un audio compatible.');
});

stop.addEventListener('click', () => {
  stopAudio();
});
