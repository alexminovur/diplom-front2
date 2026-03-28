import React from 'react';
import {
    Box,
    Heading,
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    useToast
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const isAuthenticated = !!localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
        toast({
            title: 'Вы вышли из системы',
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
    };

    const getDashboardPath = () => {
        switch(userRole) {
            case 'admin': return '/dashboard/admin';
            case 'manager': return '/dashboard/manager';
            case 'master': return '/dashboard/master';
            case 'customer': return '/dashboard/customer';
            default: return '/';
        }
    };

    return (
        <Box bg="brand.700" color="white" p={4} boxShadow="md">
            <Flex justifyContent="space-between" alignItems="center">
                <Heading
                    size="md"
                    cursor="pointer"
                    onClick={() => navigate('/')}
                >
                    🔧 Сервис Ремонта
                </Heading>

                {isAuthenticated ? (
                    <Flex alignItems="center" gap={2}>
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="orange"
                            onClick={() => navigate(getDashboardPath())}
                        >
                            Личный кабинет
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    </Flex>
                ) : (
                    <Flex gap={2}>
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="orange"
                            onClick={() => navigate('/login')}
                        >
                            Вход
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="orange"
                            onClick={() => navigate('/register')}
                        >
                            Регистрация
                        </Button>
                    </Flex>
                )}
            </Flex>
        </Box>
    );
};

export default Header;
