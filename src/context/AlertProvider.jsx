import { useState, useCallback, useMemo } from 'react';
import { AlertContext } from './AlertContext';
import Alert from '../components/alert/Alert';

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, options = {}) => {
    // Support both showAlert("message", options) and showAlert({ ...alertOptions }).
    if (message && typeof message === 'object' && !Array.isArray(message)) {
      setAlert(message);
      return;
    }

    setAlert({ message, ...options });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const contextValue = useMemo(() => ({ showAlert, hideAlert }), [showAlert, hideAlert]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={alert.onClose || hideAlert}
          actionText={alert.actionText}
          onAction={alert.onAction}
          position={alert.position}
          duration={alert.duration}
          showClose={alert.showClose}
        />
      )}
    </AlertContext.Provider>
  );
};