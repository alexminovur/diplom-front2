import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Card,
    CardHeader,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    SimpleGrid,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    ModalFooter,
    Text
} from '@chakra-ui/react';
import api from '../services/api';

const DashboardCustomer = () => {
    const [orders, setOrders] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        deviceType: '',
        brand: '',
        model: '',
        problem: ''
    });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const deviceTypes = ['Холодильник', 'Стиральная машина', 'Посудомоечная машина', 'Микроволновая печь', 'Телевизор', 'Кофемашина'];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/my');
            setOrders(response.data);
        } catch (err) {
            toast({
                title: 'Ошибка загрузки',
                description: 'Не удалось загрузить список заказов',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCreateOrder = async () => {
        if (!formData.deviceType || !formData.brand || !formData.model || !formData.problem) {
            toast({
                title: 'Ошибка',
                description: 'Заполните все поля',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            await api.post('/orders', formData);
            toast({
                title: 'Заявка создана',
                description: 'Ваша заявка успешно отправлена',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsOpen(false);
            setFormData({ deviceType: '', brand: '', model: '', problem: '' });
            fetchOrders();
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: err.response?.data?.detail || 'Не удалось создать заявку',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'new': return 'blue';
            case 'in_progress': return 'yellow';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'new': return 'Новый';
            case 'in_progress': return 'В работе';
            case 'completed': return 'Завершен';
            case 'cancelled': return 'Отменен';
            default: return status;
        }
    };

    return (
        <Box>
            <Heading mb={6} color="brand.800">Личный кабинет заказчика</Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                <Stat>
                    <StatLabel>Всего заявок</StatLabel>
                    <StatNumber>{orders.length}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>В работе</StatLabel>
                    <StatNumber>
                        {orders.filter(o => o.status === 'in_progress').length}
                    </StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Завершено</StatLabel>
                    <StatNumber>
                        {orders.filter(o => o.status === 'completed').length}
                    </StatNumber>
                </Stat>
            </SimpleGrid>

            <Card mb={6}>
                <CardHeader>
                    <Heading size="md">Мои заявки</Heading>
                </CardHeader>
                <CardBody>
                    <Button
                        colorScheme="orange"
                        mb={4}
                        onClick={() => setIsOpen(true)}
                    >
                        Создать заявку
                    </Button>

                    {orders.length === 0 ? (
                        <Text textAlign="center" py={8} color="gray.500">
                            У вас пока нет заявок. Нажмите кнопку выше, чтобы создать первую.
                        </Text>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Дата</Th>
                                    <Th>Устройство</Th>
                                    <Th>Статус</Th>
                                    <Th>Действия</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {orders.map((order) => (
                                    <Tr key={order.id}>
                                        <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                                        <Td>{order.device_type} {order.brand} {order.model}</Td>
                                        <Td>
                                            <Text
                                                color={`${getStatusColor(order.status)}.500`}
                                                fontWeight="bold"
                                            >
                                                {getStatusText(order.status)}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Button size="sm" variant="outline">
                                                Подробнее
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Modal для создания заявки */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Создать заявку на ремонт</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={4} isRequired>
                            <FormLabel>Тип устройства</FormLabel>
                            <Select
                                value={formData.deviceType}
                                onChange={(e) => setFormData({...formData, deviceType: e.target.value})}
                            >
                                <option value="">Выберите тип</option>
                                {deviceTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl mb={4} isRequired>
                            <FormLabel>Марка</FormLabel>
                            <Input
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                placeholder="Например: Samsung, LG, Bosch"
                            />
                        </FormControl>

                        <FormControl mb={4} isRequired>
                            <FormLabel>Модель</FormLabel>
                            <Input
                                value={formData.model}
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                placeholder="Например: RL38ETPS"
                            />
                        </FormControl>

                        <FormControl mb={4} isRequired>
                            <FormLabel>Описание проблемы</FormLabel>
                            <Input
                                value={formData.problem}
                                onChange={(e) => setFormData({...formData, problem: e.target.value})}
                                placeholder="Опишите проблему"
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="orange"
                            mr={3}
                            onClick={handleCreateOrder}
                            isLoading={loading}
                        >
                            Создать заявку
                        </Button>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>
                            Отмена
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default DashboardCustomer;
