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
    ModalFooter
} from '@chakra-ui/react';
import api from '../services/api';
import { ROLES, ROLE_TITLES } from '../utils/roles';

const DashboardAdmin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            toast({
                title: 'Ошибка загрузки',
                description: 'Не удалось загрузить список пользователей',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
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
            await api.patch(`/users/${selectedUser.id}/role`, { role: newRole });
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
            fetchUsers();
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось изменить роль',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Heading mb={6} color="brand.800">Панель администратора</Heading>

            <Card>
                <CardHeader>
                    <Heading size="md">Управление пользователями</Heading>
                </CardHeader>
                <CardBody>
                    {users.length === 0 ? (
                        <Box textAlign="center" py={8} color="gray.500">
                            Нет пользователей
                        </Box>
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
                                        <Td>{ROLE_TITLES[user.role] || user.role}</Td>
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

            {/* Modal для изменения роли */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Изменить роль пользователя</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedUser && (
                            <>
                                <p><strong>Имя:</strong> {selectedUser.name}</p>
                                <p><strong>Телефон:</strong> {selectedUser.phone}</p>
                                <FormControl mt={4}>
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
        </Box>
    );
};

export default DashboardAdmin;
