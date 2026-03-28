export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    MASTER: 'master',
    CUSTOMER: 'customer'
};

export const ROLE_TITLES = {
    [ROLES.ADMIN]: 'Администратор',
    [ROLES.MANAGER]: 'Менеджер',
    [ROLES.MASTER]: 'Мастер',
    [ROLES.CUSTOMER]: 'Заказчик'
};

export const hasRole = (userRole, requiredRole) => {
    return userRole === requiredRole;
};

export const hasAnyRole = (userRole, roles) => {
    return roles.includes(userRole);
};
