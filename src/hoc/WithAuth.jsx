import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import LoadingSpinner from '../components/LoadingSpinner';

// eslint-disable-next-line no-unused-vars
const withAuth = (WrappedComponent) => {
  return (props) => {
    const { profileData, fetchProfile } = useAuth();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        if (profileData) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        try {
          if (!profileData) {
            let data = profileData;

            if (!data) {
              data = await fetchProfile();
            }
             
            if (!data) {
              showAlert('You are not logged in.', {
                type: 'error',
                duration: 5000
              });
              
              navigate('/auth/login');

              return;
            }
          }
          setIsAuthorized(true);
        } catch (error) {
          console.error('Error during authentication check:', error);
          showAlert('You are not logged in.', {
            type: 'error',
            duration: 5000
          });
          navigate('/auth/login', { replace: true });
        } finally {
          setIsLoading(false);
        }
      } 

      checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileData, navigate]);
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;