
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Upload, Check, Download, AlertCircle, FileDown } from "lucide-react";

const Decrypt = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptedFileUrl, setDecryptedFileUrl] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsSuccess(false);
      setError(null);
      setDecryptedFileUrl(null);
    }
  };

  // Function to decrypt the file
  const decryptFile = async (encryptedData: ArrayBuffer, password: string): Promise<ArrayBuffer> => {
    try {
      // Extract salt, iv and encrypted data
      const encryptedArray = new Uint8Array(encryptedData);
      const salt = encryptedArray.slice(0, 16);
      const iv = encryptedArray.slice(16, 16 + 12);
      const data = encryptedArray.slice(16 + 12);
      
      // Convert password to key material
      const enc = new TextEncoder();
      const passwordBuffer = enc.encode(password);
      
      // Import key material
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );
      
      // Derive the key using PBKDF2
      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      
      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv
        },
        key,
        data
      );
      
      return decryptedData;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt the file. The password may be incorrect or the file may be corrupted.");
    }
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an encrypted file to decrypt",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "No password provided",
        description: "Please enter the decryption password",
        variant: "destructive",
      });
      return;
    }
    
    // Reset states
    setIsSuccess(false);
    setError(null);
    setDecryptedFileUrl(null);
    
    // Start decryption process
    setIsProcessing(true);
    
    try {
      // Read the file
      const fileBuffer = await file.arrayBuffer();
      
      // Decrypt the file
      const decryptedData = await decryptFile(fileBuffer, password);
      
      // Create a Blob from the decrypted data
      const decryptedBlob = new Blob([decryptedData]);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(decryptedBlob);
      setDecryptedFileUrl(url);
      
      // Set original file name (remove .encrypted if present)
      const origName = file.name.endsWith('.encrypted') 
        ? file.name.substring(0, file.name.length - 10) 
        : file.name + '.decrypted';
      setOriginalFileName(origName);
      
      setIsSuccess(true);
      setIsProcessing(false);
      
      toast({
        title: "Decryption successful",
        description: `${file.name} has been successfully decrypted`,
        variant: "default",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      setError("Failed to decrypt the file. The password may be incorrect or the file may be corrupted.");
      setIsProcessing(false);
      
      toast({
        title: "Decryption failed",
        description: "Incorrect password or invalid file format",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!decryptedFileUrl || !originalFileName) return;
    
    // Create an anchor element and set properties for download
    const a = document.createElement('a');
    a.href = decryptedFileUrl;
    a.download = originalFileName;
    
    // Append to body, click, and remove
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: `${originalFileName} is being downloaded`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setIsSuccess(false);
      setError(null);
      setDecryptedFileUrl(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">File Decryption</h1>
        
        <div className="max-w-3xl mx-auto">
          <Card className="glass card-glow">
            <CardHeader>
              <CardTitle>Decrypt Your Files</CardTitle>
              <CardDescription>
                Upload an encrypted file and enter the password to decrypt it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDecrypt} className="space-y-6">
                {/* File upload area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all
                    ${!file ? 'border-muted-foreground/20 hover:border-primary/50' : 'border-primary/50'}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {!file ? (
                    <div className="py-4">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/70" />
                      <h3 className="mt-2 text-lg font-medium">
                        Drag & drop your encrypted file here
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or click to browse your files
                      </p>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Check className="mx-auto h-12 w-12 text-primary" />
                      <h3 className="mt-2 text-lg font-medium">
                        File selected
                      </h3>
                      <p className="mt-1 text-sm">
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setFile(null);
                          setIsSuccess(false);
                          setError(null);
                          setDecryptedFileUrl(null);
                        }}
                      >
                        Change File
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Password input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Decryption Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter the password used for encryption"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                {/* Error message */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                {/* Success message */}
                {isSuccess && (
                  <div className="bg-primary/10 border border-primary/20 rounded-md p-4 flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">File successfully decrypted!</p>
                      <p className="text-xs text-muted-foreground mt-1">You can now download the decrypted file.</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!file || !password || isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <span className="mr-2">Decrypting...</span>
                        <span className="animate-spin h-4 w-4 border-2 border-primary border-opacity-50 border-t-transparent rounded-full" />
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Decrypt File
                      </span>
                    )}
                  </Button>
                  
                  {isSuccess && decryptedFileUrl && (
                    <Button variant="outline" onClick={handleDownload}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <div className="space-y-2 w-full">
                <h3 className="font-medium text-sm">Important Notes</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <Check className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                    <span>Make sure you enter the exact password that was used for encryption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                    <span>Decryption can only be performed on files that were encrypted with CryptoSafePort</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                    <span>After successful decryption, download the file to save it to your device</span>
                  </li>
                </ul>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Decrypt;
