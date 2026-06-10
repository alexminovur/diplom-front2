import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Heading,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Checkbox,
    CheckboxGroup,
    Stack,
    SimpleGrid,
    FormControl,
    FormLabel,
    Select,
    Input,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    useToast,
    Flex,
    Spinner,
    IconButton,
    Divider,
} from '@chakra-ui/react';
import { DownloadIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const REPORT_TYPE_LABELS = {
    finance: 'Финансовый',
    orders: 'По заказам',
    clients: 'По клиентам',
    employees: 'По сотрудникам',
};

const FORMAT_OPTIONS = [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'csv', label: 'CSV' },
];

const getDefaultDateRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const toInputValue = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        startDate: toInputValue(start),
        endDate: toInputValue(now),
    };
};

const getRole = () => localStorage.getItem('role');

const getAllowedReportTypes = (role) => {
    const base = [
        { value: 'finance', label: REPORT_TYPE_LABELS.finance },
        { value: 'orders', label: REPORT_TYPE_LABELS.orders },
        { value: 'clients', label: REPORT_TYPE_LABELS.clients },
    ];

    if (role === 'admin') {
        return [...base, { value: 'employees', label: REPORT_TYPE_LABELS.employees }];
    }

    return base;
};

const getReportTypeLabel = (value) => REPORT_TYPE_LABELS[value] || value || 'Неизвестно';

const getFormatLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (!normalized) return 'Неизвестно';

    if (normalized === 'zip') return 'ZIP';

    const found = FORMAT_OPTIONS.find((item) => item.value === normalized);
    return found ? found.label : normalized.toUpperCase();
};

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('ru-RU');
};

const formatAuthor = (value) => {
    if (!value && value !== 0) return '—';
    if (typeof value === 'object') {
        return value.name || value.full_name || value.username || value.phone || `#${value.id ?? '—'}`;
    }
    return `#${value}`;
};

const formatPeriod = (startDate, endDate) => {
    if (!startDate && !endDate) return '—';
    return `${formatDate(startDate)} — ${formatDate(endDate)}`;
};

const parseFilename = (contentDisposition) => {
    if (!contentDisposition) return null;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        try {
            return decodeURIComponent(utf8Match[1]);
        } catch {
            return utf8Match[1];
        }
    }

    const fileMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    return fileMatch?.[1] || null;
};

const normalizeRequestPath = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;

    let path = String(url);
    if (path.startsWith('/api/')) {
        path = path.slice(4);
    } else if (path.startsWith('/api')) {
        path = path.slice(4);
    }

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    return path;
};

const downloadBlob = (blob, filename) => {
    const link = document.createElement('a');
    const objectUrl = window.URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
};

const getBlobErrorMessage = async (error, fallback) => {
    const responseData = error?.response?.data;

    if (responseData instanceof Blob) {
        try {
            const text = await responseData.text();
            if (!text) return fallback;
            try {
                const parsed = JSON.parse(text);
                return parsed.detail || parsed.message || fallback;
            } catch {
                return text;
            }
        } catch {
            return fallback;
        }
    }

    if (typeof responseData === 'string') {
        return responseData;
    }

    if (responseData && typeof responseData === 'object') {
        return responseData.detail || responseData.message || fallback;
    }

    return fallback;
};

