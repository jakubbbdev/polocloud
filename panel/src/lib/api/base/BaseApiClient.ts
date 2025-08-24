import {AxiosInstance, AxiosRequestConfig} from 'axios';
import {apiClient} from '../config/axiosConfig';
import {ApiErrorHandler} from '../utils/errorHandler';
import {ApiResponse, RequestConfig, HttpMethod} from '../types';

export abstract class BaseApiClient {
    readonly client: AxiosInstance;
    protected readonly baseURL: string;

    constructor(baseURL: string = '') {
        this.client = apiClient;
        this.baseURL = baseURL;
    }

    protected async request<T>(
        method: HttpMethod,
        endpoint: string,
        data?: any,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        try {
            const url = this.buildUrl(endpoint);
            const axiosConfig = this.buildAxiosConfig(method, config);

            let response;
            switch (method) {
                case 'GET':
                    response = await this.client.get(url, axiosConfig);
                    break;
                case 'POST':
                    response = await this.client.post(url, data, axiosConfig);
                    break;
                case 'PUT':
                    response = await this.client.put(url, data, axiosConfig);
                    break;
                case 'DELETE':
                    response = await this.client.delete(url, axiosConfig);
                    break;
                case 'PATCH':
                    response = await this.client.patch(url, data, axiosConfig);
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }

            return ApiErrorHandler.createSuccess(response.data, `${method} request successful`);
        } catch (error) {
            return ApiErrorHandler.handleError<T>(error, `${method} request failed`);
        }
    }

    protected async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('GET', endpoint, undefined, config);
    }

    protected async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('POST', endpoint, data, config);
    }

    protected async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', endpoint, data, config);
    }

    protected async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', endpoint, undefined, config);
    }

    protected async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('PATCH', endpoint, data, config);
    }

    protected buildUrl(endpoint: string): string {
        return `${this.baseURL}${endpoint}`;
    }

    private buildAxiosConfig(method: HttpMethod, config?: RequestConfig): AxiosRequestConfig {
        const baseConfig: AxiosRequestConfig = {
            timeout: config?.timeout || 10000,
            withCredentials: config?.withCredentials ?? true,
        };

        if (config?.headers) {
            baseConfig.headers = config.headers  as typeof baseConfig.headers;
        }

        if (method === 'GET' && config?.params) {
            baseConfig.params = config.params;
        }

        return baseConfig;
    }

    protected createSuccess<T>(data: T, message: string): ApiResponse<T> {
        return ApiErrorHandler.createSuccess(data, message);
    }

    protected createError<T>(message: string, errorCode?: string): ApiResponse<T> {
        return ApiErrorHandler.createError(message, errorCode);
    }
}
