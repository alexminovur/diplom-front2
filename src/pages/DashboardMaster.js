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
    ModalFooter,
    Spinner
} from '@chakra-ui/react';
import api from '../services/api';

const DashboardMaster = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [notes, setNotes] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const toast = useToast();
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        fetchAssignedOrders();
    }, []);

    const fetchAssignedOrders = async () => {
        setFetchLoading(true);
        try {
            // Получаем все заказы текущего пользователя
            const response = await api.get(`/orders/by-user/${userId}`);

            // Если бэкенд не фильтрует по роли, фильтруем на фронте:
            const masterOrders = response.data.filter(order => order.master_id);

            setOrders(masterOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            toast({
                title: 'Ошибка загрузки',
                description: typeof err.response?.data?.detail === 'string'
                    ? err.response.data.detail
                    : JSON.stringify(err.response?.data?.detail) || 'Не удалось загрузить список заказов',                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setFetchLoading(false);
        }
    };

    const handleStartWork = async (orderId) => {
        try {
            // Обновляем статус заказа на "in_progress"
            const response = await api.put(`/orders/update/${orderId}`, { status: "in_progress" });
            toast({
                title: 'Успешно',
                description: 'Работа начата',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            // Обновляем конкретный заказ в списке
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: "in_progress" }
                    : order
            ));
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: err.response?.data?.detail || 'Не удалось начать работу',
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
            // Обновляем статус заказа на "completed" и добавляем заметки
            const response = await api.put(`/orders/update/${orderId}`, {
                status: "completed",
                description: notes
            });

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

            // Обновляем конкретный заказ в списке
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: "completed", description: notes }
                    : order
            ));
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: err.response?.data?.detail || 'Не удалось завершить работу',
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

    const getStatusColor = (status) => {
        switch(status) {
            case 'new': return 'blue';
            case 'in_progress': return 'yellow';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    if (fetchLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Box p={4}>
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
                                    <Th>ID</Th>
                                    <Th>Название</Th>
                                    <Th>Клиент</Th>
                                    <Th>Устройство</Th>
                                    <Th>Сложность</Th>
                                    <Th>Статус</Th>
                                    <Th>Действия</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {orders.map((order) => (
                                    <Tr key={order.id}>
                                        <Td>{order.id}</Td>
                                        <Td>{order.title}</Td>
                                        <Td>
                                            {order.client_id ? `Клиент #${order.client_id}` : 'Не назначен'}
                                        </Td>
                                        <Td>
                                            {order.device_id ? `Устройство #${order.device_id}` : 'Не указано'}
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={
                                                order.difficult === 'high' ? 'red' :
                                                    order.difficult === 'medium' ? 'yellow' :
                                                        order.difficult === 'low' ? 'green' : 'gray'
                                            }>
                                                {order.difficult || 'unknown'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(order.status)}>
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
                                                        setNotes(order.description || '');
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
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Завершение работы</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder && (
                            <>
                                <Text mb={2}>
                                    <strong>ID заказа:</strong> {selectedOrder.id}
                                </Text>
                                <Text mb={2}>
                                    <strong>Название:</strong> {selectedOrder.title}
                                </Text>
                                <Text mb={4}>
                                    <strong>Описание:</strong> {selectedOrder.description || 'Нет описания'}
                                </Text>
                                <FormControl mt={4}>
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
