
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
    
    // Simulate encryption process
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would be the result of actual encryption
    // For this demo, we'll create a blob with some content to simulate an encrypted file
    const encryptedContent = new Blob(
      [`This is a simulated encrypted version of ${file.name} using ${algorithm}`], 
      { type: 'application/octet-stream' }
    );
    
    // Create a URL for the blob
    const url = URL.createObjectURL(encryptedContent);
    setEncryptedFileUrl(url);
    
    setIsProcessing(false);
    setIsDone(true);
    
    toast({
      title: "Encryption complete",
      description: `${file.name} has been successfully encrypted`,
      variant: "default",
    });
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
