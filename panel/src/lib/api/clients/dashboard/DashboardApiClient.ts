import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS, ApiResponse, CurrentUser} from '../../types.ts';


export class DashboardApiClient extends BaseApiClient {

    async getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.USER.SELF),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data as CurrentUser,
                message: 'User information fetched successfully'
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
                        message: `Failed to fetch user: ${axiosError.response.status} ${axiosError.response.statusText}`
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


    async testConnection() {
        try {
            await this.client.get(
                this.buildUrl(API_ENDPOINTS.USER.SELF),
                {
                    timeout: 5000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return true;

        } catch (error) {

            return false;
        }
    }
}

export const dashboardApi = new DashboardApiClient();
