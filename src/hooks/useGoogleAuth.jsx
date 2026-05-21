// hooks/useGoogleAuth.js
import { useState, useEffect, useCallback, useRef } from 'react';

const getGoogleIdentityState = () => {
  if (typeof window === 'undefined') {
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

const hasGoogleIdentityApi = () =>
  typeof window !== 'undefined' &&
  Boolean(window.google?.accounts?.id?.initialize) &&
  Boolean(window.google?.accounts?.id?.prompt);

export const useGoogleAuth = (options = {}) => {
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const isLegacyBoolean = typeof options === 'boolean';
  const autoPrompt = isLegacyBoolean ? options : (options.autoPrompt ?? true);
  const onCredential = isLegacyBoolean ? undefined : options.onCredential;
  const context = isLegacyBoolean ? 'signin' : (options.context ?? 'signin');

  const [isGoogleClientReady, setIsGoogleClientReady] = useState(false);
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);
  const [hasPromptShown, setHasPromptShown] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onCredentialRef = useRef(onCredential);
  const promptReadyFallbackRef = useRef(null);

  useEffect(() => {
    onCredentialRef.current = onCredential;

    const googleIdentityState = getGoogleIdentityState();
    if (googleIdentityState) {
      googleIdentityState.activeHandler = onCredential;
    }
  }, [onCredential]);

  const initializeGoogle = useCallback(() => {
    if (!CLIENT_ID || !hasGoogleIdentityApi()) return false;

    try {
      const googleIdentityState = getGoogleIdentityState();
      if (!googleIdentityState) return false;

      setIsGoogleClientReady(false);
      setIsGoogleInitialized(false);

      googleIdentityState.activeHandler = onCredentialRef.current;

      if (!googleIdentityState.initialized) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            const sharedState = getGoogleIdentityState();
            if (typeof sharedState?.activeHandler === 'function') {
              sharedState.activeHandler(response);
            }
          },
          ux_mode: 'popup',
          context,
          use_fedcm_for_prompt: true,
          use_fedcm_for_button: true,
        });

        googleIdentityState.initialized = true;
        googleIdentityState.clientId = CLIENT_ID;
        googleIdentityState.context = context;
      }

      setIsGoogleClientReady(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Identity:', error);
      setIsGoogleClientReady(false);
      setIsGoogleInitialized(false);
      return false;
    }
  }, [CLIENT_ID, context]);

  const showGooglePrompt = useCallback((onPromptFailure) => {
    if (isGoogleClientReady && hasGoogleIdentityApi()) {
      try {
        setHasPromptShown(true);
        window.google.accounts.id.prompt();

        promptReadyFallbackRef.current = window.setTimeout(() => {
          setIsGoogleInitialized(true);
          promptReadyFallbackRef.current = null;
        }, 1800);

        return true;
      } catch (error) {
        console.error('Failed to show Google prompt:', error);
        if (typeof onPromptFailure === 'function') {
          onPromptFailure();
        }
        return false;
      }
    }
    return false;
  }, [isGoogleClientReady]);

  const triggerGoogleLogin = useCallback((onPromptFailure) => {
    if (isGoogleInitialized) {
      return showGooglePrompt(onPromptFailure);
    }
    return false;
  }, [isGoogleInitialized, showGooglePrompt]);

  useEffect(() => {
    if (!CLIENT_ID) {
      console.error('Google Client ID not found');
      return;
    }

    if (hasGoogleIdentityApi()) {
      initializeGoogle();
    } else {
      const handleGoogleLoaded = () => initializeGoogle();
      window.addEventListener('google-loaded', handleGoogleLoaded, { once: true });

      return () => {
        if (promptReadyFallbackRef.current) {
          clearTimeout(promptReadyFallbackRef.current);
          promptReadyFallbackRef.current = null;
        }
        const googleIdentityState = getGoogleIdentityState();
        if (googleIdentityState?.activeHandler === onCredentialRef.current) {
          googleIdentityState.activeHandler = null;
        }
        window.removeEventListener('google-loaded', handleGoogleLoaded);
      };
    }

    return () => {
      if (promptReadyFallbackRef.current) {
        clearTimeout(promptReadyFallbackRef.current);
        promptReadyFallbackRef.current = null;
      }
      const googleIdentityState = getGoogleIdentityState();
      if (googleIdentityState?.activeHandler === onCredentialRef.current) {
        googleIdentityState.activeHandler = null;
      }
    };
  }, [CLIENT_ID, initializeGoogle]);

  useEffect(() => {
    if (autoPrompt && isGoogleClientReady && !hasPromptShown) {
      const timer = setTimeout(() => {
        showGooglePrompt();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoPrompt, isGoogleClientReady, hasPromptShown, showGooglePrompt]);

  return {
    isGoogleInitialized,
    isGoogleLoading,
    triggerGoogleLogin,
    setIsGoogleLoading,
  };
};
