
import { useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { useAuth } from '@/context/AuthContext';

const DB_NAME = 'secureFilesDB';
const DB_VERSION = 1;
const FILES_STORE = 'files';

// Interface for stored file info
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded file data
  encrypted: boolean;
  createdAt: number;
}

export const useFileStorage = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const userId = user?.id || localStorage.getItem('currentUserId') || 'anonymous';
  
  // Initialize the database
  const initDB = async (): Promise<IDBPDatabase> => {
    try {
      return await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create a store for files if it doesn't exist
          if (!db.objectStoreNames.contains(FILES_STORE)) {
            const store = db.createObjectStore(FILES_STORE, { keyPath: 'id' });
            store.createIndex('userId', 'userId', { unique: false });
            store.createIndex('encrypted', 'encrypted', { unique: false });
          }
        },
      });
    } catch (err) {
      console.error('Error initializing IndexedDB:', err);
      throw err;
    }
  };

  // Load files on component mount
  useEffect(() => {
    let mounted = true;

    const loadFiles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const db = await initDB();
        const tx = db.transaction(FILES_STORE, 'readonly');
        const store = tx.objectStore(FILES_STORE);
        const userIdIndex = store.index('userId');
        
        // Query files for the current user
        const userFiles = await userIdIndex.getAll(userId);
        
        if (mounted) {
          setFiles(userFiles);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading files:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load files'));
          setIsLoading(false);
        }
      }
    };

    loadFiles();

    return () => {
      mounted = false;
    };
  }, [userId]);

  // Save a file to storage
  const saveFile = async (fileInfo: Omit<FileInfo, 'id' | 'createdAt'>): Promise<FileInfo> => {
    try {
      const db = await initDB();
      const newFile: FileInfo = {
        ...fileInfo,
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: Date.now(),
      };
      
      // Add user ID to the file
      const fileWithUserId = {
        ...newFile,
        userId, // Link file to current user
      };
      
      const tx = db.transaction(FILES_STORE, 'readwrite');
      await tx.objectStore(FILES_STORE).add(fileWithUserId);
      await tx.done;
      
      // Update the files state
      setFiles(prev => [...prev, newFile]);
      
      return newFile;
    } catch (err) {
      console.error('Error saving file:', err);
      throw err instanceof Error ? err : new Error('Failed to save file');
    }
  };

  // Delete a file from storage
  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      const db = await initDB();
      const tx = db.transaction(FILES_STORE, 'readwrite');
      await tx.objectStore(FILES_STORE).delete(fileId);
      await tx.done;
      
      // Update the files state
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err instanceof Error ? err : new Error('Failed to delete file');
    }
  };

  // Get encrypted or decrypted files
  const getEncryptedFiles = () => files.filter(file => file.encrypted);
  const getDecryptedFiles = () => files.filter(file => !file.encrypted);

  return {
    files,
    isLoading,
    error,
    saveFile,
    deleteFile,
    getEncryptedFiles,
    getDecryptedFiles,
  };
};

export default useFileStorage;
