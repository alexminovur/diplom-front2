export const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
    return phone;
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
};

export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
};
