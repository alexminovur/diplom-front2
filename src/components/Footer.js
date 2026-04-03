import React from 'react';
import { Box, Container, Text, Link } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box bg="brand.800" color="white" py={4} mt={8}>
            <Container maxW="container.xl" textAlign="center">
                <Text>&copy; {new Date().getFullYear()} Сервис Ремонта Бытовой Техники</Text>
                <Text fontSize="sm" mt={2}>
                    Контакты: <Link color="orange.200" href="tel:+78005553535">8 (800) 555-35-35</Link>
                </Text>
            </Container>
        </Box>
    );
};

export default Footer;
