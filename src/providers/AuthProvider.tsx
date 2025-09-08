'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { User } from '@/interfaces';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const signIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Verifica se o usuário já existe no Firestore
      const response = await fetch("/api/user?uid=" + user.uid, {
        method: 'GET'
      });
      const data = await response.json();

      if (!data.exists) {
        await fetch("/api/user", {
          method: 'POST',
          body: JSON.stringify({
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        router.push("/completar-perfil");
      }
      if (data.exists && data.user.perfil) {
        toast.success('Login realizado com sucesso!');
        router.push("/minha-arvore");
      } else {
        router.push("/completar-perfil");
      }
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      toast.error('Erro ao fazer login. Tente novamente.');
    }
  };

  const logOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        currentUser.getIdToken().then((idToken) => {
          setToken(idToken);
        });
        // Busca os dados do usuário no Firestore
        fetch("/api/user?uid=" + currentUser.uid, {
          method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
          if (data.exists) {
            setUser(data.user);
          } else {
            setUser(null);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Erro ao buscar dados do usuário:", error);
          setUser(null);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, token, signIn, logOut }}>
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