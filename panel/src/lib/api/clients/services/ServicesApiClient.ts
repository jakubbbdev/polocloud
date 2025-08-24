import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS} from '../../types.ts';

export class ServicesApiClient extends BaseApiClient {
    async getServices() {
        try {

            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SERVICES.LIST),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );


            return {
                success: true,
                data: response.data,
                message: 'Services fetched successfully'
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
                        message: `Failed to fetch services: ${axiosError.response.status} ${axiosError.response.statusText}`
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
                message: `Request error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                data: []
            };
        }
    }

    async getCurrentServiceCount() {
        try {
            const params = {
                from: 0,
                to: 0
            };

            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SERVICES.COUNT),
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
                message: 'Current service count fetched successfully'
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
                        message: `Failed to fetch current service count: ${axiosError.response.status} ${axiosError.response.statusText}`
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

    async getServiceCount() {
        try {
            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

            const params = {
                from: twentyFourHoursAgo.getTime(),
                to: now.getTime()
            };

            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SERVICES.COUNT),
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
                message: 'Service count for last 24 hours fetched successfully'
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
                        message: `Failed to fetch service count for last 24 hours: ${axiosError.response.status} ${axiosError.response.statusText}`
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

    async sendCommand(serviceName: string, command: string) {
        try {
            

            const response = await this.client.post(
                this.buildUrl(API_ENDPOINTS.SERVICES.COMMAND(serviceName)),
                {command},
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
                message: 'Command sent successfully'
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
                        message: `Failed to send command: ${axiosError.response.status} ${axiosError.response.statusText}`
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

    async restartService(serviceName: string) {
        try {

            const response = await this.client.patch(
                this.buildUrl(API_ENDPOINTS.SERVICES.RESTART(serviceName)),
                {},
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );


            return {
                success: true,
                data: response.data,
                message: 'Service restarted successfully'
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
                            message: 'Service not found'
                        };
                    }
                    return {
                        success: false,
                        message: `Failed to restart service: ${axiosError.response.status} ${axiosError.response.statusText}`
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

export const servicesApi = new ServicesApiClient();