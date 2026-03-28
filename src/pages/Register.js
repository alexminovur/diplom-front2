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
    useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';

const Register = () => {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!phone || !name) {
            setError('Заполните все поля');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Здесь будет вызов API для регистрации
            // Пока просто перенаправляем на логин
            toast({
                title: 'Регистрация успешна',
                description: 'Теперь вы можете войти в систему',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="400px" mx="auto" mt={12}>
            <Heading textAlign="center" mb={8} color="brand.800">
                Регистрация
            </Heading>

            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
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
                        <FormLabel>Номер телефона</FormLabel>
                        <PhoneInput
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </FormControl>

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                        После регистрации вы получите роль "Заказчик".
                        Администратор сможет изменить вашу роль при необходимости.
                    </Text>

                    <Button
                        colorScheme="orange"
                        type="submit"
                        isLoading={loading}
                        width="100%"
                    >
                        Зарегистрироваться
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};

export default Register;
