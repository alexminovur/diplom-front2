import React from 'react';
import { Box, Container, Text, Link } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box bg="brand.800" color="white" py={4} mt={8}>
            <Container maxW="container.xl" textAlign="center">
                <Text>&copy; {new Date().getFullYear()} Сервис Ремонта Бытовой Техники</Text>
                <Text fontSize="sm" mt={2}>
                    Контакты: <Link color="orange.200" href="tel:+79999999999">+7 (999) 999-99-99</Link>
                </Text>
            </Container>
        </Box>
    );
};

export default Footer;
