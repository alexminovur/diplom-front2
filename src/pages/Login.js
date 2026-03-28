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
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';
import api from '../services/api';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [step, setStep] = useState(1); // 1 - ввод телефона, 2 - выбор метода, 3 - ввод кода
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    // Шаг 1: Начало авторизации
    const handleStartLogin = async () => {
        if (!phone) {
            setError('Введите номер телефона');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login/start', { phone });
            setSessionId(response.data.session_id);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || 'Пользователь не найден');
        } finally {
            setLoading(false);
        }
    };

    // Шаг 2: Выбор метода получения кода
    const handleSelectMethod = async (method) => {
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/login/select-method', {
                session_id: sessionId,
                method
            });

            setStep(3);
            toast({
                title: 'Код отправлен',
                description: `Код отправлен через ${method === 'sms' ? 'SMS' : 'Telegram'}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка отправки кода');
        } finally {
            setLoading(false);
        }
    };

    // Шаг 3: Верификация кода
    const handleVerify = async () => {
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

            const { token, role } = response.data;

            localStorage.setItem('token', token);
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
                    navigate('/dashboard/customer');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Неверный код');
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setStep(1);
        setPhone('');
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
                <VStack spacing={4}>
                    <FormControl isRequired>
                        <FormLabel>Номер телефона</FormLabel>
                        <PhoneInput
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </FormControl>

                    <Button
                        colorScheme="orange"
                        onClick={handleStartLogin}
                        isLoading={loading}
                        width="100%"
                    >
                        Продолжить
                    </Button>
                </VStack>
            )}

            {step === 2 && (
                <VStack spacing={6}>
                    <Heading size="md">Как получить код?</Heading>

                    <Tabs isFitted variant="enclosed" width="100%">
                        <TabList mb="1em">
                            <Tab>SMS</Tab>
                            <Tab>Telegram</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Button
                                    colorScheme="orange"
                                    onClick={() => handleSelectMethod('sms')}
                                    isLoading={loading}
                                    width="100%"
                                >
                                    Отправить код по SMS
                                </Button>
                            </TabPanel>
                            <TabPanel>
                                <Button
                                    colorScheme="orange"
                                    onClick={() => handleSelectMethod('tg')}
                                    isLoading={loading}
                                    width="100%"
                                >
                                    Отправить код в Telegram
                                </Button>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                    <Button
                        variant="link"
                        onClick={resetFlow}
                    >
                        Изменить номер
                    </Button>
                </VStack>
            )}

            {step === 3 && (
                <VStack spacing={4}>
                    <FormControl isRequired>
                        <FormLabel>Код верификации</FormLabel>
                        <Input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Введите код"
                            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                        />
                    </FormControl>

                    <Button
                        colorScheme="orange"
                        onClick={handleVerify}
                        isLoading={loading}
                        width="100%"
                    >
                        Подтвердить
                    </Button>

                    <Button
                        variant="link"
                        onClick={() => setStep(2)}
                    >
                        Назад
                    </Button>
                </VStack>
            )}
        </Box>
    );
};

export default Login;
