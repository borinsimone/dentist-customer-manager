import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

// Password demo (in produzione sarà gestita da Supabase)
const DEMO_USER = {
  email: "demo@studio.it",
  password: "demo123",
  name: "Studio Dentistico",
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Controlla se c'è una sessione salvata
    const savedUser = localStorage.getItem("dentist_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    // Simulazione login - in produzione useremo Supabase Auth
    if (
      email === DEMO_USER.email &&
      password === DEMO_USER.password
    ) {
      const user = {
        id: "1",
        email: DEMO_USER.email,
        name: DEMO_USER.name,
      };
      setUser(user);
      localStorage.setItem(
        "dentist_user",
        JSON.stringify(user)
      );
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dentist_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }
  return context;
};
