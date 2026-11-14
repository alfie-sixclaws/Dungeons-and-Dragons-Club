// storage.js - the only file that talks to localStorage.
// Keeping it in one place means every other page just calls these functions,
// and if we ever move to a real server we only change this file.

const STORAGE_KEY = "dndclub.characters";

// localStorage can only hold text, so we convert to/from JSON text.
function loadCharacters() {
  try {
    // JSON.parse turns text back into a real JavaScript array
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];   // if the saved text is broken, start fresh rather than crash
  }
}

function saveCharacters(characters) {
  // JSON.stringify turns the array into text we can store
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

// Make a unique id for each character
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getCharacter(id) {
  return loadCharacters().find(c => c.id === id) || null;
}

// Adds a new character, or replaces an existing one with the same id
function saveCharacter(character) {
  const all = loadCharacters();
  const i = all.findIndex(c => c.id === character.id);
  if (i >= 0) all[i] = character; else all.push(character);
  saveCharacters(all);
}

function deleteCharacter(id) {
  saveCharacters(loadCharacters().filter(c => c.id !== id));
}
