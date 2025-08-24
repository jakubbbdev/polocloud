export class BackendConfig {
    private static instance: BackendConfig;

    private constructor() {}

    public static getInstance(): BackendConfig {
        if (!BackendConfig.instance) {
            BackendConfig.instance = new BackendConfig();
        }
        return BackendConfig.instance;
    }

    public getBackendIP(): string {
        return import.meta.env.VITE_BACKEND_IP;
    }

    public getBackendPort(): string {
        return import.meta.env.VITE_BACKEND_PORT;
    }

    public getBackendPath(): string {
        return import.meta.env.VITE_BACKEND_PATH || '/polocloud';
    }

    public getBackendProtocol(): string {
        return import.meta.env.VITE_BACKEND_PROTOCOL || 'ws';
    }

    public getServiceScreenWebSocketURL(serviceName: string): string {
        return `${this.getBackendProtocol()}://${this.getBackendIP()}:${this.getBackendPort()}${this.getBackendPath()}/api/v3/service/${serviceName}/screen`;
    }

    public getLogsWebSocketURL(): string {
        return `${this.getBackendProtocol()}://${this.getBackendIP()}:${this.getBackendPort()}${this.getBackendPath()}/api/v3/logs`;
    }

    public getBackendWebSocketURL(): string {
        return `${this.getBackendProtocol()}://${this.getBackendIP()}:${this.getBackendPort()}${this.getBackendPath()}/api/v3/alive`;
    }
}