const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
const SUPPORTED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg'];

let currentSound = null;
let currentUrl = null;

function getExtension(fileName) {
  return fileName.split('.').pop().toLowerCase();
}

export function validateAudioFile(file) {
  if (!file) {
    return { ok: false, reason: 'No hay archivo seleccionado.' };
  }

  const extension = getExtension(file.name);
  const typeOk = SUPPORTED_AUDIO_TYPES.includes(file.type);
  const extensionOk = SUPPORTED_AUDIO_EXTENSIONS.includes(extension);

  if (!typeOk && !extensionOk) {
    return { ok: false, reason: 'Formato no compatible. Usa MP3, WAV u OGG.' };
  }

  return { ok: true, reason: 'Formato compatible.' };
}

export function loadAudioFile(file) {
  const result = validateAudioFile(file);

  if (!result.ok) {
    return { ok: false, reason: result.reason };
  }

  if (currentSound) currentSound.unload();
  if (currentUrl) URL.revokeObjectURL(currentUrl);

  currentUrl = URL.createObjectURL(file);
  currentSound = new window.Howl({ src: [currentUrl], html5: true });

  return {
    ok: true,
    name: file.name,
    type: file.type || getExtension(file.name),
    size: file.size,
    category: 'SFX'
  };
}

export function playAudio() {
  if (!currentSound) return false;
  currentSound.play();
  return true;
}

export function stopAudio() {
  if (!currentSound) return false;
  currentSound.stop();
  return true;
}
