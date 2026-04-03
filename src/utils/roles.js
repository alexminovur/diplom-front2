export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    MASTER: 'master',
    CLIENT: 'client'
};

export const ROLE_TITLES = {
    [ROLES.ADMIN]: 'Администратор',
    [ROLES.MANAGER]: 'Менеджер',
    [ROLES.MASTER]: 'Мастер',
    [ROLES.CLIENT]: 'Клиент'
};

export const hasRole = (userRole, requiredRole) => {
    return userRole === requiredRole;
};

export const hasAnyRole = (userRole, roles) => {
    return roles.includes(userRole);
};
