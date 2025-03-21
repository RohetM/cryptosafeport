
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Upload, Check, Info, Download, FileDown } from "lucide-react";

const Encrypt = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [algorithm, setAlgorithm] = useState("aes-256");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [encryptedFileUrl, setEncryptedFileUrl] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsDone(false);
      setEncryptedFileUrl(null);
    }
  };

  // Function to encrypt the file using Web Crypto API
  const encryptFile = async (fileData: ArrayBuffer, password: string): Promise<ArrayBuffer> => {
    // Convert password to key using PBKDF2
    const enc = new TextEncoder();
    const passwordBuffer = enc.encode(password);
    
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derive key using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    // Set up AES-GCM parameters
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: algorithm === "aes-256" ? 256 : algorithm === "aes-192" ? 192 : 128 },
      false,
      ["encrypt"]
    );
    
    // Generate IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the file
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      fileData
    );
    
    // Combine salt + iv + encrypted data for storage
    const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    return result.buffer;
  };

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to encrypt",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "No password provided",
        description: "Please enter a password for encryption",
        variant: "destructive",
      });
      return;
    }
    
    // Begin encryption process
    setIsProcessing(true);
    
    try {
      // Read the file
      const fileBuffer = await file.arrayBuffer();
      
      // Encrypt the file
      const encryptedData = await encryptFile(fileBuffer, password);
      
      // Create a Blob from the encrypted data
      const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(encryptedBlob);
      setEncryptedFileUrl(url);
      
      setIsProcessing(false);
      setIsDone(true);
      
      toast({
        title: "Encryption complete",
        description: `${file.name} has been successfully encrypted`,
        variant: "default",
      });
    } catch (error) {
      console.error("Encryption error:", error);
      toast({
        title: "Encryption failed",
        description: "An error occurred during encryption",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!encryptedFileUrl || !file) return;
    
    // Create an anchor element and set properties for download
    const a = document.createElement('a');
    a.href = encryptedFileUrl;
    a.download = `${file.name}.encrypted`;
    
    // Append to body, click, and remove
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: `${file.name}.encrypted is being downloaded`,
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
      setIsDone(false);
      setEncryptedFileUrl(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">File Encryption</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main encryption form */}
          <div className="md:col-span-2">
            <Card className="glass card-glow">
              <CardHeader>
                <CardTitle>Encrypt Your File</CardTitle>
                <CardDescription>
                  Select a file, choose encryption settings, and encrypt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEncrypt} className="space-y-6">
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
                          Drag & drop your file here
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
                            setIsDone(false);
                            setEncryptedFileUrl(null);
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Encryption settings */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="encryption-algorithm">Encryption Algorithm</Label>
                      <Select
                        value={algorithm}
                        onValueChange={setAlgorithm}
                      >
                        <SelectTrigger id="encryption-algorithm">
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aes-256">AES-256 (Recommended)</SelectItem>
                          <SelectItem value="aes-192">AES-192</SelectItem>
                          <SelectItem value="aes-128">AES-128</SelectItem>
                          <SelectItem value="blowfish">Blowfish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Encryption Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        <Info className="inline h-3 w-3 mr-1" />
                        Use a strong, unique password that you can remember
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!file || !password || isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <span className="mr-2">Encrypting...</span>
                          <span className="animate-spin h-4 w-4 border-2 border-primary border-opacity-50 border-t-transparent rounded-full" />
                        </span>
                      ) : isDone ? (
                        <span className="flex items-center">
                          <Check className="mr-2 h-4 w-4" />
                          Encrypted Successfully
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Lock className="mr-2 h-4 w-4" />
                          Encrypt File
                        </span>
                      )}
                    </Button>
                    
                    {isDone && encryptedFileUrl && (
                      <Button onClick={handleDownload} variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Information panel */}
          <div>
            <Card className="glass card-glow">
              <CardHeader>
                <CardTitle>About Encryption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">What is file encryption?</h3>
                  <p className="text-sm text-muted-foreground">
                    File encryption is a security measure that converts the contents of a file into an unreadable format using mathematical algorithms and a secret key or password.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Available Algorithms</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>AES-256:</strong> Advanced Encryption Standard with 256-bit key length, extremely secure and recommended for sensitive data.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>AES-192:</strong> Similar to AES-256 but with a 192-bit key length, offering strong security.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>AES-128:</strong> Uses a 128-bit key length, still secure but with a shorter key than other AES variants.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Blowfish:</strong> A symmetric block cipher with a variable key length, suitable for fast encryption of large amounts of data.</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Security Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Use strong, unique passwords for each encryption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Store passwords securely and separately from encrypted files</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>AES-256 is recommended for most sensitive information</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Encrypt;
