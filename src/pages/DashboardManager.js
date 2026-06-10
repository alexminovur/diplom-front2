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
    Select,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    ModalFooter,
    Spinner,
    Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DashboardManager = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [masters, setMasters] = useState([]); // 🔥 Добавлено
    const [usersMap, setUsersMap] = useState({}); // карта всех пользователей по id
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedMaster, setSelectedMaster] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchData(); // 🔥 Загружаем и заказы, и мастеров
    }, []);

    const fetchData = async () => {
        setFetchLoading(true);
        try {
            // Загружаем заказы
            const ordersResponse = await api.get('/orders');
            setOrders(ordersResponse.data);

            // Загружаем пользователей (и выделяем мастеров)
            const usersResponse = await api.get('/users'); // или отдельный endpoint
            const users = usersResponse.data || [];
            // Построим карту пользователей по id для быстрого поиска имени
            const map = {};
            users.forEach(u => { map[u.id] = u; });
            setUsersMap(map);

            const masterUsers = users.filter(user => user.role === 'master');
            setMasters(masterUsers);

        } catch (err) {
            toast({
                title: 'Ошибка загрузки',
                description: err.response?.data?.detail || 'Не удалось загрузить данные',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
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

    const fetchMasters = async () => {
        try {
            const response = await api.get('/users');
            const masterUsers = response.data.filter(user => user.role === 'master');
            setMasters(masterUsers);
        } catch (err) {
            toast({
                title: 'Ошибка загрузки',
                description: 'Не удалось загрузить список мастеров',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleAssignMaster = async () => {
        if (!selectedMaster) {
            toast({
                title: 'Ошибка',
                description: 'Выберите мастера',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            await api.put(`/orders/update/${selectedOrder.id}`, {
                master_id: parseInt(selectedMaster) // Преобразуем в число
            });

            toast({
                title: 'Успешно',
                description: 'Мастер назначен',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsOpen(false);
            setSelectedOrder(null);
            setSelectedMaster('');
            fetchOrders(); // Обновляем список заказов
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: err.response?.data?.detail || 'Не удалось назначить мастера',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };


    const getStatusText = (status) => {
        const map = {
            'new': 'Новый',
            'diagnostics': 'На диагностике',
            'on_diagnostics': 'На диагностике',
            'awaiting_approval': 'Ожидает согласования',
            'awaiting_parts': 'Ожидает запчастей',
            'in_repair': 'В ремонте',
            'ready_for_pickup': 'Готов / ожидает выдачи',
            'in_progress': 'В работе',
            'completed': 'Завершён',
            'cancelled': 'Отменён',
        };
        return map[status] || status;
    };

    if (fetchLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Box>
            <Flex justify="space-between" align="center" gap={4} wrap="wrap" mb={4}>
                <Heading color="brand.800">Личный кабинет менеджера</Heading>
                <Button colorScheme="blue" onClick={() => navigate('/reports')}>
                    📊 Отчетность
                </Button>
            </Flex>

            <Card>
                <CardHeader>
                    <Heading size="md">Все заказы</Heading>
                </CardHeader>
                <CardBody>
                    {orders.length === 0 ? (
                        <Text textAlign="center" py={8} color="gray.500">
                            Нет заказов
                        </Text>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Дата</Th>
                                    <Th>Устройство</Th>
                                    <Th>Клиент</Th>
                                    <Th>Статус</Th>
                                    <Th>Мастер</Th>
                                    <Th>Действия</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {orders.map((order) => (
                                    <Tr key={order.id}>
                                        <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                                        <Td>{order.device_type} {order.brand} {order.model}</Td>
                                        <Td>
                                            {order.client_id ? (
                                                usersMap[order.client_id]
                                                    ? (usersMap[order.client_id].name || ((usersMap[order.client_id].first_name || '') + ' ' + (usersMap[order.client_id].last_name || '')).trim())
                                                    : `Клиент #${order.client_id}`
                                            ) : 'Не назначен'}
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={
                                                order.status === 'new' ? 'blue' :
                                                    order.status === 'in_progress' ? 'yellow' : 'green'
                                            }>
                                                {getStatusText(order.status)}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            {order.master_id ? (
                                                usersMap[order.master_id]
                                                    ? (usersMap[order.master_id].name || ((usersMap[order.master_id].first_name || '') + ' ' + (usersMap[order.master_id].last_name || '')).trim())
                                                    : `Мастер #${order.master_id}`
                                            ) : 'Не назначен'}
                                        </Td>
                                        <Td>
                                            {(order.status === 'new' || order.status === 'pending') && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="orange"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsOpen(true);
                                                    }}
                                                >
                                                    Назначить мастера
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

            {/* Modal для назначения мастера */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Назначить мастера</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder && (
                            <>
                                <Text mb={4}>
                                    <strong>Устройство:</strong> {selectedOrder.device_type} {selectedOrder.brand} {selectedOrder.model}
                                </Text>
                                <Text mb={4}>
                                    <strong>Проблема:</strong> {selectedOrder.description || 'Не указана'}
                                </Text>
                                <FormControl>
                                    <FormLabel>Выберите мастера</FormLabel>
                                    <Select
                                        value={selectedMaster}
                                        onChange={(e) => setSelectedMaster(e.target.value)}
                                        placeholder="Выберите мастера"
                                    >
                                        {/* 🔥 Здесь отображаются мастера */}
                                        {masters.map(master => (
                                            <option key={master.id} value={master.id}>
                                                {master.name} {/* или master.first_name + master.last_name */}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="orange"
                            mr={3}
                            onClick={handleAssignMaster}
                            isLoading={loading}
                        >
                            Назначить
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

export default DashboardManager;
