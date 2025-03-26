
import { useState, useEffect } from 'react';

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

  // Load files from localStorage on initial load
  useEffect(() => {
    const storedEncrypted = localStorage.getItem('cryptoSafeport_encryptedFiles');
    const storedDecrypted = localStorage.getItem('cryptoSafeport_decryptedFiles');
    
    if (storedEncrypted) {
      try {
        setEncryptedFiles(JSON.parse(storedEncrypted));
      } catch (e) {
        console.error('Error parsing encrypted files from storage:', e);
        localStorage.removeItem('cryptoSafeport_encryptedFiles');
      }
    }
    
    if (storedDecrypted) {
      try {
        setDecryptedFiles(JSON.parse(storedDecrypted));
      } catch (e) {
        console.error('Error parsing decrypted files from storage:', e);
        localStorage.removeItem('cryptoSafeport_decryptedFiles');
      }
    }
  }, []);

  // Save to localStorage whenever files change
  useEffect(() => {
    localStorage.setItem('cryptoSafeport_encryptedFiles', JSON.stringify(encryptedFiles));
  }, [encryptedFiles]);

  useEffect(() => {
    localStorage.setItem('cryptoSafeport_decryptedFiles', JSON.stringify(decryptedFiles));
  }, [decryptedFiles]);

  // Add a new encrypted file
  const addEncryptedFile = (file: File, dataUrl: string, algorithm: string = 'AES-256') => {
    const newFile: StorageItem = {
      id: crypto.randomUUID(),
      fileName: `${file.name}.encrypted`,
      data: dataUrl,
      size: file.size,
      timestamp: new Date().toISOString(),
      type: 'encrypted',
      algorithm
    };
    
    setEncryptedFiles(prev => [newFile, ...prev]);
    return newFile.id;
  };

  // Add a new decrypted file
  const addDecryptedFile = (fileName: string, originalFileName: string, dataUrl: string, size: number) => {
    const newFile: StorageItem = {
      id: crypto.randomUUID(),
      fileName: fileName,
      originalFileName: originalFileName,
      data: dataUrl,
      size: size,
      timestamp: new Date().toISOString(),
      type: 'decrypted'
    };
    
    setDecryptedFiles(prev => [newFile, ...prev]);
    return newFile.id;
  };

  // Delete an encrypted file
  const deleteEncryptedFile = (id: string) => {
    setEncryptedFiles(prev => prev.filter(file => file.id !== id));
  };

  // Delete a decrypted file
  const deleteDecryptedFile = (id: string) => {
    setDecryptedFiles(prev => prev.filter(file => file.id !== id));
  };

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
    downloadFile
  };
};
