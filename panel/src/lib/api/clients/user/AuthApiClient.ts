import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS} from '../../types.ts';

interface LoginResponse {
    token?: string;

    [key: string]: any;
}


export class AuthApiClient extends BaseApiClient {

    async login(username: string, password: string) {
        try {
            const response = await this.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
                username,
                password
            });

            if (response.success) {
                let token = null;

                if (response.data && response.data.token) {
                    token = response.data.token;
                }

                if (!token) {
                    const responseHeaders = (response as any).headers;
                    if (responseHeaders && responseHeaders['set-cookie']) {
                        const setCookieHeader = responseHeaders['set-cookie'];

                        const tokenMatch = setCookieHeader.find((cookie: string) =>
                            cookie.startsWith('token=')
                        );
                        if (tokenMatch) {
                            token = tokenMatch.split('=')[1].split(';')[0];
                        }
                    }
                }

                if (!token) {
                    const cookieToken = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('token='))
                        ?.split('=')[1];

                    if (cookieToken) {
                        token = cookieToken;
                    }
                }

                if (token) {
                    localStorage.setItem('authToken', token);

                    document.cookie = `token=${token}; path=/; SameSite=Lax`;
                }
            }

            return response;
        } catch (error) {

            throw error;
        }
    }

    async logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');

        return this.post(API_ENDPOINTS.AUTH.LOGOUT);
    }
}

export const authApi = new AuthApiClient();
