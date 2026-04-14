import React, { useState } from 'react';
import {
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    Alert,
    AlertIcon,
    VStack,
    Text,
    useToast,
    Link,
    Flex
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1); // 1 - ввод email, 2 - ввод кода
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();

    const handleStartLogin = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Введите email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Введите корректный email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login/start', { email });
            setSessionId(response.data.session_id);
            setStep(2);

            toast({
                title: 'Код отправлен',
                description: 'Проверьте ваш email',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Пользователь не найден');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!code) {
            setError('Введите код верификации');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login/verify', {
                session_id: sessionId,
                code
            });

            const { access_token, role } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role);

            toast({
                title: 'Успешный вход',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Перенаправляем на соответствующий дашборд
            switch(role) {
                case 'admin':
                    navigate('/dashboard/admin');
                    break;
                case 'manager':
                    navigate('/dashboard/manager');
                    break;
                case 'master':
                    navigate('/dashboard/master');
                    break;
                default:
                    navigate('/dashboard/client');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Неверный код');
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setStep(1);
        setEmail('');
        setCode('');
        setSessionId(null);
        setError('');
    };

    return (
        <Box maxW="400px" mx="auto" mt={12}>
            <Heading textAlign="center" mb={8} color="brand.800">
                Вход в систему
            </Heading>

            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            {step === 1 && (
                <form onSubmit={handleStartLogin}>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </FormControl>

                        <Button
                            colorScheme="orange"
                            type="submit"
                            isLoading={loading}
                            width="100%"
                            size="lg"
                        >
                            Продолжить
                        </Button>

                        <Text fontSize="sm" color="gray.500">
                            Нет аккаунта?{' '}
                            <Link as={RouterLink} to="/register" color="orange.500">
                                Зарегистрируйтесь
                            </Link>
                        </Text>
                    </VStack>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerify}>
                    <VStack spacing={4}>
                        <Heading size="md" textAlign="center">
                            Введите код подтверждения
                        </Heading>

                        <Text textAlign="center" color="gray.600">
                            Мы отправили код на {email}. Введите его ниже:
                        </Text>

                        <FormControl isRequired>
                            <FormLabel>Код подтверждения</FormLabel>
                            <Input
                                type="text"
                                value={code}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                    setCode(value);
                                }}
                                placeholder="Введите 6-значный код"
                                maxLength={6}
                                size="lg"
                                textAlign="center"
                                fontSize="xl"
                                letterSpacing="wider"
                            />
                        </FormControl>

                        <Button
                            colorScheme="orange"
                            type="submit"
                            isLoading={loading}
                            width="100%"
                            size="lg"
                        >
                            Подтвердить
                        </Button>

                        <Flex justifyContent="space-between" width="100%">
                            <Button
                                variant="link"
                                onClick={resetFlow}
                                color="gray.500"
                            >
                                Изменить email
                            </Button>
                        </Flex>
                    </VStack>
                </form>
            )}
        </Box>
    );
};

export default Login;
