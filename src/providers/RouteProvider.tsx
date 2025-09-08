'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Route, User } from "@/interfaces";
import { GitFork, Search, User2 } from "lucide-react";
import { FaCog } from "react-icons/fa";

interface RouteContextType {
  routes: Route[];
  checkRoute: (route: string) => boolean;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [isCreationPending, setIsCreationPending] = useState(false);

  const routes: Route[] = [
    { name: 'Pesquisa', href: "/pesquisa", icon: Search, auth: true },
    { name: '', href: "/completar-perfil", icon: null, auth: isCreationPending },
    { name: 'Perfil', href: "/perfil", icon: User2, auth: isUser },
    { name: 'Minha Árvore', href: "/minha-arvore", icon: GitFork, auth: isUser },
    { name: 'Dashboard', href: "/dashboard", icon: FaCog, auth: isAdmin },
  ];

  const checkRoute = (route: string) => {
    const foundRoute = routes.find(r => r.href === route);
    return foundRoute !== undefined && foundRoute.auth;
  };

  useEffect(() => {
    const getUserDB = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsUser(false);
        setIsCreationPending(false);
      } else {
        const response = await fetch("/api/user?uid=" + user?.uid, {
          method: 'GET'
        });
        const data = await response.json() as User;
        setIsAdmin(data.admin);
        setIsUser(!data.perfil);
        setIsCreationPending(!data.perfil);
      }
    };
    getUserDB();
  }, [user]);

  return (
    <RouteContext.Provider value={{ routes, checkRoute }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => {
  const routeContext = useContext(RouteContext);
  if (routeContext === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return routeContext;
};