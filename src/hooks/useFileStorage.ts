
import { useState, useEffect, useCallback } from 'react';
import { 
  openDatabase,
  getAllItems,
  addItem,
  deleteItem
} from '@/utils/database';

const ENCRYPTED_STORE = 'encryptedFiles';
const DECRYPTED_STORE = 'decryptedFiles';

export interface StorageItem {
  id: string;
  fileName: string;
  data: string; // base64 encoded data
  size: number;
  timestamp: string;
  type: 'encrypted' | 'decrypted';
  algorithm?: string;
  originalFileName?: string;
}

export const useFileStorage = () => {
  const [encryptedFiles, setEncryptedFiles] = useState<StorageItem[]>([]);
  const [decryptedFiles, setDecryptedFiles] = useState<StorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load files from IndexedDB on initial load
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoading(true);
        
        // Initialize IndexedDB if needed
        await openDatabase();
        
        // Load both encrypted and decrypted files
        const storedEncrypted = await getAllItems<StorageItem>(ENCRYPTED_STORE);
        const storedDecrypted = await getAllItems<StorageItem>(DECRYPTED_STORE);
        
        setEncryptedFiles(storedEncrypted.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        
        setDecryptedFiles(storedDecrypted.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        
        setError(null);
      } catch (err) {
        console.error('Error loading files from database:', err);
        setError(err instanceof Error ? err : new Error('Failed to load files'));
        
        // Fallback to localStorage if IndexedDB fails
        tryFallbackToLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFiles();
  }, []);

  // Fallback to localStorage if IndexedDB fails
  const tryFallbackToLocalStorage = () => {
    try {
      const storedEncrypted = localStorage.getItem('cryptoSafeport_encryptedFiles');
      const storedDecrypted = localStorage.getItem('cryptoSafeport_decryptedFiles');
      
      if (storedEncrypted) {
        setEncryptedFiles(JSON.parse(storedEncrypted));
      }
      
      if (storedDecrypted) {
        setDecryptedFiles(JSON.parse(storedDecrypted));
      }
    } catch (e) {
      console.error('Error parsing files from localStorage:', e);
    }
  };

  // Add a new encrypted file
  const addEncryptedFile = useCallback(async (file: File, dataUrl: string, algorithm: string = 'AES-256') => {
    const newFile: StorageItem = {
      id: crypto.randomUUID(),
      fileName: `${file.name}.encrypted`,
      data: dataUrl,
      size: file.size,
      timestamp: new Date().toISOString(),
      type: 'encrypted',
      algorithm
    };
    
    try {
      await addItem(ENCRYPTED_STORE, newFile);
      setEncryptedFiles(prev => [newFile, ...prev]);
      return newFile.id;
    } catch (err) {
      console.error('Error adding encrypted file to database:', err);
      
      // Fallback to localStorage
      const updatedFiles = [newFile, ...encryptedFiles];
      localStorage.setItem('cryptoSafeport_encryptedFiles', JSON.stringify(updatedFiles));
      setEncryptedFiles(updatedFiles);
      return newFile.id;
    }
  }, [encryptedFiles]);

  // Add a new decrypted file
  const addDecryptedFile = useCallback(async (fileName: string, originalFileName: string, dataUrl: string, size: number) => {
    const newFile: StorageItem = {
      id: crypto.randomUUID(),
      fileName: fileName,
      originalFileName: originalFileName,
      data: dataUrl,
      size: size,
      timestamp: new Date().toISOString(),
      type: 'decrypted'
    };
    
    try {
      await addItem(DECRYPTED_STORE, newFile);
      setDecryptedFiles(prev => [newFile, ...prev]);
      return newFile.id;
    } catch (err) {
      console.error('Error adding decrypted file to database:', err);
      
      // Fallback to localStorage
      const updatedFiles = [newFile, ...decryptedFiles];
      localStorage.setItem('cryptoSafeport_decryptedFiles', JSON.stringify(updatedFiles));
      setDecryptedFiles(updatedFiles);
      return newFile.id;
    }
  }, [decryptedFiles]);

  // Delete an encrypted file
  const deleteEncryptedFile = useCallback(async (id: string) => {
    try {
      await deleteItem(ENCRYPTED_STORE, id);
      setEncryptedFiles(prev => prev.filter(file => file.id !== id));
    } catch (err) {
      console.error('Error deleting encrypted file from database:', err);
      
      // Fallback to localStorage
      const updatedFiles = encryptedFiles.filter(file => file.id !== id);
      localStorage.setItem('cryptoSafeport_encryptedFiles', JSON.stringify(updatedFiles));
      setEncryptedFiles(updatedFiles);
    }
  }, [encryptedFiles]);

  // Delete a decrypted file
  const deleteDecryptedFile = useCallback(async (id: string) => {
    try {
      await deleteItem(DECRYPTED_STORE, id);
      setDecryptedFiles(prev => prev.filter(file => file.id !== id));
    } catch (err) {
      console.error('Error deleting decrypted file from database:', err);
      
      // Fallback to localStorage
      const updatedFiles = decryptedFiles.filter(file => file.id !== id);
      localStorage.setItem('cryptoSafeport_decryptedFiles', JSON.stringify(updatedFiles));
      setDecryptedFiles(updatedFiles);
    }
  }, [decryptedFiles]);

  // Download a file
  const downloadFile = (file: StorageItem) => {
    const a = document.createElement('a');
    a.href = file.data;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    encryptedFiles,
    decryptedFiles,
    addEncryptedFile,
    addDecryptedFile,
    deleteEncryptedFile,
    deleteDecryptedFile,
    downloadFile,
    isLoading,
    error
  };
};
