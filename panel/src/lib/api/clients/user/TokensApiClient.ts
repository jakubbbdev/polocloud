import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS} from '../../types.ts';

export class TokensApiClient extends BaseApiClient {

    async getTokens() {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.TOKENS.ALL),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data,
                message: 'Tokens fetched successfully'
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
                        message: `Failed to fetch tokens: ${axiosError.response.status} ${axiosError.response.statusText}`
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

export const tokensApi = new TokensApiClient();
