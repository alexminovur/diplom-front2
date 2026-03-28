import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Box textAlign="center" py={20}>
            <Heading size="2xl" mb={4} color="brand.700">
                404
            </Heading>
            <Text fontSize="xl" mb={8}>
                Страница не найдена
            </Text>
            <Button
                colorScheme="orange"
                size="lg"
                onClick={() => navigate('/')}
            >
                Вернуться на главную
            </Button>
        </Box>
    );
};

export default NotFound;