const Reports = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const role = getRole();
    const isAdmin = role === 'admin';
    const [activeTab, setActiveTab] = useState(0);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFormats, setSelectedFormats] = useState(['pdf']);
    const [formData, setFormData] = useState(() => {
        const dates = getDefaultDateRange();
        return {
            reportType: 'finance',
            startDate: dates.startDate,
            endDate: dates.endDate,
            includeCharts: true,
            includeStatistics: true,
        };
    });

    const reportTypeOptions = useMemo(() => getAllowedReportTypes(role), [role]);

    useEffect(() => {
        if (!reportTypeOptions.some((item) => item.value === formData.reportType) && reportTypeOptions.length > 0) {
            setFormData((prev) => ({ ...prev, reportType: reportTypeOptions[0].value }));
        }
    }, [role, reportTypeOptions, formData.reportType]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const response = await api.get('/reports/history');
            setHistory(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast({
                title: 'Ошибка загрузки',
                description: error.response?.data?.detail || 'Не удалось загрузить историю отчетов',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setHistoryLoading(false);
        }
    };

    const refreshHistory = async () => {
        setRefreshing(true);
        try {
            await fetchHistory();
        } finally {
            setRefreshing(false);
        }
    };

    const validateForm = () => {
        if (!formData.reportType) {
            return 'Выберите тип отчета';
        }
        if (!formData.startDate || !formData.endDate) {
            return 'Выберите даты периода';
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            return 'Дата начала не может быть позже даты окончания';
        }
        return null;
    };

    const handleGenerateReport = async () => {
        const validationError = validateForm();
        if (validationError) {
            toast({
                title: 'Ошибка',
                description: validationError,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const formats = selectedFormats.length > 0 ? selectedFormats : ['pdf'];

        setGenerating(true);
        try {
            const response = await api.post(
                '/reports/generate',
                {
                    report_type: formData.reportType,
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    formats,
                    include_charts: formData.includeCharts,
                    include_statistics: formData.includeStatistics,
                },
                { responseType: 'blob' }
            );

            const filenameFromHeader = parseFilename(response.headers?.['content-disposition']);
            const fallbackExtension = formats.length > 1 ? 'zip' : formats[0] || 'pdf';
            const filename = filenameFromHeader || `report-${formData.reportType}-${formData.startDate}_${formData.endDate}.${fallbackExtension}`;
            downloadBlob(response.data, filename);

            toast({
                title: 'Отчет сформирован',
                description: 'Файл отчета успешно создан и скачивается',
                status: 'success',
                duration: 3500,
                isClosable: true,
            });

            await fetchHistory();
        } catch (error) {
            toast({
                title: 'Ошибка генерации',
                description: await getBlobErrorMessage(error, 'Не удалось сформировать отчет'),
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleDownloadReport = async (item) => {
        if (!item?.download_url) {
            toast({
                title: 'Ошибка',
                description: 'Ссылка на скачивание отчета отсутствует',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await api.get(normalizeRequestPath(item.download_url), { responseType: 'blob' });
            const filenameFromHeader = parseFilename(response.headers?.['content-disposition']);
            const fallbackExtension = String(item.format || 'pdf').toLowerCase();
            const filename = filenameFromHeader || `report-${item.id}.${fallbackExtension}`;
            downloadBlob(response.data, filename);

            toast({
                title: 'Отчет скачан',
                description: 'Файл отчета успешно загружен',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Ошибка скачивания',
                description: await getBlobErrorMessage(error, 'Не удалось скачать отчет'),
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        }
    };

    const handleDeleteReport = async (item) => {
        if (!isAdmin) return;
        if (!window.confirm('Удалить отчет? Это действие нельзя отменить.')) {
            return;
        }

        try {
            await api.delete(`/reports/${item.id}`);
            toast({
                title: 'Отчет удален',
                description: 'Файл и запись отчета удалены',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            await fetchHistory();
        } catch (error) {
            toast({
                title: 'Ошибка удаления',
                description: error.response?.data?.detail || 'Не удалось удалить отчет',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        }
    };

    const backPath = role === 'admin' ? '/dashboard/admin' : '/dashboard/manager';

    return (
        <Box>
            <Flex align="center" justify="space-between" mb={6} gap={4} wrap="wrap">
                <Box>
                    <Heading color="brand.800">Отчетность</Heading>
                    <Text color="gray.600" mt={1}>
                        Формирование и история отчетов для {isAdmin ? 'администратора' : 'менеджера'}
                    </Text>
                </Box>

                <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate(backPath)}>
                    Назад в кабинет
                </Button>
            </Flex>

            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
                <TabList>
                    <Tab>Создать отчет</Tab>
                    <Tab>История отчетов</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel px={0}>
                        <Card>
                            <CardHeader>
                                <Heading size="md">Создание отчета</Heading>
                            </CardHeader>
                            <CardBody>
                                <Stack spacing={5}>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Тип отчета</FormLabel>
                                            <Select
                                                value={formData.reportType}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, reportType: e.target.value }))}
                                            >
                                                {reportTypeOptions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Форматы экспорта</FormLabel>
                                            <CheckboxGroup
                                                value={selectedFormats}
                                                onChange={setSelectedFormats}
                                            >
                                                <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                                                    {FORMAT_OPTIONS.map((item) => (
                                                        <Checkbox key={item.value} value={item.value}>
                                                            {item.label}
                                                        </Checkbox>
                                                    ))}
                                                </Stack>
                                            </CheckboxGroup>
                                        </FormControl>
                                    </SimpleGrid>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel>Дата начала периода</FormLabel>
                                            <Input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Дата окончания периода</FormLabel>
                                            <Input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                                            />
                                        </FormControl>
                                    </SimpleGrid>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <Checkbox
                                                isChecked={formData.includeCharts}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, includeCharts: e.target.checked }))}
                                            >
                                                Добавить графики
                                            </Checkbox>
                                        </FormControl>

                                        <FormControl>
                                            <Checkbox
                                                isChecked={formData.includeStatistics}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, includeStatistics: e.target.checked }))}
                                            >
                                                Добавить статистику
                                            </Checkbox>
                                        </FormControl>
                                    </SimpleGrid>

                                    <Divider />

                                    <Text color="gray.600" fontSize="sm">
                                        Если выбрать несколько форматов, отчет будет скачан архивом ZIP.
                                    </Text>
                                </Stack>
                            </CardBody>
                            <CardFooter>
                                <Button
                                    colorScheme="orange"
                                    onClick={handleGenerateReport}
                                    isLoading={generating}
                                >
                                    Сформировать отчет
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabPanel>

                    <TabPanel px={0}>
                        <Card>
                            <CardHeader>
                                <Flex justify="space-between" align="center" gap={4} wrap="wrap">
                                    <Heading size="md">История отчетов</Heading>
                                    <Button size="sm" onClick={refreshHistory} isLoading={refreshing}>
                                        Обновить
                                    </Button>
                                </Flex>
                            </CardHeader>
                            <CardBody>
                                {historyLoading ? (
                                    <Flex justify="center" py={10}>
                                        <Spinner size="xl" />
                                    </Flex>
                                ) : history.length === 0 ? (
                                    <Text textAlign="center" py={8} color="gray.500">
                                        Пока нет сгенерированных отчетов
                                    </Text>
                                ) : (
                                    <Box overflowX="auto">
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Тип отчета</Th>
                                                    <Th>Период</Th>
                                                    <Th>Дата создания</Th>
                                                    <Th>Формат</Th>
                                                    <Th>Автор</Th>
                                                    <Th>Действия</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {history.map((item) => (
                                                    <Tr key={item.id}>
                                                        <Td>
                                                            <Badge colorScheme="blue">
                                                                {getReportTypeLabel(item.report_type)}
                                                            </Badge>
                                                        </Td>
                                                        <Td>{formatPeriod(item.start_date, item.end_date)}</Td>
                                                        <Td>{formatDate(item.created_at)}</Td>
                                                        <Td>{getFormatLabel(item.format)}</Td>
                                                        <Td>{formatAuthor(item.created_by)}</Td>
                                                        <Td>
                                                            <Stack direction="row" spacing={2}>
                                                                <IconButton
                                                                    aria-label="Скачать отчет"
                                                                    icon={<DownloadIcon />}
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    onClick={() => handleDownloadReport(item)}
                                                                    isDisabled={!item.download_url}
                                                                />
                                                                {isAdmin && (
                                                                    <IconButton
                                                                        aria-label="Удалить отчет"
                                                                        icon={<DeleteIcon />}
                                                                        size="sm"
                                                                        colorScheme="red"
                                                                        variant="outline"
                                                                        onClick={() => handleDeleteReport(item)}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default Reports;
