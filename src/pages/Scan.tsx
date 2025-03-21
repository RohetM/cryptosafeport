
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileSearch, 
  Upload, 
  Check, 
  AlertTriangle, 
  Shield, 
  FolderOpen,
  Files,
  HardDrive,
  Clock
} from "lucide-react";

const Scan = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isScanRunning, setIsScanRunning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<{
    total: number;
    scanned: number;
    clean: number;
    suspicious: number;
    malicious: number;
    completedAt?: Date;
  } | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setScanResults(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      setScanResults(null);
    }
  };

  const runScan = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to scan",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanRunning(true);
    setScanProgress(0);
    setScanResults(null);
    
    // Simulate scanning process with progress updates
    const totalSteps = 100;
    const interval = 50; // ms between updates
    
    for (let step = 0; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      setScanProgress(step);
    }
    
    // Simulate scan results
    setScanResults({
      total: files.length,
      scanned: files.length,
      clean: Math.floor(files.length * 0.8),
      suspicious: Math.floor(files.length * 0.15),
      malicious: Math.floor(files.length * 0.05),
      completedAt: new Date()
    });
    
    setIsScanRunning(false);
    
    toast({
      title: "Scan Completed",
      description: `${files.length} files were scanned successfully`,
    });
  };

  const quickScan = async () => {
    setIsScanRunning(true);
    setScanProgress(0);
    setScanResults(null);
    
    // Simulate quick scan progress
    const totalSteps = 100;
    const interval = 30; // faster than full scan
    
    for (let step = 0; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      setScanProgress(step);
    }
    
    // Simulate scan results for quick scan (system files)
    const randomFileCount = Math.floor(Math.random() * 200) + 100;
    setScanResults({
      total: randomFileCount,
      scanned: randomFileCount,
      clean: Math.floor(randomFileCount * 0.95),
      suspicious: Math.floor(randomFileCount * 0.04),
      malicious: Math.floor(randomFileCount * 0.01),
      completedAt: new Date()
    });
    
    setIsScanRunning(false);
    
    toast({
      title: "Quick Scan Completed",
      description: `${randomFileCount} system files were scanned`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Threat Scanning</h1>
        
        <Tabs defaultValue="file-scan" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="file-scan">File Scan</TabsTrigger>
            <TabsTrigger value="quick-scan">Quick Scan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file-scan">
            <div className="max-w-4xl mx-auto">
              <Card className="glass card-glow">
                <CardHeader>
                  <CardTitle>File Scanner</CardTitle>
                  <CardDescription>
                    Upload files to scan them for potential security threats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* File upload area */}
                    {!scanResults && (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all
                          ${files.length === 0 ? 'border-muted-foreground/20 hover:border-primary/50' : 'border-primary/50'}`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        {files.length === 0 ? (
                          <div className="py-4">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground/70" />
                            <h3 className="mt-2 text-lg font-medium">
                              Drag & drop files to scan
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              or click to browse your files
                            </p>
                            <Input
                              id="file-upload"
                              type="file"
                              multiple
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => document.getElementById("file-upload")?.click()}
                            >
                              Select Files
                            </Button>
                          </div>
                        ) : (
                          <div className="py-4">
                            <Files className="mx-auto h-12 w-12 text-primary" />
                            <h3 className="mt-2 text-lg font-medium">
                              {files.length} {files.length === 1 ? 'file' : 'files'} selected
                            </h3>
                            <div className="mt-1 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                              {files.map((file, index) => (
                                <p key={index} className="truncate">
                                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </p>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => {
                                setFiles([]);
                                setScanResults(null);
                              }}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Scan progress */}
                    {isScanRunning && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-lg font-medium">Scanning in progress...</h3>
                          <p className="text-sm text-muted-foreground">Please wait while we analyze your files</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>{scanProgress}%</span>
                          </div>
                          <Progress value={scanProgress} className="h-2" />
                        </div>
                      </div>
                    )}
                    
                    {/* Scan results */}
                    {scanResults && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                            <Check className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium">Scan Completed</h3>
                          <p className="text-sm text-muted-foreground">
                            Completed at {scanResults.completedAt?.toLocaleTimeString()}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="text-2xl font-bold">{scanResults.clean}</div>
                              <p className="text-sm text-muted-foreground">Clean Files</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2">
                                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div className="text-2xl font-bold">{scanResults.suspicious}</div>
                              <p className="text-sm text-muted-foreground">Suspicious Files</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="text-2xl font-bold">{scanResults.malicious}</div>
                              <p className="text-sm text-muted-foreground">Malicious Files</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setFiles([]);
                              setScanResults(null);
                            }}
                          >
                            Scan New Files
                          </Button>
                          {scanResults.malicious > 0 && (
                            <Button>
                              <Shield className="mr-2 h-4 w-4" />
                              Clean Threats
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Scan button */}
                    {!isScanRunning && !scanResults && (
                      <Button
                        onClick={runScan}
                        className="w-full"
                        disabled={files.length === 0}
                      >
                        <FileSearch className="mr-2 h-4 w-4" />
                        Start Scan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="quick-scan">
            <div className="max-w-4xl mx-auto">
              <Card className="glass card-glow">
                <CardHeader>
                  <CardTitle>Quick System Scan</CardTitle>
                  <CardDescription>
                    Scan your system for common threats and vulnerabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* System scan area */}
                    {!isScanRunning && !scanResults && (
                      <div className="text-center py-8">
                        <HardDrive className="mx-auto h-16 w-16 text-primary/70" />
                        <h3 className="mt-4 text-lg font-medium">
                          Ready to scan your system
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                          The quick scan will check critical system areas for potential security threats and vulnerabilities.
                        </p>
                        
                        <div className="flex justify-center mt-6 space-x-4">
                          <Button
                            variant="outline"
                            onClick={quickScan}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Quick Scan (5-10 min)
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Scan progress */}
                    {isScanRunning && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-lg font-medium">System scan in progress...</h3>
                          <p className="text-sm text-muted-foreground">Checking system files and directories</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>{scanProgress}%</span>
                          </div>
                          <Progress value={scanProgress} className="h-2" />
                        </div>
                      </div>
                    )}
                    
                    {/* Scan results */}
                    {scanResults && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                            <Check className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium">System Scan Completed</h3>
                          <p className="text-sm text-muted-foreground">
                            Completed at {scanResults.completedAt?.toLocaleTimeString()}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="text-2xl font-bold">{scanResults.clean}</div>
                              <p className="text-sm text-muted-foreground">Clean Files</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2">
                                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div className="text-2xl font-bold">{scanResults.suspicious}</div>
                              <p className="text-sm text-muted-foreground">Suspicious Files</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="text-2xl font-bold">{scanResults.malicious}</div>
                              <p className="text-sm text-muted-foreground">Malicious Files</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="bg-secondary/50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Scan Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total files scanned:</span>
                              <span>{scanResults.total}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Clean files:</span>
                              <span>{scanResults.clean} ({Math.round(scanResults.clean / scanResults.total * 100)}%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Suspicious files:</span>
                              <span>{scanResults.suspicious} ({Math.round(scanResults.suspicious / scanResults.total * 100)}%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Malicious files:</span>
                              <span>{scanResults.malicious} ({Math.round(scanResults.malicious / scanResults.total * 100)}%)</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setScanResults(null);
                            }}
                          >
                            Run Another Scan
                          </Button>
                          {scanResults.malicious > 0 && (
                            <Button>
                              <Shield className="mr-2 h-4 w-4" />
                              Clean Threats
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Quick scan checks:</p>
                    <ul className="space-y-1 pl-4 list-disc">
                      <li>System startup files</li>
                      <li>Common malware hiding locations</li>
                      <li>Recently modified system files</li>
                      <li>Running processes and services</li>
                      <li>Browser extensions</li>
                    </ul>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Scan;
