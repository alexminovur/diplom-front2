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
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Badge,
    Spinner,
    Flex,
    Checkbox,
    InputGroup,
    InputRightElement
} from '@chakra-ui/react';
import api from '../services/api';

const DashboardClient = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [orders, setOrders] = useState([]);
    const [currentOrders, setCurrentOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        deviceType: '',
        brand: '',
        model: '',
        description: '',
        isCustomDevice: false,
        customDeviceType: '',
        isCustomBrand: false,
        customBrand: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const toast = useToast();

    // Расширенный список устройств
    const deviceTypes = [
        'Холодильник',
        'Стиральная машина',
        'Посудомоечная машина',
        'Микроволновая печь',
        'Телевизор',
        'Кофемашина',
        'Пылесос',
        'Кондиционер',
        'Электроплита',
        'СВЧ-печь',
        'Водонагреватель',
        'Электрочайник',
        'Фен',
        'Утюг',
        'Мультиварка',
        'Блендер',
        'Тостер',
        'Электрогриль',
        'Обогреватель',
        'Вентилятор'
    ];

    // Список брендов
    const brands = [
        'Samsung',
        'LG',
        'Bosch',
        'Whirlpool',
        'Electrolux',
        'Indesit',
        'Ariston',
        'Hotpoint',
        'Siemens',
        'Miele',
        'Philips',
        'Beko',
        'Haier',
        'Sharp',
        'Panasonic',
        'Sony',
        'Tefal',
        'Redmond',
        'Polaris',
        'Scarlett'
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get('/orders/my');
            const allOrders = response.data;
            setOrders(allOrders);

            const current = allOrders.filter(order =>
                order.status === 'new' || order.status === 'in_progress'
            );
            const history = allOrders.filter(order =>
                order.status === 'completed' || order.status === 'cancelled'
            );

            setCurrentOrders(current);
            setHistoryOrders(history);
        } catch (err) {
            toast({
                title: 'Ошибка загрузки',
                description: err.response?.data?.detail || 'Не удалось загрузить список заказов',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setFetchLoading(false);
        }
    };

    const handleCreateOrder = async () => {
        // Проверяем обязательные поля
        const deviceType = formData.isCustomDevice ? formData.customDeviceType : formData.deviceType;
        const brand = formData.isCustomBrand ? formData.customBrand : formData.brand;

        if (!deviceType || !brand || !formData.description) {
            toast({
                title: 'Ошибка',
                description: 'Заполните все обязательные поля',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            await api.post('/orders/create', {
                title: `${deviceType} ${brand}`, // Автоматическое название
                device_type: deviceType,
                brand: brand,
                model: formData.model || null,
                description: formData.description || null
            });

            toast({
                title: 'Заявка создана',
                description: 'Ваша заявка успешно отправлена',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setIsOpen(false);
            setFormData({
                deviceType: '',
                brand: '',
                model: '',
                description: '',
                isCustomDevice: false,
                customDeviceType: '',
                isCustomBrand: false,
                customBrand: ''
            });

            await fetchOrders();
            setActiveTab(1);

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

    const getDifficultColor = (difficult) => {
        const map = {
            'high': 'red',
            'medium': 'yellow',
            'low': 'green',
            'unknown': 'gray',
            'normal': 'yellow',
            'service': 'blue',
            'not_repair': 'red',
        };
        return map[difficult] || 'gray';
    };

    const getDifficultText = (difficult) => {
        const map = {
            'high': 'Высокая',
            'medium': 'Средняя',
            'low': 'Низкая',
            'unknown': 'Неизвестно',
            'normal': 'Обычный ремонт',
            'service': 'Тех. обслуживание',
            'not_repair': 'Ремонт нецелесообразен',
        };
        return map[difficult] || 'Не указана';
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
            <Heading mb={6} color="brand.800">Личный кабинет клиента</Heading>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
                <Stat>
                    <StatLabel>Всего заявок</StatLabel>
                    <StatNumber>{orders.length}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Новые</StatLabel>
                    <StatNumber>{orders.filter(o => o.status === 'new').length}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>В работе</StatLabel>
                    <StatNumber>{orders.filter(o => o.status === 'in_progress').length}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Завершено</StatLabel>
                    <StatNumber>{orders.filter(o => o.status === 'completed').length}</StatNumber>
                </Stat>
            </SimpleGrid>

            <Tabs index={activeTab} onChange={setActiveTab} isFitted>
                <TabList mb={4}>
                    <Tab>➕ Создать заявку</Tab>
                    <Tab>🔄 Текущие заявки</Tab>
                    <Tab>📚 История заявок</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Card>
                            <CardHeader>
                                <Heading size="md">Новая заявка на ремонт</Heading>
                            </CardHeader>
                            <CardBody>
                                <Button
                                    colorScheme="orange"
                                    size="lg"
                                    onClick={() => setIsOpen(true)}
                                >
                                    Создать заявку
                                </Button>

                                <Text mt={4} color="gray.600">
                                    Нажмите кнопку выше, чтобы создать новую заявку на ремонт бытовой техники.
                                    Наши специалисты свяжутся с вами в ближайшее время.
                                </Text>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Текущие заявки */}
                    <TabPanel>
                        <Card>
                            <CardHeader>
                                <Heading size="md">Текущие заявки</Heading>
                            </CardHeader>
                            <CardBody>
                                {currentOrders.length === 0 ? (
                                    <Text textAlign="center" py={8} color="gray.500">
                                        У вас нет текущих заявок
                                    </Text>
                                ) : (
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                {/* Убрал ID */}
                                                <Th>Устройство</Th>
                                                <Th>Проблема</Th>
                                                <Th>Сложность</Th>
                                                <Th>Статус</Th>
                                                <Th>Дата</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {/* Таблица с правильными данными из устройства */}
                                            {currentOrders.map((order) => (
                                                <Tr key={order.id}>
                                                    <Td>
                                                        {order.device_type ?
                                                            `${order.device_type} ${order.brand || ''} ${order.model || ''}`.trim() :
                                                            order.title || 'Не указано'
                                                        }
                                                    </Td>
                                                    <Td>{order.description?.substring(0, 50) || 'Нет описания'}</Td>
                                                    <Td>
                                                        <Badge colorScheme={getDifficultColor(order.difficult)}>
                                                            {getDifficultText(order.difficult)}
                                                        </Badge>
                                                    </Td>
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


                    {/* История заявок */}
                    <TabPanel>
                        <Card>
                            <CardHeader>
                                <Heading size="md">История заявок</Heading>
                            </CardHeader>
                            <CardBody>
                                {historyOrders.length === 0 ? (
                                    <Text textAlign="center" py={8} color="gray.500">
                                        У вас нет истории заявок
                                    </Text>
                                ) : (
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                {/* Убрал ID */}
                                                <Th>Устройство</Th>
                                                <Th>Проблема</Th>
                                                <Th>Статус</Th>
                                                <Th>Дата</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {historyOrders.map((order) => (
                                                <Tr key={order.id}>
                                                    {/* Убрал ID */}
                                                    <Td>
                                                        {order.device_type} {order.brand}
                                                        {order.model && ` ${order.model}`}
                                                    </Td>
                                                    <Td>{order.description?.substring(0, 50) || 'Не указана'}</Td>
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
                </TabPanels>
            </Tabs>

            {/* Modal для создания заявки */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Создать заявку на ремонт</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {/* Выбор устройства */}
                        <FormControl mb={4} isRequired>
                            <FormLabel>Устройство</FormLabel>

                            {!formData.isCustomDevice ? (
                                <Select
                                    value={formData.deviceType}
                                    onChange={(e) => setFormData({...formData, deviceType: e.target.value})}
                                    placeholder="Выберите устройство"
                                >
                                    {deviceTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </Select>
                            ) : (
                                <Input
                                    value={formData.customDeviceType}
                                    onChange={(e) => setFormData({...formData, customDeviceType: e.target.value})}
                                    placeholder="Введите название устройства"
                                />
                            )}

                            <Checkbox
                                mt={2}
                                isChecked={formData.isCustomDevice}
                                onChange={(e) => setFormData({...formData, isCustomDevice: e.target.checked, deviceType: '', customDeviceType: ''})}
                            >
                                Другое устройство
                            </Checkbox>
                        </FormControl>

                        {/* Выбор бренда */}
                        <FormControl mb={4} isRequired>
                            <FormLabel>Марка</FormLabel>

                            {!formData.isCustomBrand ? (
                                <Select
                                    value={formData.brand}
                                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                    placeholder="Выберите марку"
                                >
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </Select>
                            ) : (
                                <Input
                                    value={formData.customBrand}
                                    onChange={(e) => setFormData({...formData, customBrand: e.target.value})}
                                    placeholder="Введите марку"
                                />
                            )}

                            <Checkbox
                                mt={2}
                                isChecked={formData.isCustomBrand}
                                onChange={(e) => setFormData({...formData, isCustomBrand: e.target.checked, brand: '', customBrand: ''})}
                            >
                                Другая марка
                            </Checkbox>
                        </FormControl>

                        {/* Модель */}
                        <FormControl mb={4}>
                            <FormLabel>Модель</FormLabel>
                            <Input
                                value={formData.model}
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                placeholder="Введите модель устройства"
                            />
                        </FormControl>

                        {/* Проблема */}
                        <FormControl mb={4} isRequired>
                            <FormLabel>Опишите проблему</FormLabel>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Кратко опишите проблему"
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

export default DashboardClient;
