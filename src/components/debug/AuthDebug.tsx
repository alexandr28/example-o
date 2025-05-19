
import { useAuthContext } from '../../context/AuthContext';

const AuthDebug = () => {
  const auth = useAuthContext();
  
  return (
    <div className="fixed bottom-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs">
      <div>isAuthenticated: {auth.isAuthenticated ? 'true' : 'false'}</div>
      <div>loading: {auth.loading ? 'true' : 'false'}</div>
      <div>error: {auth.error || 'none'}</div>
      <div>user: {auth.user ? auth.user.username : 'none'}</div>
      <div>path: {window.location.pathname}</div>
    </div>
  );
};

export default AuthDebug;