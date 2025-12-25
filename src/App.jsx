import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-3xl">Dashboard Coming Soon...</h1>
    </div>
  ) : (
    <Login />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
