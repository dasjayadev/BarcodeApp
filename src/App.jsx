import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { publicRoutes, protectedRoutes, ProtectedRoute } from './routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          toastOptions={{
            duration: 5000,
          }}
          // position="top-right"
          // toastOptions={{
          //   // Default toast options
          //   duration: 5000,
          //   style: {
          //     background: '#fff',
          //     color: '#333',
          //   },
          //   // Custom success toast styling
          //   success: {
          //     style: {
          //       background: '#e6f7ef',
          //       border: '1px solid #84e1bc',
          //       color: '#0a6640',
          //     },
          //     iconTheme: {
          //       primary: '#0a6640',
          //       secondary: '#e6f7ef',
          //     },
          //   },
          //   // Custom error toast styling  
          //   error: {
          //     style: {
          //       background: '#fff1f0',
          //       border: '1px solid #ffa39e',
          //       color: '#a8071a',
          //     },
          //     iconTheme: {
          //       primary: '#a8071a',
          //       secondary: '#fff1f0',
          //     },
          //   },
          // }}
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
  );
}

export default App;