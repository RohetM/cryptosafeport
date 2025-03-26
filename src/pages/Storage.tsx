
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search, Download, FileDown, Trash2, Lock, Unlock, DatabaseIcon, AlertCircle, Loader2 } from "lucide-react";
import { StorageItem, useFileStorage } from "@/hooks/useFileStorage";

const Storage = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { 
    encryptedFiles, 
    decryptedFiles, 
    deleteEncryptedFile, 
    deleteDecryptedFile,
    downloadFile,
    isLoading,
    error
  } = useFileStorage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("encrypted");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredEncrypted = encryptedFiles.filter(file => 
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDecrypted = decryptedFiles.filter(file => 
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">File Storage</h1>
        
        <div className="max-w-6xl mx-auto">
          <Card className="glass card-glow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Your Stored Files</CardTitle>
                  <CardDescription>
                    Securely stored in your browser's database
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading your files...</p>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-6 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-destructive">Error loading files</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {error.message || "There was a problem accessing your storage. Your files may not be persistent."}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="encrypted" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="encrypted" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Encrypted Files
                      {encryptedFiles.length > 0 && (
                        <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                          {encryptedFiles.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="decrypted" className="flex items-center gap-2">
                      <Unlock className="h-4 w-4" />
                      Decrypted Files
                      {decryptedFiles.length > 0 && (
                        <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                          {decryptedFiles.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="encrypted">
                    {filteredEncrypted.length > 0 ? (
                      <div className="rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left whitespace-nowrap px-4 py-3 font-medium">File Name</th>
                                <th className="text-left whitespace-nowrap px-4 py-3 font-medium">Size</th>
                                <th className="text-left whitespace-nowrap px-4 py-3 font-medium">Date</th>
                                <th className="text-left whitespace-nowrap px-4 py-3 font-medium">Algorithm</th>
                                <th className="text-right whitespace-nowrap px-4 py-3 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredEncrypted.map((file) => (
                                <tr key={file.id} className="hover:bg-muted/50">
                                  <td className="px-4 py-3">{file.fileName}</td>
                                  <td className="px-4 py-3">{formatSize(file.size)}</td>
                                  <td className="px-4 py-3">{formatDate(file.timestamp)}</td>
                                  <td className="px-4 py-3">{file.algorithm}</td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => downloadFile(file)}
                                      >
                                        <FileDown className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          deleteEncryptedFile(file.id);
                                          toast({
                                            title: "File deleted",
                                            description: `${file.fileName} has been removed from storage`,
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
                        <h3 className="mt-4 text-lg font-medium">No encrypted files</h3>
                        <p className="mt-2 text-muted-foreground">
                          {searchTerm ? "No matches found for your search." : "Encrypt a file to store it here."}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="decrypted">
                    {filteredDecrypted.length > 0 ? (
                      <div className="rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left whitespace-nowrap px-4 py-3 font-medium">File Name</th>
                                <th className="text-left whitespace-nowrap px-4 py-3 font-medium">Size</th>
                                <th className="text-left whitespace-nowrap px-4 py-3 font-medium">Date</th>
                                <th className="text-left whitespace-nowrap px-4 py-3 font-medium">Original File</th>
                                <th className="text-right whitespace-nowrap px-4 py-3 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredDecrypted.map((file) => (
                                <tr key={file.id} className="hover:bg-muted/50">
                                  <td className="px-4 py-3">{file.fileName}</td>
                                  <td className="px-4 py-3">{formatSize(file.size)}</td>
                                  <td className="px-4 py-3">{formatDate(file.timestamp)}</td>
                                  <td className="px-4 py-3">{file.originalFileName || 'Unknown'}</td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => downloadFile(file)}
                                      >
                                        <FileDown className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          deleteDecryptedFile(file.id);
                                          toast({
                                            title: "File deleted",
                                            description: `${file.fileName} has been removed from storage`,
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Unlock className="h-12 w-12 text-muted-foreground mx-auto" />
                        <h3 className="mt-4 text-lg font-medium">No decrypted files</h3>
                        <p className="mt-2 text-muted-foreground">
                          {searchTerm ? "No matches found for your search." : "Decrypt a file to store it here."}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-start gap-3">
                  <DatabaseIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">About Database Storage</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your files are stored in your browser's IndexedDB database, which provides:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc pl-5">
                      <li>Much larger storage capacity than localStorage (typically 50-100MB+)</li>
                      <li>Data persistence even when you close the browser</li>
                      <li>Better performance with larger files</li>
                      <li>Note: Files will still be cleared if you clear your browser data or use private browsing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Storage;
