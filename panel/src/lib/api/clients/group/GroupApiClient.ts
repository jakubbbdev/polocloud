import {BaseApiClient} from '../../base/BaseApiClient.ts';
import { API_ENDPOINTS, GroupCreateModel, GroupCreateResponse, GroupEditModel } from '../../types.ts';

export class GroupApiClient extends BaseApiClient {

    async createGroup(groupData: GroupCreateModel): Promise<GroupCreateResponse> {
        try {
            

            const response = await this.client.post(
                this.buildUrl(API_ENDPOINTS.GROUPS.CREATE),
                groupData,
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            if (response.status === 201) {
                return response.data;
            }

            throw new Error(`Failed to create group: ${response.status}`);
        } catch (error: any) {
            if (error.response) {
                throw new Error(`Backend Error: ${error.response.data?.message || 'Unknown error'}`);
            }
            throw error;
        }
    }

    async deleteGroup(name: string) {
        try {
            

            const response = await this.client.delete(
                this.buildUrl(API_ENDPOINTS.GROUPS.DELETE(name)),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            

            return {
                success: true,
                data: response.data,
                message: 'Group deleted successfully'
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
                        message: `Failed to delete group: ${axiosError.response.status} ${axiosError.response.statusText}`
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


    async getGroup(name: string) {
        try {
            

            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.GROUPS.GET(name)),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data,
                message: 'Group fetched successfully'
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
                    if (axiosError.response.status === 404) {
                        return {
                            success: false,
                            message: 'Group not found'
                        };
                    }
                    return {
                        success: false,
                        message: `Failed to fetch group: ${axiosError.response.status} ${axiosError.response.statusText}`
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

    async getGroups() {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.GROUPS.LIST),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            let groupsData = response.data;

            if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                groupsData = response.data.data;
            }

            if (!Array.isArray(groupsData)) {
                
                groupsData = [];
            }

            return {
                success: true,
                data: groupsData,
                message: 'Groups fetched successfully'
            };

        } catch (error) {
            

            if (error && typeof error === 'object' && 'isAxiosError' in error) {
                const axiosError = error as any;

                if (axiosError.code === 'ECONNABORTED') {
                    return {
                        success: false,
                        message: 'Request timeout - server not responding',
                        data: []
                    };
                } else if (axiosError.response) {
                    return {
                        success: false,
                        message: `Failed to fetch groups: ${axiosError.response.status} ${axiosError.response.statusText}`,
                        data: []
                    };
                } else if (axiosError.request) {
                    return {
                        success: false,
                        message: 'No response received from server',
                        data: []
                    };
                }
            }

            return {
                success: false,
                message: `Request error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                data: []
            };
        }
    }

    async getCurrentGroupCount() {
        try {
            const params = {
                from: 0,
                to: 0
            };

            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.GROUPS.COUNT),
                {
                    timeout: 10000,
                    withCredentials: true,
                    params: params,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data,
                message: 'Current group count fetched successfully'
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
                        message: `Failed to fetch current group count: ${axiosError.response.status} ${axiosError.response.statusText}`
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


    async getGroupCount() {
        try {
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

            const params = {
                from: sevenDaysAgo.getTime(),
                to: now.getTime()
            };


            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.GROUPS.COUNT),
                {
                    timeout: 10000,
                    withCredentials: true,
                    params: params,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data,
                message: 'Group count fetched successfully'
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
                        message: `Failed to fetch group count: ${axiosError.response.status} ${axiosError.response.statusText}`
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

    async updateGroup(name: string, groupData: GroupEditModel) {
        try {
            const response = await this.client.patch(
                this.buildUrl(API_ENDPOINTS.GROUPS.UPDATE(name)),
                groupData,
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data,
                message: 'Group updated successfully'
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
                        message: `Failed to update group: ${axiosError.response.status} ${axiosError.response.statusText}`
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

export const groupApi = new GroupApiClient();
