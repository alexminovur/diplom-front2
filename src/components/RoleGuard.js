import React from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

const RoleGuard = ({ allowedRoles, children }) => {
    const toast = useToast();
    const userRole = localStorage.getItem('role');

    if (!allowedRoles.includes(userRole)) {
        toast({
            title: 'Доступ запрещен',
            description: 'У вас нет прав для просмотра этой страницы',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleGuard;
