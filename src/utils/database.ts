
/**
 * IndexedDB utility for file storage
 */

const DB_NAME = 'cryptoSafeport';
const DB_VERSION = 1;
const ENCRYPTED_STORE = 'encryptedFiles';
const DECRYPTED_STORE = 'decryptedFiles';

// Open database connection
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(ENCRYPTED_STORE)) {
        db.createObjectStore(ENCRYPTED_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(DECRYPTED_STORE)) {
        db.createObjectStore(DECRYPTED_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Get all items from a store
export const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result as T[]);
    };
    
    request.onerror = (event) => {
      console.error(`Error reading from ${storeName}:`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Add an item to a store
export const addItem = async <T>(storeName: string, item: T): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error(`Error adding to ${storeName}:`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Delete an item from a store
export const deleteItem = async (storeName: string, id: string): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error(`Error deleting from ${storeName}:`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Clear a store
export const clearStore = async (storeName: string): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      console.error(`Error clearing ${storeName}:`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};
