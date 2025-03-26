
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

interface StoredUser extends User {
  passwordHash: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hash function for passwords (in a real app, use a proper hashing library)
const hashPassword = (password: string): string => {
  // This is a very simple hash for demonstration - never use this in production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        // Only extract the public user data (no password)
        setUser({
          id: parsedUser.id,
          username: parsedUser.username,
          email: parsedUser.email
        });
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Get all registered users
  const getUsers = (): StoredUser[] => {
    const usersData = localStorage.getItem('registeredUsers');
    return usersData ? JSON.parse(usersData) : [];
  };

  // Save users
  const saveUsers = (users: StoredUser[]): void => {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  };

  // Login function - properly validates email and password
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get all users and find the matching one
      const users = getUsers();
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.passwordHash === hashPassword(password)
      );
      
      if (!foundUser) {
        console.log("Login failed: Invalid email or password");
        setIsLoading(false);
        return false;
      }

      // Create user session without the password
      const userData = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email
      };
      
      setUser(userData);
      
      // Store only the necessary user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user-specific data namespace
      localStorage.setItem('currentUserId', foundUser.id);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error('Login failed:', error);
      return false;
    }
  };

  // Register function - stores users securely
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get existing users
      const users = getUsers();
      
      // Check if email is already registered
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        console.log("Registration failed: Email already exists");
        setIsLoading(false);
        return false;
      }
      
      // Create a new user with hashed password
      const newUserId = Date.now().toString();
      const newUser: StoredUser = {
        id: newUserId,
        username,
        email,
        passwordHash: hashPassword(password)
      };
      
      // Add to registered users
      users.push(newUser);
      saveUsers(users);
      
      // Create user session without the password
      const userData = {
        id: newUserId,
        username,
        email
      };
      
      setUser(userData);
      
      // Store only the necessary user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user-specific data namespace
      localStorage.setItem('currentUserId', newUserId);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error('Registration failed:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
