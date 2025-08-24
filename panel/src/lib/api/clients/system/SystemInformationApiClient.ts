import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS} from '../../types.ts';

export interface SystemInfo {
    memoryUsage: number;
    cpuUsage: number;
    runtime: string;
    uptime: number;
}

export interface SystemAverage {
    avgCpu: number;
    avgRam: number;
    from: number;
    to: number;
}

export interface SystemDataPoint {
    timestamp: number;
    avgCpu: number;
    avgRam: number;
}

export interface SystemVersion {
    version: string;
}

export class SystemInformationApiClient extends BaseApiClient {
    async getSystemInformation() {
        try {

            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SYSTEM.INFORMATION),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data as SystemInfo,
                message: 'System information fetched successfully'
            };

        } catch (error) {
            return {success: false, data: null, message: 'Failed to fetch system information'};
        }
    }

    async getSystemAverage(from: number, to: number) {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SYSTEM.AVERAGE),
                {
                    params: {from, to},
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );
            return {
                success: true,
                data: response.data as SystemAverage,
                message: 'System average fetched successfully'
            };
        } catch (error) {
            return {success: false, data: null, message: 'Failed to fetch system average'};
        }
    }

    async getSystemDataMinutes(from: number, to: number) {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SYSTEM.MINUTES),
                {
                    params: {from, to},
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );
            return {
                success: true,
                data: response.data as SystemDataPoint[],
                message: 'System minutes data fetched successfully'
            };
        } catch (error) {
            return {success: false, data: null, message: 'Failed to fetch system minutes data'};
        }
    }

    async getSystemDataHours(from: number, to: number) {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SYSTEM.HOURS),
                {
                    params: {from, to},
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );
            return {
                success: true,
                data: response.data as SystemDataPoint[],
                message: 'System hours data fetched successfully'
            };
        } catch (error) {
            return {success: false, data: null, message: 'Failed to fetch system hours data'};
        }
    }

    async getSystemDataDays(from: number, to: number) {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SYSTEM.DAYS),
                {
                    params: {from, to},
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );
            return {
                success: true,
                data: response.data as SystemDataPoint[],
                message: 'System days data fetched successfully'
            };
        } catch (error) {
            return {success: false, data: null, message: 'Failed to fetch system days data'};
        }
    }

    async getSystemVersion() {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.SYSTEM.VERSION),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            return {
                success: true,
                data: response.data as SystemVersion,
                message: 'System version fetched successfully'
            };
        } catch (error) {
            return {success: false, data: null, message: 'Failed to fetch system version'};
        }
    }
}

export const systemInformationApi = new SystemInformationApiClient();
