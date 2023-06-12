const DB_NAME = 'gameDB';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'gameData';

let db;

function initIndexedDB() {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Some features will not be available.");
    return;
  }

  const request = window.indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
  };

  request.onsuccess = function (event) {
    db = event.target.result;
  };

  request.onerror = function (event) {
    console.error('Error opening IndexedDB:', event.target.error);
  };

  request.onblocked = function (event) {
    console.error('Blocked from opening IndexedDB:', event.target.error);
  };
}

function saveGameToIndexedDB(gameData) {
  const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
  const request = objectStore.put(gameData);
  request.onerror = function (event) {
    console.error('Error saving game data:', event.target.error);
  };
  request.onsuccess = function (event) {
    console.log('Game data saved successfully');
  };
}

function loadGameFromIndexedDB(id) {
  const transaction = db.transaction([OBJECT_STORE_NAME]);
  const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
  const request = objectStore.get(id);
  request.onerror = function (event) {
    console.error('Error loading game data:', event.target.error);
  };
  request.onsuccess = function (event) {
    if (request.result) {
      console.log('Game data loaded:', request.result);
    } else {
      console.log('No game data found with id:', id);
    }
  };
}

function deleteGameFromIndexedDB(id) {
  const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
  const request = objectStore.delete(id);
  request.onerror = function (event) {
    console.error('Error deleting game data:', event.target.error);
  };
  request.onsuccess = function (event) {
    console.log('Game data deleted successfully');
  };
}

initIndexedDB();
