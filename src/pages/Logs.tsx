
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Lock, 
  Shield, 
  FileSearch, 
  UserPlus, 
  RefreshCw,
  Download,
  Calendar,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Define log entry type
interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  status: "success" | "warning" | "error";
  type: "encryption" | "decryption" | "scan" | "user" | "system";
}

// Generate mock log data
const generateMockLogs = (count: number): LogEntry[] => {
  const actions = [
    { action: "File encrypted", type: "encryption" as const },
    { action: "File decrypted", type: "decryption" as const },
    { action: "Threat scan completed", type: "scan" as const },
    { action: "User login", type: "user" as const },
    { action: "User logout", type: "user" as const },
    { action: "User registered", type: "user" as const },
    { action: "System update", type: "system" as const },
  ];
  
  const users = ["admin", "john.doe", "jane.smith", "guest.user"];
  const statuses = ["success", "warning", "error"];
  const statusWeights = [0.8, 0.15, 0.05]; // 80% success, 15% warning, 5% error
  
  return Array.from({ length: count }, (_, i) => {
    const actionIndex = Math.floor(Math.random() * actions.length);
    const { action, type } = actions[actionIndex];
    
    // Weighted random status
    const rand = Math.random();
    let statusIndex = 0;
    let sum = 0;
    for (let i = 0; i < statusWeights.length; i++) {
      sum += statusWeights[i];
      if (rand < sum) {
        statusIndex = i;
        break;
      }
    }
    
    return {
      id: `log-${i}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time in the last 7 days
      action,
      user: users[Math.floor(Math.random() * users.length)],
      details: `Details for ${action.toLowerCase()}`,
      status: statuses[statusIndex] as "success" | "warning" | "error",
      type,
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by timestamp, newest first
};

const Logs = () => {
  const { isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to fetch logs
    const fetchLogs = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockLogs = generateMockLogs(50);
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setIsLoading(false);
    };
    
    fetchLogs();
  }, []);
  
  // Apply filters when filter state changes
  useEffect(() => {
    let result = logs;
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.action.toLowerCase().includes(query) || 
        log.user.toLowerCase().includes(query) || 
        log.details.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(log => log.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(log => log.status === statusFilter);
    }
    
    setFilteredLogs(result);
  }, [logs, searchQuery, typeFilter, statusFilter]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockLogs = generateMockLogs(50);
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
    setIsLoading(false);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'encryption':
        return <Lock className="h-4 w-4" />;
      case 'decryption':
        return <Shield className="h-4 w-4" />;
      case 'scan':
        return <FileSearch className="h-4 w-4" />;
      case 'user':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground mt-1">Track and monitor all security-related activities</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <Card className="mb-6 glass card-glow">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <Select
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="encryption">Encryption</SelectItem>
                    <SelectItem value="decryption">Decryption</SelectItem>
                    <SelectItem value="scan">Scan</SelectItem>
                    <SelectItem value="user">User Activity</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date Range
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Last 24 hours</DropdownMenuItem>
                    <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                    <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                    <DropdownMenuItem>Custom range...</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass card-glow">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                <ClipboardList className="inline-block h-5 w-5 mr-2" />
                Log Entries
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {logs.length} entries
              </div>
            </div>
            <CardDescription>
              Detailed records of all security activities and events
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-opacity-50 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading activity logs...</p>
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium">No logs found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">
                        <div className="flex items-center">
                          Timestamp
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Action
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {getTypeIcon(log.type)}
                            </div>
                            <span>{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {log.details}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Logs;
