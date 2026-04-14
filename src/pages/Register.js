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

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1 - ввод данных, 2 - ввод кода
    const [sessionId, setSessionId] = useState(null);
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name || !email) {
            setError('Заполните все поля');
            return;
        }

        // Простая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Введите корректный email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Начинаем регистрацию
            const response = await api.post('/auth/register/start', {
                name,
                email
            });

            setSessionId(response.data.session_id);
            setStep(2); // Переходим к вводу кода

            toast({
                title: 'Регистрация начата',
                description: 'Код отправлен на ваш email',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });

        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!code) {
            setError('Введите код подтверждения');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register/verify', {
                session_id: sessionId,
                code
            });

            const { access_token, role } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role);

            toast({
                title: 'Регистрация успешна!',
                description: 'Добро пожаловать в систему',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Перенаправляем на дашборд клиента
            navigate('/dashboard/client');

        } catch (err) {
            setError(err.response?.data?.detail || 'Неверный код');
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setStep(1);
        setName('');
        setEmail('');
        setCode('');
        setSessionId(null);
        setError('');
    };

    return (
        <Box maxW="400px" mx="auto" mt={8} mb={8}>
            <Heading textAlign="center" mb={8} color="brand.800">
                Регистрация
            </Heading>

            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            {/* Шаг 1: Ввод данных */}
            {step === 1 && (
                <form onSubmit={handleRegister}>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Имя</FormLabel>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Введите ваше имя"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </FormControl>

                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            После регистрации вы получите роль "Клиент".
                            Администратор сможет изменить вашу роль при необходимости.
                        </Text>

                        <Button
                            colorScheme="orange"
                            type="submit"
                            isLoading={loading}
                            width="100%"
                            size="lg"
                        >
                            Зарегистрироваться
                        </Button>

                        <Text fontSize="sm" color="gray.500">
                            Уже есть аккаунт?{' '}
                            <Link as={RouterLink} to="/login" color="orange.500">
                                Войдите
                            </Link>
                        </Text>
                    </VStack>
                </form>
            )}

            {/* Шаг 2: Ввод кода */}
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
                                Начать заново
                            </Button>
                        </Flex>
                    </VStack>
                </form>
            )}
        </Box>
    );
};

export default Register;
