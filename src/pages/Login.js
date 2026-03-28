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
    const [step, setStep] = useState(1); // 1 - ввод телефона, 2 - ввод кода
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    const handleSendCode = async () => {
        if (!phone) {
            setError('Введите номер телефона');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/send-code', { phone, method: 'sms' });
            setStep(2);
            toast({
                title: 'Код отправлен',
                description: 'Проверьте SMS или Telegram',
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

    const handleVerify = async () => {
        if (!code) {
            setError('Введите код верификации');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/verify', { phone, code });
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
            setError(err.response?.data?.detail || 'Ошибка верификации');
        } finally {
            setLoading(false);
        }
    };

    const handleMethodSelect = async (method) => {
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/send-code', { phone, method });
            setStep(2);
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

            {step === 1 ? (
                <VStack spacing={4}>
                    <FormControl>
                        <FormLabel>Номер телефона</FormLabel>
                        <PhoneInput
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </FormControl>

                    <Button
                        colorScheme="orange"
                        onClick={handleSendCode}
                        isLoading={loading}
                        width="100%"
                    >
                        Отправить код
                    </Button>
                </VStack>
            ) : (
                <VStack spacing={4}>
                    <Tabs isFitted variant="enclosed">
                        <TabList mb="1em">
                            <Tab>SMS</Tab>
                            <Tab>Telegram</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Button
                                    onClick={() => handleMethodSelect('sms')}
                                    isLoading={loading}
                                    width="100%"
                                >
                                    Отправить код по SMS
                                </Button>
                            </TabPanel>
                            <TabPanel>
                                <Button
                                    onClick={() => handleMethodSelect('telegram')}
                                    isLoading={loading}
                                    width="100%"
                                >
                                    Отправить код в Telegram
                                </Button>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                    <FormControl>
                        <FormLabel>Код верификации</FormLabel>
                        <Input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Введите код"
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
                        onClick={() => setStep(1)}
                    >
                        Изменить номер
                    </Button>
                </VStack>
            )}
        </Box>
    );
};

export default Login;
