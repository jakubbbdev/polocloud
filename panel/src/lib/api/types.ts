export interface Player {
    name: string;
    uuid: string;
    currentServiceName: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface RequestConfig {
    timeout?: number;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    withCredentials?: boolean;
}

export const API_BASE_PATH = '/api/v3';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_PATH}/auth/login`,
        LOGOUT: `${API_BASE_PATH}/auth/logout`,
    },
    USER: {
        SELF: `${API_BASE_PATH}/user/self`,
        ALL: `${API_BASE_PATH}/users`,
        BY_ID: (id: string) => `${API_BASE_PATH}/user/${id}`,
        CREATE: `${API_BASE_PATH}/user/`,
        CREATE_SELF: `${API_BASE_PATH}/user/self`,
        EDIT: `${API_BASE_PATH}/user/edit`,
        EDIT_SELF: `${API_BASE_PATH}/user/self/edit`,
        CHANGE_PASSWORD: `${API_BASE_PATH}/user/self/change-password`,
        DELETE_SELF: `${API_BASE_PATH}/user/self`,
        DELETE_USER: (uuid: string) => `${API_BASE_PATH}/user/${uuid}`,
    },
    ROLES: {
        ALL: `${API_BASE_PATH}/roles`,
        BY_ID: (id: string) => `${API_BASE_PATH}/role/${id}`,
        CREATE: `${API_BASE_PATH}/role`,
        UPDATE: (id: string) => `${API_BASE_PATH}/role/${id}`,
        DELETE: (id: string) => `${API_BASE_PATH}/role/${id}`,
    },
    TOKENS: {
        ALL: `${API_BASE_PATH}/user/tokens`,
        BY_ID: (id: string) => `${API_BASE_PATH}/user/token/${id}`,
        CREATE: `${API_BASE_PATH}/user/token`,
        DELETE: (id: string) => `${API_BASE_PATH}/user/token/${id}`,
    },
    ONBOARDING: {
        TEST_CONNECTION: `${API_BASE_PATH}/alive`,
    },
    GROUPS: {
        COUNT: `${API_BASE_PATH}/groups/count`,
        LIST: `${API_BASE_PATH}/groups/list`,
        GET: (name: string) => `${API_BASE_PATH}/group/${name}`,
        CREATE: `${API_BASE_PATH}/group/create`,
        DELETE: (name: string) => `${API_BASE_PATH}/group/${name}`,
        UPDATE: (name: string) => `${API_BASE_PATH}/group/${name}`,
    },
    SERVICES: {
        COUNT: `${API_BASE_PATH}/services/count`,
        LIST: `${API_BASE_PATH}/services/list`,
        COMMAND: (serviceName: string) => `${API_BASE_PATH}/service/${serviceName}/command`,
        RESTART: (serviceName: string) => `${API_BASE_PATH}/service/${serviceName}/restart`,
    },
    SYSTEM: {
        INFORMATION: `${API_BASE_PATH}/system/information`,
        AVERAGE: `${API_BASE_PATH}/system/information/average`,
        MINUTES: `${API_BASE_PATH}/system/information/minutes`,
        HOURS: `${API_BASE_PATH}/system/information/hours`,
        DAYS: `${API_BASE_PATH}/system/information/days`,
        VERSION: `${API_BASE_PATH}/system/version`,
    },
    PLAYERS: {
        LIST: `${API_BASE_PATH}/players/list`,
        GET: (playerName: string) => `${API_BASE_PATH}/player/${playerName}`,
    },
    PLATFORM: {
        LIST: `${API_BASE_PATH}/platforms/list`,
    },
    TERMINAL: {
        COMMAND: `${API_BASE_PATH}/terminal/command`,
    },
    TEMPLATES: {
        LIST: `${API_BASE_PATH}/templates/list`,
        CREATE: `${API_BASE_PATH}/template/`,
        DELETE: (templateName: string) => `${API_BASE_PATH}/template/${templateName}`,
        EDIT: (templateName: string) => `${API_BASE_PATH}/template/${templateName}`,
    }
} as const;

export interface PlatformVersion {
    version: string;
}

export interface Platform {
    name: string;
    type: 'SERVER' | 'PROXY';
}

export interface PlatformWithVersions {
    platform: Platform;
    versions: PlatformVersion[];
}

export interface GroupCreateModel {
    name: string;
    minMemory: number;
    maxMemory: number;
    minOnlineService: number;
    maxOnlineService: number;
    platform: {
        name: string;
        version: string;
    };
    percentageToStartNewService: number;
    information: {
        createdAt: number;
    };
    templates: string[];
    properties: Record<string, any>;
}

export interface GroupCreateResponse {
    message: string;
}

export interface GroupEditModel {
    minMemory: number;
    maxMemory: number;
    minOnlineService: number;
    maxOnlineService: number;
    percentageToStartNewService: number;
}

export interface BackendPaginatedResponse<T> {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    data: T[];
}

export interface CurrentUser {
    username?: string;
    name?: string;
    uuid?: string;
    id?: string;
    role?: number;
    hasChangedPassword?: boolean;
}

export interface RoleDetails {
    id: string;
    label: string;
    hexColor: string;
    userCount: number;
    permissions?: string[];
}

export interface Role extends RoleDetails{
    name?: string;
    isDefaultRole?: boolean;
}

export interface Template {
    name: string;
    size: number;
}

export interface CreateTemplateRequest {
    name: string;
}

export interface EditTemplateRequest {
    name: string;
}
