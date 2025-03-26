
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search, Download, FileDown, Trash2, Lock, Unlock } from "lucide-react";
import { StorageItem, useFileStorage } from "@/hooks/useFileStorage";

const Storage = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { 
    encryptedFiles, 
    decryptedFiles, 
    deleteEncryptedFile, 
    deleteDecryptedFile,
    downloadFile 
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
                    Access your previously encrypted and decrypted files
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
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Storage;
