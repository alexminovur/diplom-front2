import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Card,
    CardHeader,
    CardBody,
    Button,
    Badge,
    Text,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Textarea,
    ModalFooter
} from '@chakra-ui/react';
import api from '../services/api';

const DashboardMaster = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [notes, setNotes] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchAssignedOrders();
    }, []);

    const fetchAssignedOrders = async () => {
        try {
            const response = await api.get('/orders/assigned');
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

    const handleStartWork = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}/start`);
            toast({
                title: 'Успешно',
                description: 'Работа начата',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchAssignedOrders();
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось начать работу',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCompleteWork = async (orderId) => {
        if (!notes.trim()) {
            toast({
                title: 'Ошибка',
                description: 'Добавьте заметки о проделанной работе',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            await api.patch(`/orders/${orderId}/complete`, { notes });
            toast({
                title: 'Успешно',
                description: 'Работа завершена',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsOpen(false);
            setNotes('');
            setSelectedOrder(null);
            fetchAssignedOrders();
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось завершить работу',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
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
            <Heading mb={6} color="brand.800">Личный кабинет мастера</Heading>

            <Card>
                <CardHeader>
                    <Heading size="md">Назначенные заказы</Heading>
                </CardHeader>
                <CardBody>
                    {orders.length === 0 ? (
                        <Text textAlign="center" py={8} color="gray.500">
                            Нет назначенных заказов
                        </Text>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Дата</Th>
                                    <Th>Устройство</Th>
                                    <Th>Клиент</Th>
                                    <Th>Статус</Th>
                                    <Th>Действия</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {orders.map((order) => (
                                    <Tr key={order.id}>
                                        <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                                        <Td>{order.device_type} {order.brand} {order.model}</Td>
                                        <Td>{order.customer_name}</Td>
                                        <Td>
                                            <Badge colorScheme={
                                                order.status === 'new' ? 'blue' :
                                                    order.status === 'in_progress' ? 'yellow' : 'green'
                                            }>
                                                {getStatusText(order.status)}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            {order.status === 'new' && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="green"
                                                    mr={2}
                                                    onClick={() => handleStartWork(order.id)}
                                                >
                                                    Начать работу
                                                </Button>
                                            )}
                                            {order.status === 'in_progress' && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsOpen(true);
                                                    }}
                                                >
                                                    Завершить
                                                </Button>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Modal для завершения работы */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Завершение работы</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder && (
                            <>
                                <Text mb={4}>
                                    <strong>Устройство:</strong> {selectedOrder.device_type} {selectedOrder.brand} {selectedOrder.model}
                                </Text>
                                <Text mb={4}>
                                    <strong>Проблема:</strong> {selectedOrder.problem}
                                </Text>
                                <FormControl>
                                    <FormLabel>Заметки о проделанной работе</FormLabel>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Опишите, что было сделано..."
                                        rows={4}
                                    />
                                </FormControl>
                            </>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="green"
                            mr={3}
                            onClick={() => selectedOrder && handleCompleteWork(selectedOrder.id)}
                            isLoading={loading}
                        >
                            Завершить работу
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

export default DashboardMaster;
