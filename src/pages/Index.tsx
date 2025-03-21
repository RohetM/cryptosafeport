
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Lock, Shield, FileSearch, ClipboardList, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Lock className="h-10 w-10 text-primary" />,
      title: "Secure Encryption",
      description: "Military-grade encryption to protect your sensitive data with unbreakable security."
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Advanced Decryption",
      description: "Easily decrypt your secured files with proper authentication and permissions."
    },
    {
      icon: <FileSearch className="h-10 w-10 text-primary" />,
      title: "Threat Scanning",
      description: "Detect and prevent malware, ransomware, and other threats with deep file analysis."
    },
    {
      icon: <ClipboardList className="h-10 w-10 text-primary" />,
      title: "Activity Monitoring",
      description: "Comprehensive logs to track and audit all security-related activities."
    }
  ];

  const benefits = [
    "End-to-end encryption for all your data",
    "Intuitive and user-friendly interface",
    "Regular security updates",
    "Cross-platform compatibility",
    "Advanced access control",
    "Multi-factor authentication"
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left animate-slide-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                Secure Your Digital Assets with Confidence
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                CryptoSafePort provides enterprise-grade encryption, decryption, and threat detection to protect your most valuable digital assets.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <Button size="lg" asChild>
                    <Link to="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link to="/register">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="glass card-glow rounded-2xl p-1 animate-float">
                <div className="bg-background/40 rounded-2xl p-6 backdrop-blur-md">
                  <div className="aspect-square rounded-lg bg-primary/5 flex items-center justify-center">
                    <Lock className="h-24 w-24 text-primary/90" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
            </div>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/5 translate-x-1/3 translate-y-1/3" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Comprehensive Security Suite</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our platform provides a complete set of tools to protect your digital assets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass card-glow rounded-xl p-6 transition-all hover:translate-y-[-5px] duration-300"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose CryptoSafePort?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We've built our platform with security, simplicity, and performance in mind.
              </p>
              
              <div className="mt-8 space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <p>{benefit}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                {!isAuthenticated && (
                  <Button size="lg" asChild>
                    <Link to="/register">Get Started Now</Link>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="glass card-glow rounded-2xl overflow-hidden">
                <div className="aspect-video bg-background/40 backdrop-blur-md">
                  {/* This would be a video or image showcasing the product */}
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <Shield className="h-16 w-16 text-primary mx-auto" />
                      <p className="mt-4 text-lg font-medium">Platform Preview</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        An interactive demo of the CryptoSafePort dashboard
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 -z-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Secure Your Digital Assets?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start protecting your critical data today with our comprehensive security platform.
          </p>
          <div className="mt-10">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/register">Create an Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Lock className="h-5 w-5" />
              <span className="font-medium">CryptoSafePort</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CryptoSafePort. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
