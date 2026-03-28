import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardCustomer from './pages/DashboardCustomer';
import DashboardMaster from './pages/DashboardMaster';
import DashboardManager from './pages/DashboardManager';
import DashboardAdmin from './pages/DashboardAdmin';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import { ROLES } from './utils/roles';

function App() {
    return (
        <Router>
            <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
                <Header />
                <Box flex="1" p={4}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Защищенные роуты */}
                        <Route
                            path="/dashboard/customer"
                            element={
                                <ProtectedRoute>
                                    <RoleGuard allowedRoles={[ROLES.CUSTOMER]}>
                                        <DashboardCustomer />
                                    </RoleGuard>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/master"
                            element={
                                <ProtectedRoute>
                                    <RoleGuard allowedRoles={[ROLES.MASTER]}>
                                        <DashboardMaster />
                                    </RoleGuard>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/manager"
                            element={
                                <ProtectedRoute>
                                    <RoleGuard allowedRoles={[ROLES.MANAGER]}>
                                        <DashboardManager />
                                    </RoleGuard>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/admin"
                            element={
                                <ProtectedRoute>
                                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                                        <DashboardAdmin />
                                    </RoleGuard>
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Box>
                <Footer />
            </Box>
        </Router>
    );
}

export default App;
