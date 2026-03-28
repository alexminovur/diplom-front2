import React from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
    const toast = useToast();
    const token = localStorage.getItem('token');

    if (!token) {
        toast({
            title: 'Необходима авторизация',
            status: 'warning',
            duration: 3000,
            isClosable: true,
        });
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
