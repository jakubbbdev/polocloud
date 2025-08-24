import { AxiosError } from 'axios';
import { ApiResponse } from '../types';


export class ApiErrorHandler {

    static handleError<T>(error: unknown, defaultMessage: string): ApiResponse<T> {

        if (this.isAxiosError(error)) {
            return this.handleAxiosError(error, defaultMessage);
        }

        return this.handleGenericError(error, defaultMessage);
    }

    private static handleAxiosError<T>(error: AxiosError, defaultMessage: string): ApiResponse<T> {
        if (error.code === 'ECONNABORTED') {
            return {
                success: false,
                message: 'Request timeout - server not responding',
                error: 'TIMEOUT'
            };
        }

        if (error.response) {
            const status = error.response.status;
            const statusText = error.response.statusText;

            return {
                success: false,
                message: `${defaultMessage}: ${status} ${statusText}`,
                error: `HTTP_${status}`
            };
        }
        if (error.request) {
            return {
                success: false,
                message: 'No response received from server',
                error: 'NETWORK_ERROR'
            };
        }

        return {
            success: false,
            message: `${defaultMessage}: ${error.message}`,
            error: 'AXIOS_ERROR'
        };
    }

    private static handleGenericError<T>(error: unknown, defaultMessage: string): ApiResponse<T> {
        if (error instanceof Error) {
            return {
                success: false,
                message: `${defaultMessage}: ${error.message}`,
                error: 'GENERIC_ERROR'
            };
        }

        return {
            success: false,
            message: `${defaultMessage}: Unknown error occurred`,
            error: 'UNKNOWN_ERROR'
        };
    }

    private static isAxiosError(error: unknown): error is AxiosError {
        return Boolean(error && typeof error === 'object' && 'isAxiosError' in error);
    }

    static createSuccess<T>(data: T, message: string): ApiResponse<T> {
        return {
            success: true,
            data,
            message
        };
    }

    static createError<T>(message: string, errorCode?: string): ApiResponse<T> {
        return {
            success: false,
            message,
            error: errorCode
        };
    }
}
