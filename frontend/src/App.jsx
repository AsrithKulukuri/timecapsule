import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CreateCapsule from './pages/CreateCapsule'
import CapsuleDetail from './pages/CapsuleDetail'
import Landing from './pages/Landing'

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useAuthStore()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        )
    }

    return user ? children : <Navigate to="/login" />
}

function App() {
    const { checkAuth } = useAuthStore()

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    return (
        <Router>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create"
                    element={
                        <ProtectedRoute>
                            <CreateCapsule />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/capsule/:id"
                    element={
                        <ProtectedRoute>
                            <CapsuleDetail />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    )
}

export default App
