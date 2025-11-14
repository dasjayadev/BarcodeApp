import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { publicRoutes, protectedRoutes, ProtectedRoute } from './routes';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/Common/Error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />
        <Routes>
          {/* Public routes */}
          {publicRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* Protected routes */}
          {protectedRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute requiredRoles={route.requiredRoles}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;