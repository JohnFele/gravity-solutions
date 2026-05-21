import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

const getGoogleIdentityState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!window.__googleIdentityState) {
    window.__googleIdentityState = {
      initialized: false,
      clientId: null,
      context: null,
      activeHandler: null,
    };
  }

  return window.__googleIdentityState;
};

const waitForGoogle = (timeoutMs = 6000, intervalMs = 50) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(timer);
        reject(new Error("Google Identity Services not available"));
      }
    }, intervalMs);
  });

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const IS_DEV = import.meta.env.VITE_ENV === "development";

export default function GoogleOneTap({ enabled = true, promptKey }) {
  const { isAuthenticated, authReady, googleLogin, loading } = useAuth();

  const initializedRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const shouldRun = enabled && authReady && !isAuthenticated && !loading;

    if (!shouldRun) return;

    const initAndPrompt = async () => {
      try {
        if (!GOOGLE_CLIENT_ID) {
          if (IS_DEV) console.warn("[OneTap] Missing VITE_GOOGLE_CLIENT_ID");
          return;
        }

        await waitForGoogle();

        if (cancelledRef.current) return;

        const googleIdentityState = getGoogleIdentityState();
        if (!googleIdentityState) return;

        googleIdentityState.activeHandler = async (res) => {
          const cred = res?.credential;
          if (!cred) {
            if (IS_DEV) console.warn("[OneTap] No credential received");
            return;
          }

          const response = await googleLogin(cred);

          if (response.success) {
            try {
              window.google.accounts.id.cancel();
            } catch {
              if (IS_DEV) console.warn("[OneTap] Failed to cancel One Tap");
            }
          }
        };

        if (!googleIdentityState.initialized && !initializedRef.current) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              const sharedState = getGoogleIdentityState();
              if (typeof sharedState?.activeHandler === "function") {
                sharedState.activeHandler(response);
              }
            },
            use_fedcm_for_prompt: true,
          });

          googleIdentityState.initialized = true;
          googleIdentityState.clientId = GOOGLE_CLIENT_ID;
          googleIdentityState.context = "signin";
          initializedRef.current = true;
        }

        window.google.accounts.id.prompt();
      } catch (e) {
        if (IS_DEV) console.warn("[OneTap] initAndPrompt failed", e);
      }
    };

    initAndPrompt();

    return () => {
      cancelledRef.current = true;
      const googleIdentityState = getGoogleIdentityState();
      if (googleIdentityState?.activeHandler) {
        googleIdentityState.activeHandler = null;
      }
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        // ignore
      }
    };
  }, [enabled, authReady, isAuthenticated, loading, googleLogin, promptKey]);

  return null;
}
