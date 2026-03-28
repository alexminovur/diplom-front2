import React from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    Container,
    VStack,
    Grid,
    GridItem,
    Card,
    CardBody,
    CardHeader,
    Icon
} from '@chakra-ui/react';
import {
    FaTools,
    FaClock,
    FaShieldAlt,
    FaHeadset
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: FaTools,
            title: "Профессиональный ремонт",
            description: "Наши мастера имеют большой опыт в ремонте бытовой техники"
        },
        {
            icon: FaClock,
            title: "Быстрое выполнение",
            description: "Соблюдаем сроки и выполняем работы в кратчайшие сроки"
        },
        {
            icon: FaShieldAlt,
            title: "Гарантия качества",
            description: "Предоставляем гарантию на все виды выполненных работ"
        },
        {
            icon: FaHeadset,
            title: "Поддержка 24/7",
            description: "Круглосуточная поддержка и консультации специалистов"
        }
    ];

    return (
        <Container maxW="container.xl" py={8}>
            {/* Hero Section */}
            <Box
                textAlign="center"
                py={16}
                bg="brand.100"
                borderRadius="lg"
                mb={12}
            >
                <Heading
                    size="2xl"
                    color="brand.800"
                    mb={4}
                >
                    Ремонт Бытовой Техники
                </Heading>
                <Text fontSize="xl" mb={8} color="brand.700">
                    Профессиональный сервис с гарантией качества
                </Text>
                <Button
                    colorScheme="orange"
                    size="lg"
                    onClick={() => navigate('/register')}
                >
                    Оставить заявку
                </Button>
            </Box>

            {/* Features */}
            <VStack spacing={12} mb={12}>
                <Heading textAlign="center" color="brand.800">
                    Почему выбирают нас?
                </Heading>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
                    {features.map((feature, index) => (
                        <GridItem key={index}>
                            <Card height="100%">
                                <CardHeader textAlign="center">
                                    <Icon
                                        as={feature.icon}
                                        w={12}
                                        h={12}
                                        color="brand.600"
                                        mb={4}
                                    />
                                    <Heading size="md">{feature.title}</Heading>
                                </CardHeader>
                                <CardBody>
                                    <Text textAlign="center" color="gray.600">
                                        {feature.description}
                                    </Text>
                                </CardBody>
                            </Card>
                        </GridItem>
                    ))}
                </Grid>
            </VStack>

            {/* CTA Section */}
            <Box textAlign="center" py={12} bg="brand.700" borderRadius="lg" color="white">
                <Heading mb={4}>Готовы начать ремонт?</Heading>
                <Text mb={6} fontSize="lg">
                    Оставьте заявку прямо сейчас и наши специалисты свяжутся с вами
                </Text>
                <Button
                    colorScheme="orange"
                    size="lg"
                    onClick={() => navigate('/register')}
                >
                    Подать заявку
                </Button>
            </Box>
        </Container>
    );
};

export default Home;
