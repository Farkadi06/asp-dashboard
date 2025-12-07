"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Session data structure (client-safe, no sensitive info)
 */
export interface SessionData {
  authenticated: boolean;
  email?: string;
  tenant?: {
    name: string;
    slug: string;
  } | null;
}

/**
 * Session context value
 */
interface SessionContextType {
  session: SessionData;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * SessionProvider Props
 */
interface SessionProviderProps {
  initialSession: SessionData;
  children: ReactNode;
}

/**
 * SessionProvider Component
 * 
 * Provides session state to client components.
 * Initial session comes from server-side fetch.
 * 
 * ⚠️ DO NOT store sensitive info (API keys, tokens, etc.)
 * Only display fields: email, tenant name, authenticated status
 */
export function SessionProvider({ initialSession, children }: SessionProviderProps) {
  const [session, setSession] = useState<SessionData>(initialSession);

  /**
   * Refresh session from server
   * Calls /api/internal/session (to be implemented in step 1.6)
   */
  async function refreshSession() {
    try {
      const res = await fetch("/api/internal/session", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to refresh session: ${res.status}`);
      }

      const data = await res.json();
      setSession({
        authenticated: data.authenticated || false,
        email: data.email,
        tenant: data.tenant || null,
      });
    } catch (error) {
      console.error("[SessionProvider] Failed to refresh session:", error);
      // On error, mark as unauthenticated
      setSession({
        authenticated: false,
        email: undefined,
        tenant: null,
      });
    }
  }

  /**
   * Logout current session
   * Calls /api/internal/logout (to be implemented in step 1.6)
   */
  async function logout() {
    try {
      await fetch("/api/internal/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear local session state
      setSession({
        authenticated: false,
        email: undefined,
        tenant: null,
      });

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("[SessionProvider] Failed to logout:", error);
      // Even on error, redirect to login
      window.location.href = "/login";
    }
  }

  return (
    <SessionContext.Provider value={{ session, refreshSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * useSession Hook
 * 
 * Access session state and actions from client components.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, logout } = useSession();
 *   
 *   return (
 *     <div>
 *       {session.authenticated && <p>Welcome, {session.email}</p>}
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  
  return context;
}

