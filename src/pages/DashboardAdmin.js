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
    Flex,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Text,
    Badge,
    Spinner
} from '@chakra-ui/react';
import api from '../services/api';
import { ROLES, ROLE_TITLES } from '../utils/roles';

const DashboardAdmin = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [masters, setMasters] = useState([]);
    const [managers, setManagers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setFetchLoading(true);
        try {
            switch(activeTab) {
                case 0: // Пользователи
                    const usersResponse = await api.get('/users');
                    setUsers(usersResponse.data);
                    break;
                case 1: // Заказы
                    const ordersResponse = await api.get('/orders');
                    setOrders(ordersResponse.data);
                    break;
                case 2: // Мастера
                    const mastersResponse = await api.get('/users');
                    const masterUsers = mastersResponse.data.filter(user => user.role === 'master');
                    setMasters(masterUsers);
                    break;
                case 3: // Менеджеры
                    const managersResponse = await api.get('/users');
                    const managerUsers = managersResponse.data.filter(user => user.role === 'manager');
                    setManagers(managerUsers);
                    break;
                default:
                    break;
            }
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

    const handleChangeRole = async () => {
        if (!newRole) {
            toast({
                title: 'Ошибка',
                description: 'Выберите новую роль',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            await api.put(`/users/${selectedUser.id}`, { role: newRole });
            toast({
                title: 'Успешно',
                description: 'Роль пользователя изменена',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsOpen(false);
            setSelectedUser(null);
            setNewRole('');
            fetchData();
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: err.response?.data?.detail || 'Не удалось изменить роль',
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

    const getStatusColor = (status) => {
        const map = {
            'new': 'blue',
            'diagnostics': 'cyan',
            'on_diagnostics': 'cyan',
            'awaiting_approval': 'orange',
            'awaiting_parts': 'purple',
            'in_repair': 'yellow',
            'ready_for_pickup': 'teal',
            'in_progress': 'yellow',
            'completed': 'green',
            'cancelled': 'red',
        };
        return map[status] || 'gray';
    };

    if (fetchLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Flex>
            {/* Боковое меню */}
            <Box w="250px" p={4} borderRight="1px" borderColor="gray.200">
                <Heading size="md" mb={6} color="brand.800">Админ-панель</Heading>
                <Tabs orientation="vertical" variant="filled" index={activeTab} onChange={(index) => setActiveTab(index)}>
                    <TabList>
                        <Tab justifyContent="flex-start" mb={2}>
                            📋 Все пользователи
                        </Tab>
                        <Tab justifyContent="flex-start" mb={2}>
                            🛠️ Все заказы
                        </Tab>
                        <Tab justifyContent="flex-start" mb={2}>
                            🔧 Мастера
                        </Tab>
                        <Tab justifyContent="flex-start" mb={2}>
                            👨‍💼 Менеджеры
                        </Tab>
                    </TabList>
                </Tabs>
            </Box>

            {/* Основной контент - ОБЕРНУЛ В Tabs */}
            <Tabs index={activeTab} onChange={setActiveTab} style={{ flex: 1 }}>
                <Box p={6}>
                    <TabPanels>
                        {/* Все пользователи */}
                        <TabPanel>
                            <Heading mb={6} color="brand.800">Все пользователи</Heading>
                            <Card>
                                <CardHeader>
                                    <Heading size="md">Список пользователей</Heading>
                                </CardHeader>
                                <CardBody>
                                    {users.length === 0 ? (
                                        <Text textAlign="center" py={8} color="gray.500">
                                            Нет пользователей
                                        </Text>
                                    ) : (
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Имя</Th>
                                                    <Th>Телефон</Th>
                                                    <Th>Роль</Th>
                                                    <Th>Дата регистрации</Th>
                                                    <Th>Действия</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {users.map((user) => (
                                                    <Tr key={user.id}>
                                                        <Td>{user.name}</Td>
                                                        <Td>{user.phone}</Td>
                                                        <Td>
                                                            <Badge colorScheme={
                                                                user.role === 'admin' ? 'purple' :
                                                                    user.role === 'manager' ? 'blue' :
                                                                        user.role === 'master' ? 'green' : 'gray'
                                                            }>
                                                                {ROLE_TITLES[user.role] || user.role}
                                                            </Badge>
                                                        </Td>
                                                        <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                                                        <Td>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="orange"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setNewRole(user.role);
                                                                    setIsOpen(true);
                                                                }}
                                                            >
                                                                Изменить роль
                                                            </Button>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    )}
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Все заказы */}
                        <TabPanel>
                            <Heading mb={6} color="brand.800">Все заказы</Heading>
                            <Card>
                                <CardHeader>
                                    <Heading size="md">Список заказов</Heading>
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
                                                    <Th>ID</Th>
                                                    <Th>Название</Th>
                                                    <Th>Клиент</Th>
                                                    <Th>Мастер</Th>
                                                    <Th>Статус</Th>
                                                    <Th>Дата создания</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {orders.map((order) => (
                                                    <Tr key={order.id}>
                                                        <Td>{order.id}</Td>
                                                        <Td>{order.title}</Td>
                                                        <Td>{order.client_id ? `#${order.client_id}` : 'Не назначен'}</Td>
                                                        <Td>{order.master_id ? `#${order.master_id}` : 'Не назначен'}</Td>
                                                        <Td>
                                                            <Badge colorScheme={getStatusColor(order.status)}>
                                                                {getStatusText(order.status)}
                                                            </Badge>
                                                        </Td>
                                                        <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    )}
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Мастера */}
                        <TabPanel>
                            <Heading mb={6} color="brand.800">Мастера</Heading>
                            <Card>
                                <CardHeader>
                                    <Heading size="md">Список мастеров</Heading>
                                </CardHeader>
                                <CardBody>
                                    {masters.length === 0 ? (
                                        <Text textAlign="center" py={8} color="gray.500">
                                            Нет мастеров
                                        </Text>
                                    ) : (
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Имя</Th>
                                                    <Th>Телефон</Th>
                                                    <Th>Дата регистрации</Th>
                                                    <Th>Действия</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {masters.map((master) => (
                                                    <Tr key={master.id}>
                                                        <Td>{master.name}</Td>
                                                        <Td>{master.phone}</Td>
                                                        <Td>{new Date(master.created_at).toLocaleDateString()}</Td>
                                                        <Td>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="orange"
                                                                onClick={() => {
                                                                    setSelectedUser(master);
                                                                    setNewRole(master.role);
                                                                    setIsOpen(true);
                                                                }}
                                                            >
                                                                Изменить роль
                                                            </Button>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    )}
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Менеджеры */}
                        <TabPanel>
                            <Heading mb={6} color="brand.800">Менеджеры</Heading>
                            <Card>
                                <CardHeader>
                                    <Heading size="md">Список менеджеров</Heading>
                                </CardHeader>
                                <CardBody>
                                    {managers.length === 0 ? (
                                        <Text textAlign="center" py={8} color="gray.500">
                                            Нет менеджеров
                                        </Text>
                                    ) : (
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Имя</Th>
                                                    <Th>Телефон</Th>
                                                    <Th>Дата регистрации</Th>
                                                    <Th>Действия</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {managers.map((manager) => (
                                                    <Tr key={manager.id}>
                                                        <Td>{manager.name}</Td>
                                                        <Td>{manager.phone}</Td>
                                                        <Td>{new Date(manager.created_at).toLocaleDateString()}</Td>
                                                        <Td>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="orange"
                                                                onClick={() => {
                                                                    setSelectedUser(manager);
                                                                    setNewRole(manager.role);
                                                                    setIsOpen(true);
                                                                }}
                                                            >
                                                                Изменить роль
                                                            </Button>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    )}
                                </CardBody>
                            </Card>
                        </TabPanel>
                    </TabPanels>
                </Box>
            </Tabs>

            {/* Modal для изменения роли */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Изменить роль пользователя</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedUser && (
                            <>
                                <Text mb={2}><strong>Имя:</strong> {selectedUser.name}</Text>
                                <Text mb={4}><strong>Телефон:</strong> {selectedUser.phone}</Text>
                                <FormControl>
                                    <FormLabel>Новая роль</FormLabel>
                                    <Select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                    >
                                        {Object.entries(ROLES).map(([key, value]) => (
                                            <option key={value} value={value}>
                                                {ROLE_TITLES[value]}
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
                            onClick={handleChangeRole}
                            isLoading={loading}
                        >
                            Сохранить
                        </Button>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>
                            Отмена
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default DashboardAdmin;
