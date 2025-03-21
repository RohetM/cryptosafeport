
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Lock, 
  Shield, 
  FileSearch, 
  LayoutDashboard,
  Users,
  FileLock2,
  FileCheck,
  Bell,
  Cpu,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  
  useEffect(() => {
    // Simulate loading progress
    const timer = setTimeout(() => {
      setProgress(100);
    }, 1000);
    
    // Simulate random CPU and memory usage updates
    const usageTimer = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 10);
      setMemoryUsage(Math.floor(Math.random() * 40) + 20);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(usageTimer);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const stats = [
    {
      title: "Protected Files",
      value: "128",
      icon: <FileLock2 className="h-4 w-4" />,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Scanned Files",
      value: "237",
      icon: <FileCheck className="h-4 w-4" />,
      change: "+18%",
      changeType: "positive"
    },
    {
      title: "Threats Detected",
      value: "3",
      icon: <Bell className="h-4 w-4" />,
      change: "-25%",
      changeType: "positive"
    },
    {
      title: "Active Users",
      value: "5",
      icon: <Users className="h-4 w-4" />,
      change: "+2",
      changeType: "positive"
    }
  ];

  const features = [
    {
      title: "Encryption",
      icon: <Lock className="h-12 w-12 text-primary" />,
      description: "Securely encrypt sensitive files and data",
      path: "/encrypt"
    },
    {
      title: "Decryption",
      icon: <Shield className="h-12 w-12 text-primary" />,
      description: "Decrypt files with proper authentication",
      path: "/decrypt"
    },
    {
      title: "Threat Scanning",
      icon: <FileSearch className="h-12 w-12 text-primary" />,
      description: "Scan files for potential security threats",
      path: "/scan"
    },
    {
      title: "Activity Logs",
      icon: <Activity className="h-12 w-12 text-primary" />,
      description: "View detailed logs of all security activities",
      path: "/logs"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.username}</h1>
            <p className="text-muted-foreground mt-1">Here's an overview of your security status</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link to="/encrypt">
                <Lock className="mr-2 h-4 w-4" />
                Encrypt New File
              </Link>
            </Button>
          </div>
        </div>

        {/* Security Status */}
        <Card className="mb-8 glass card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Security Status</CardTitle>
            <CardDescription>
              System protection level and overall security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Protection Level</span>
                  <span className="text-sm font-medium">
                    {progress === 100 ? "Protected" : "Scanning..."}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm font-medium">{cpuUsage}%</span>
                  </div>
                  <Progress value={cpuUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm font-medium">{memoryUsage}%</span>
                  </div>
                  <Progress value={memoryUsage} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass card-glow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                } mt-1`}>
                  {stat.change} from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <Link to={feature.path} key={index}>
              <Card className="h-full hover:shadow-md transition-all duration-300 hover:-translate-y-1 glass card-glow">
                <CardHeader className="pb-2">
                  <div className="flex justify-center mb-2">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-center text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="mb-8 glass card-glow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest security-related activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: <Lock className="h-4 w-4" />, action: "File encrypted", file: "financial_report.pdf", time: "2 hours ago" },
                { icon: <Shield className="h-4 w-4" />, action: "File decrypted", file: "project_notes.docx", time: "Yesterday" },
                { icon: <FileSearch className="h-4 w-4" />, action: "Threat scan completed", file: "system_scan", time: "2 days ago" },
                { icon: <Users className="h-4 w-4" />, action: "New user added", file: "alex@example.com", time: "5 days ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-4 mt-0.5 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.file}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
