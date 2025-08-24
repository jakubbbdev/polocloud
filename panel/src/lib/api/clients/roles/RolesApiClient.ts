import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS, ApiResponse, RoleDetails} from '../../types.ts';


export class RolesApiClient extends BaseApiClient {

    async getRoles(): Promise<ApiResponse<RoleDetails[]>> {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.ROLES.ALL),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data as RoleDetails[],
                message: 'Roles fetched successfully'
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
                        message: `Failed to fetch roles: ${axiosError.response.status} ${axiosError.response.statusText}`
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


    async getRole(id: string): Promise<ApiResponse<RoleDetails>> {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.ROLES.BY_ID(id)),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data as RoleDetails,
                message: 'Role fetched successfully'
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
                        message: `Failed to fetch role: ${axiosError.response.status} ${axiosError.response.statusText}`
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


    async createRole(roleData: Partial<RoleDetails>): Promise<ApiResponse<RoleDetails>> {
        try {
            const response = await this.client.post(
                this.buildUrl(API_ENDPOINTS.ROLES.CREATE),
                roleData,
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
                data: response.data as RoleDetails,
                message: 'Role created successfully'
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
                        message: `Failed to create role: ${axiosError.response.status} ${axiosError.response.statusText}`
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


    async updateRole(id: string, roleData: Partial<RoleDetails>): Promise<ApiResponse<RoleDetails>> {
        try {
            const response = await this.client.patch(
                this.buildUrl(API_ENDPOINTS.ROLES.UPDATE(id)),
                roleData,
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
                data: response.data as RoleDetails,
                message: 'Role updated successfully'
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
                        message: `Failed to update role: ${axiosError.response.status} ${axiosError.response.statusText} - ${JSON.stringify(axiosError.response.data)}`
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

    async deleteRole(id: string): Promise<ApiResponse<null>> {
        try {
            const response = await this.client.delete(
                this.buildUrl(API_ENDPOINTS.ROLES.DELETE(id)),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            console.log(response);
            return {
                success: true,
                data: null,
                message: 'Role deleted successfully'
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
                        message: `Failed to delete role: ${axiosError.response.status} ${axiosError.response.statusText}`
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

export const rolesApi = new RolesApiClient();
