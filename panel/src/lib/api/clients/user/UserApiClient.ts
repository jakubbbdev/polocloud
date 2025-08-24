import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS} from '../../types.ts';

export class UserApiClient extends BaseApiClient {

    async getCurrentUser() {
        return this.get(API_ENDPOINTS.USER.SELF);
    }

    async getAllUsers() {
        return this.get(API_ENDPOINTS.USER.ALL);
    }

    async createUser(userData: { username: string; roleId: number }) {
        try {
            const response = await this.client.post(
                this.buildUrl(API_ENDPOINTS.USER.CREATE),
                userData,
                {
                    timeout: 10000,
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: {password: response.data?.password || 'default-password'},
                message: 'User created successfully'
            };

        } catch (error) {

            if (error && typeof error === 'object' && 'isAxiosError' in error) {
                const axiosError = error as any;
                if (axiosError.code === 'ECONNABORTED') {
                    return {
                        success: false,
                        message: 'Request timeout - server not responding'
                    };
                } else if (axiosError.response) {
                    return {
                        success: false,
                        message: `Failed to create user: ${axiosError.response.status} ${axiosError.response.statusText}`
                    };
                } else if (axiosError.request) {
                    return {
                        success: false,
                        message: 'No response received from server'
                    };
                }
            }

            return {
                success: false,
                message: `Request error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async updateUserRole(uuid: string, roleId: number) {
        try {
            const requestBody = {
                uuid: uuid,
                roleId: roleId
            };

            await this.client.patch(
                this.buildUrl(API_ENDPOINTS.USER.EDIT),
                requestBody,
                {
                    timeout: 10000,
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                message: 'User role updated successfully'
            };

        } catch (error) {

            if (error && typeof error === 'object' && 'isAxiosError' in error) {
                const axiosError = error as any;
                if (axiosError.code === 'ECONNABORTED') {
                    return {
                        success: false,
                        message: 'Request timeout - server not responding'
                    };
                } else if (axiosError.response) {
                    return {
                        success: false,
                        message: `Failed to update user role: ${axiosError.response.status} ${axiosError.response.statusText}`
                    };
                } else if (axiosError.request) {
                    return {
                        success: false,
                        message: 'No response received from server'
                    };
                }
            }

            return {
                success: false,
                message: `Request error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async updateSelf(userData: { username: string; password: string }) {
        try {
            await this.client.patch(
                this.buildUrl(API_ENDPOINTS.USER.EDIT_SELF),
                userData,
                {
                    timeout: 10000,
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                message: 'User updated successfully'
            };

        } catch (error) {

            if (error && typeof error === 'object' && 'isAxiosError' in error) {
                const axiosError = error as any;
                if (axiosError.code === 'ECONNABORTED') {
                    return {
                        success: false,
                        message: 'Request timeout - server not responding'
                    };
                } else if (axiosError.response) {
                    return {
                        success: false,
                        message: `Failed to update user: ${axiosError.response.status} ${axiosError.response.statusText}`
                    };
                } else if (axiosError.request) {
                    return {
                        success: false,
                        message: 'No response received from server'
                    };
                }
            }

            return {
                success: false,
                message: `Request error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async changePassword(password: string) {
        try {
            await this.client.patch(
                this.buildUrl(API_ENDPOINTS.USER.CHANGE_PASSWORD),
                {password},
                {
                    timeout: 10000,
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                message: 'Password changed successfully'
            };

        } catch (error) {

            if (error && typeof error === 'object' && 'isAxiosError' in error) {
                const axiosError = error as any;
                if (axiosError.code === 'ECONNABORTED') {
                    return {
                        success: false,
                        message: 'Request timeout - server not responding'
                    };
                } else if (axiosError.response) {
                    return {
                        success: false,
                        message: `Failed to change password: ${axiosError.response.status} ${axiosError.response.statusText}`
                    };
                } else if (axiosError.request) {
                    return {
                        success: false,
                        message: 'No response received from server'
                    };
                }
            }

            return {
                success: false,
                message: `Request error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }


    async updateUsername(username: string) {
        try {
            await this.client.patch(
                this.buildUrl(API_ENDPOINTS.USER.EDIT_SELF),
                {username: username},
                {
                    timeout: 10000,
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                message: 'Username updated successfully'
            };

        } catch (error) {

            if (error && typeof error === 'object' && 'isAxiosError' in error) {
                const axiosError = error as any;
                if (axiosError.code === 'ECONNABORTED') {
                    return {
                        success: false,
                        message: 'Request timeout - server not responding'
                    };
                } else if (axiosError.response) {
                    return {
                        success: false,
                        message: `Failed to update username: ${axiosError.response.status} ${axiosError.response.statusText}`
                    };
                } else if (axiosError.request) {
                    return {
                        success: false,
                        message: 'No response received from server'
                    };
                }
            }

            return {
                success: false,
                message: `Request error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async deleteUser(uuid: string) {
        try {
            const response = await this.client.delete(
                this.buildUrl(API_ENDPOINTS.USER.DELETE_USER(uuid)),
                {
                    timeout: 10000,
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data,
                message: 'User deleted successfully'
            };

        } catch (error) {

            if (error && typeof error === 'object' && 'isAxiosError' in error) {
                const axiosError = error as any;
                if (axiosError.code === 'ECONNABORTED') {
                    return {
                        success: false,
                        message: 'Request timeout - server not responding'
                    };
                } else if (axiosError.response) {
                    return {
                        success: false,
                        message: `Failed to delete user: ${axiosError.response.status} ${axiosError.response.statusText}`
                    };
                } else if (axiosError.request) {
                    return {
                        success: false,
                        message: 'No response received from server'
                    };
                }
            }

            return {
                success: false,
                message: `Request error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

export const userApi = new UserApiClient();
