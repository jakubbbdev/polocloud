import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS} from '../../types.ts';
import {apiClient} from '../../config/axiosConfig.ts';


export class OnboardingApiClient extends BaseApiClient {

    async testConnection() {
        try {
            const response = await apiClient.get(
                this.buildUrl(API_ENDPOINTS.ONBOARDING.TEST_CONNECTION),
                {
                    timeout: 10000,
                    withCredentials: false,
                    validateStatus: (status) => status >= 200 && status < 300
                }

            );
            console.log(response);
            return true;
        } catch (error) {
            if (error && typeof error === 'object' && 'isAxiosError' in error) {
                const axiosError = error as any;
                if (axiosError.code === 'ECONNABORTED') {
                    
                } else if (axiosError.response) {
                    
                } else if (axiosError.request) {
                    
                }
            }

            return false;
        }
    }

    async createAdminUser(username: string, password: string): Promise<{
        success: boolean;
        message: string;
        data?: any
    }> {
        try {
            const response = await apiClient.post(
                this.buildUrl(API_ENDPOINTS.USER.CREATE_SELF),
                {
                    username,
                    password,
                    roleId: -1
                },
                {
                    timeout: 10000,
                    withCredentials: false,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                message: 'Admin user created successfully',
                data: response.data
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
                        message: `Failed to create admin user: ${axiosError.response.status} ${axiosError.response.statusText}`
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

export const onboardingApi = new OnboardingApiClient();
