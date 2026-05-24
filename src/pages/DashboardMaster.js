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
    Select,
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
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedStatusOrder, setSelectedStatusOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    // states for complexity modal
    const [complexityModalOpen, setComplexityModalOpen] = useState(false);
    const [complexityOrder, setComplexityOrder] = useState(null);
    const [complexityValue, setComplexityValue] = useState('unknown');
    const [problemText, setProblemText] = useState('');
    const [complexitySaving, setComplexitySaving] = useState(false);
    const toast = useToast();
    const userId = localStorage.getItem('user_id');

    const statuses = [
        { value: 'new', label: 'Новый' },
        { value: 'diagnostics', label: 'На диагностике' },
        { value: 'awaiting_approval', label: 'Ожидает согласования' },
        { value: 'awaiting_parts', label: 'Ожидает запчастей' },
        { value: 'in_repair', label: 'В ремонте' },
        { value: 'ready_for_pickup', label: 'Готов / ожидает выдачи' },
        { value: 'cancelled', label: 'Отменён' },
        { value: 'completed', label: 'Завершён' },
    ];

    const statusFlow = [
        'new',
        'diagnostics',
        'awaiting_approval',
        'awaiting_parts',
        'in_repair',
        'ready_for_pickup',
        'completed',
    ];

    const formatErrorDetail = (detail, fallback) => {
        if (!detail) {
            return fallback;
        }

        if (typeof detail === 'string') {
            return detail;
        }

        if (Array.isArray(detail)) {
            const message = detail
                .map((item) => {
                    if (typeof item === 'string') {
                        return item;
                    }
                    if (item && typeof item === 'object') {
                        if (typeof item.msg === 'string') {
                            return item.msg;
                        }
                        return JSON.stringify(item);
                    }
                    return String(item);
                })
                .filter(Boolean)
                .join('; ');

            return message || fallback;
        }

        if (typeof detail === 'object') {
            if (typeof detail.detail === 'string') {
                return detail.detail;
            }
            if (typeof detail.msg === 'string') {
                return detail.msg;
            }
            return JSON.stringify(detail);
        }

        return fallback;
    };

    const getApiErrorMessage = (err, fallback) => formatErrorDetail(err?.response?.data?.detail, fallback);

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
            return masterOrders;
        } catch (err) {
            console.error('Error fetching orders:', err);
            toast({
                title: 'Ошибка загрузки',
                description: getApiErrorMessage(err, 'Не удалось загрузить список заказов'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return [];
        } finally {
            setFetchLoading(false);
        }
    };

    const getNextStatus = (currentStatus) => {
        const currentIndex = statusFlow.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) {
            return null;
        }
        return statusFlow[currentIndex + 1];
    };

    const updateOrderStatus = async (orderId, status, successDescription, extra = {}) => {
        // 1) Always move status via dedicated endpoint
        const statusResponse = await api.patch(`/orders/${orderId}/status`, { status });

        // 2) Save additional fields (problem/difficult/etc.) via generic update endpoint
        let mergedData = {
            ...(statusResponse?.data || {}),
            status,
            ...extra,
        };

        if (extra && Object.keys(extra).length > 0) {
            const extraResponse = await api.put(`/orders/update/${orderId}`, extra);
            mergedData = {
                ...mergedData,
                ...(extraResponse?.data || {}),
            };
        }

        setOrders((prevOrders) => prevOrders.map((order) => (
            order.id === orderId
                ? { ...order, ...mergedData }
                : order
        )));

        toast({
            title: 'Успешно',
            description: successDescription,
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
    };

    const handleStartWork = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'diagnostics', 'Заказ переведен на диагностику');
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: getApiErrorMessage(err, 'Не удалось начать диагностику'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleMoveToNextStatus = async (order) => {
        const nextStatus = getNextStatus(order.status);
        if (!nextStatus) {
            return;
        }

        // special case: when moving from diagnostics, ask for complexity first
        if (order.status === 'diagnostics' || order.status === 'on_diagnostics') {
            setComplexityOrder(order);
            setComplexityValue(order.difficult || 'unknown');
            setProblemText(order.problem || '');
            setComplexityModalOpen(true);
            return;
        }

        try {
            await updateOrderStatus(order.id, nextStatus, `Статус изменен: ${getStatusText(nextStatus)}`);
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: getApiErrorMessage(err, 'Не удалось изменить статус'),
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
            // Завершаем заказ и сохраняем итоговые заметки мастера
            await api.put(`/orders/update/${orderId}`, {
                status: 'completed',
                description: notes,
            });

            setOrders((prevOrders) => prevOrders.map((order) => (
                order.id === orderId
                    ? { ...order, status: 'completed', description: notes }
                    : order
            )));

            toast({
                title: 'Успешно',
                description: 'Заказ завершен',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setIsOpen(false);
            setNotes('');
            setSelectedOrder(null);
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: getApiErrorMessage(err, 'Не удалось завершить работу'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus.trim()) {
            toast({
                title: 'Ошибка',
                description: 'Выберите статус',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setStatusLoading(true);
        try {
            await api.patch(`/orders/${selectedStatusOrder.id}/status`, {
                status: newStatus
            });

            toast({
                title: 'Успешно',
                description: 'Статус заказа обновлен',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setStatusModalOpen(false);
            setNewStatus('');
            setSelectedStatusOrder(null);

            // Обновляем заказ в списке
            setOrders((prevOrders) => prevOrders.map((order) => (
                order.id === selectedStatusOrder.id
                    ? { ...order, status: newStatus }
                    : order
            )));
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: getApiErrorMessage(err, 'Не удалось обновить статус'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setStatusLoading(false);
        }
    };

    const handleConfirmComplexity = async () => {
        if (!complexityOrder) return;
        const nextStatus = getNextStatus(complexityOrder.status);
        if (!nextStatus) return;

        if (!problemText.trim()) {
            toast({
                title: 'Ошибка',
                description: 'Опишите проблему перед продолжением',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setComplexitySaving(true);
        try {
            const submittedProblem = problemText.trim();
            await updateOrderStatus(
                complexityOrder.id,
                nextStatus,
                `Статус изменен: ${getStatusText(nextStatus)}`,
                { difficult: complexityValue, problem: submittedProblem }
            );

            const refreshedOrders = await fetchAssignedOrders();
            const updatedOrder = refreshedOrders.find((order) => order.id === complexityOrder.id);
            if (updatedOrder && submittedProblem && !updatedOrder.problem) {
                toast({
                    title: 'Внимание',
                    description: 'Статус и сложность обновлены, но поле problem не сохранилось на сервере.',
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                });
            }

            setComplexityModalOpen(false);
            setComplexityOrder(null);
            setComplexityValue('unknown');
            setProblemText('');
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: getApiErrorMessage(err, 'Не удалось сохранить сложность'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setComplexitySaving(false);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'new': 'Новый',
            'diagnostics': 'На диагностике',
            'on_diagnostics': 'На диагностике',
            'awaiting_approval': 'Ожидает согласования',
            'awaiting_parts': 'Ожидает запчастей',
            'in_repair': 'В ремонте',
            'ready_for_pickup': 'Готов / ожидает выдачи',
            'cancelled': 'Отменён',
            'completed': 'Завершён',
            'in_progress': 'В работе',
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'new': 'blue',
            'diagnostics': 'cyan',
            'on_diagnostics': 'cyan',
            'awaiting_approval': 'orange',
            'awaiting_parts': 'purple',
            'in_repair': 'yellow',
            'ready_for_pickup': 'teal',
            'cancelled': 'red',
            'completed': 'green',
            'in_progress': 'yellow',
        };
        return colorMap[status] || 'gray';
    };

    const getComplexityText = (val) => {
        const normalized = String(val || '').trim().toLowerCase();
        const map = {
            'unknown': 'Неизвестно',
            'uknown': 'Неизвестно',
            'normal': 'Обычный ремонт',
            'service': 'Тех. обслуживание',
            'not_repair': 'Ремонт нецелесообразен',
        };
        return map[normalized] || 'Неизвестно';
    };

    const getComplexityColor = (val) => {
        const normalized = String(val || '').trim().toLowerCase();
        const map = {
            'unknown': 'gray',
            'uknown': 'gray',
            'normal': 'yellow',
            'service': 'blue',
            'not_repair': 'red',
        };
        return map[normalized] || 'gray';
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
                                            <Badge colorScheme={getComplexityColor(order.difficult)}>
                                                {getComplexityText(order.difficult)}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(order.status)}>
                                                {getStatusText(order.status)}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            {(() => {
                                                const nextStatus = getNextStatus(order.status);
                                                if (!nextStatus || order.status === 'completed' || order.status === 'cancelled') {
                                                    return null;
                                                }

                                                if (order.status === 'new') {
                                                    return (
                                                        <Button
                                                            size="sm"
                                                            colorScheme="green"
                                                            mr={2}
                                                            onClick={() => handleStartWork(order.id)}
                                                        >
                                                            Начать диагностику
                                                        </Button>
                                                    );
                                                }

                                                if (order.status === 'ready_for_pickup') {
                                                    return (
                                                        <Button
                                                            size="sm"
                                                            colorScheme="blue"
                                                            mr={2}
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setNotes(order.description || '');
                                                                setIsOpen(true);
                                                            }}
                                                        >
                                                            Завершить
                                                        </Button>
                                                    );
                                                }

                                                return (
                                                    <Button
                                                        size="sm"
                                                        colorScheme="teal"
                                                        mr={2}
                                                        onClick={() => handleMoveToNextStatus(order)}
                                                    >
                                                        {getStatusText(nextStatus)}
                                                    </Button>
                                                );
                                            })()}
                                            <Button
                                                size="sm"
                                                colorScheme="purple"
                                                mr={2}
                                                onClick={() => {
                                                    setSelectedStatusOrder(order);
                                                    setNewStatus(order.status);
                                                    setStatusModalOpen(true);
                                                }}
                                            >
                                                Изменить статус
                                            </Button>
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

            {/* Modal для выбора сложности после диагностики */}
            <Modal
                isOpen={complexityModalOpen}
                onClose={() => {
                    setComplexityModalOpen(false);
                    setComplexityOrder(null);
                    setComplexityValue('unknown');
                    setProblemText('');
                }}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Указать сложность ремонта</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {complexityOrder && (
                            <>
                                <Text mb={3}>
                                    <strong>Заказ:</strong> {complexityOrder.title} (ID: {complexityOrder.id})
                                </Text>
                                <FormControl>
                                    <FormLabel>Сложность</FormLabel>
                                    <Select value={complexityValue} onChange={(e) => setComplexityValue(e.target.value)}>
                                        <option value="unknown">Неизвестно</option>
                                        <option value="normal">Обычный ремонт</option>
                                        <option value="service">Тех. обслуживание</option>
                                        <option value="not_repair">Ремонт нецелесообразен</option>
                                    </Select>
                                </FormControl>
                                <FormControl mt={4} isRequired>
                                    <FormLabel>Описание проблемы</FormLabel>
                                    <Textarea
                                        value={problemText}
                                        onChange={(e) => setProblemText(e.target.value)}
                                        placeholder="Опишите выявленную проблему..."
                                        rows={4}
                                    />
                                </FormControl>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleConfirmComplexity} isLoading={complexitySaving}>
                            Сохранить и продолжить
                        </Button>
                        <Button variant="ghost" onClick={() => setComplexityModalOpen(false)}>Отмена</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal для изменения статуса */}
            <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Изменить статус заказа</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedStatusOrder && (
                            <>
                                <Text mb={4}>
                                    <strong>Заказ:</strong> {selectedStatusOrder.title} (ID: {selectedStatusOrder.id})
                                </Text>
                                <FormControl>
                                    <FormLabel>Новый статус</FormLabel>
                                    <Select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="">-- Выберите статус --</option>
                                        {statuses.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={handleUpdateStatus}
                            isLoading={statusLoading}
                        >
                            Обновить
                        </Button>
                        <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
                            Отмена
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default DashboardMaster;
