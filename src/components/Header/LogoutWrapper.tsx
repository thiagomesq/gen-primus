'use client';

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutWrapper() {
    const { logOut } = useAuth();

    return (
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={logOut}>
            <LogOut size={16} />
            <span>Sair</span>
        </Button>
    )
}