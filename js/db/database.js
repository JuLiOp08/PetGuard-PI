import { DB_NAME, DB_VERSION } from '../config.js';

const STORE_DEFINITIONS = {
  owners: { keyPath: 'id', indexes: [] },
  pets: { keyPath: 'id', indexes: ['ownerId', 'status', 'name'] },
  locations: { keyPath: 'id', indexes: ['petId', 'recordedAt', 'source'] },
  alerts: { keyPath: 'id', indexes: ['petId', 'status', 'updatedAt'] },
  alertEvents: { keyPath: 'id', indexes: ['alertId', 'occurredAt'] },
  sightings: { keyPath: 'id', indexes: ['alertId', 'seenAt', 'reviewStatus'] },
  notifications: { keyPath: 'id', indexes: ['read', 'priority', 'createdAt'] },
  settings: { keyPath: 'key', indexes: [] }
};

export const STORE_NAMES = Object.freeze(Object.keys(STORE_DEFINITIONS));

function ensureSchema(db, transaction) {
  Object.entries(STORE_DEFINITIONS).forEach(([name, definition]) => {
    const store = db.objectStoreNames.contains(name)
      ? transaction.objectStore(name)
      : db.createObjectStore(name, { keyPath: definition.keyPath });
    definition.indexes.forEach((indexName) => {
      if (!store.indexNames.contains(indexName)) store.createIndex(indexName, indexName, { unique: false });
    });
  });
}

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => ensureSchema(request.result, request.transaction);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento local.'));
    request.onblocked = () => reject(new Error('Cierra otras pestañas de PetGuard para actualizar los datos.'));
  });
}

export function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Falló una operación de almacenamiento.'));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('La transacción no pudo completarse.'));
    transaction.onabort = () => reject(transaction.error || new Error('La transacción fue cancelada.'));
  });
}

export async function withTransaction(storeNames, mode, work) {
  const db = await openDatabase();
  const transaction = db.transaction(storeNames, mode);
  const done = transactionDone(transaction);
  try {
    const result = await work(transaction);
    if (mode === 'readwrite' && transaction.commit) transaction.commit();
    await done;
    return result;
  } catch (error) {
    try { transaction.abort(); } catch { /* transaction already completed */ }
    try { await done; } catch { /* preserve the original domain or storage error */ }
    throw error;
  } finally {
    db.close();
  }
}

export function getAllRecords(storeNames = STORE_NAMES) {
  return withTransaction(storeNames, 'readonly', async (transaction) => {
    const entries = await Promise.all(storeNames.map(async (name) => [name, await requestResult(transaction.objectStore(name).getAll())]));
    return Object.fromEntries(entries);
  });
}
