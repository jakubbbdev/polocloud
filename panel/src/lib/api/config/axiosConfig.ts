import axios, {AxiosInstance} from 'axios';


export class AxiosConfig {
    private static instance: AxiosInstance;


    static getInstance(): AxiosInstance {
        if (!this.instance) {
            this.instance = this.createInstance();
        }
        return this.instance;
    }

    private static createInstance(): AxiosInstance {
        const baseURL = import.meta.env.PROD 
            ? `https://${import.meta.env.VITE_BACKEND_IP || '37.114.53.223'}:${import.meta.env.VITE_BACKEND_PORT || '8080'}/polocloud`
            : '/polocloud';
            

            
        const instance = axios.create({
            baseURL: baseURL,
            timeout: 10000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            validateStatus: (status) => status >= 200 && status < 300,
        });

        instance.interceptors.request.use(
            (config) => {
                if (import.meta.env.DEV) {
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        instance.interceptors.response.use(
            (response) => {
                if (import.meta.env.DEV) {
                }
                return response;
            },
            (error) => {
                if (import.meta.env.DEV) {
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }

}

export const apiClient = AxiosConfig.getInstance();
