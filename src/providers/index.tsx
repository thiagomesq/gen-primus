import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ReactNode } from "react";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { RouteProvider } from "@/providers/RouteProvider";


export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
      <LoadingProvider>
        <AuthProvider>
          <RouteProvider>
            {children}
          </RouteProvider>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}