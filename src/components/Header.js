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
            case 'client': return '/dashboard/client';
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
                    🔧 Сервис от Лехи  🔧
                </Heading>

                {isAuthenticated ? (
                    <Flex alignItems="center" gap={3}>
                        <Button
                            size="sm"
                            colorScheme="orange"
                            variant="solid"
                            onClick={() => navigate(getDashboardPath())}
                            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                            _hover={{
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                            transition="all 0.2s"
                        >
                            Личный кабинет
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="red"
                            variant="solid"
                            onClick={handleLogout}
                            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                            _hover={{
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                            transition="all 0.2s"
                        >
                            Выйти
                        </Button>
                    </Flex>
                ) : (
                    <Flex gap={3}>
                        <Button
                            size="sm"
                            colorScheme="orange"
                            variant="solid"
                            onClick={() => navigate('/login')}
                            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                            _hover={{
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                            transition="all 0.2s"
                            fontWeight="medium"
                        >
                            Вход
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="yellow"
                            variant="solid"
                            borderColor="orange.300"
                            onClick={() => navigate('/register')}
                            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                            _hover={{
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                bgColor: 'orange.50'
                            }}
                            transition="all 0.2s"
                            fontWeight="medium"
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
