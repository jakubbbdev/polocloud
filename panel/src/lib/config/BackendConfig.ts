export class BackendConfig {
    private static instance: BackendConfig;
    private backendURL: string | null = null;

    private constructor() {}

    public static getInstance(): BackendConfig {
        if (!BackendConfig.instance) {
            BackendConfig.instance = new BackendConfig();
        }
        return BackendConfig.instance;
    }

    public getBackendIP(): string {
        const ip = import.meta.env.VITE_BACKEND_IP;
        if (!ip) {
            throw new Error('VITE_BACKEND_IP ist nicht gesetzt!');
        }
        return ip;
    }

    public getBackendPort(): string {
        return import.meta.env.VITE_BACKEND_PORT || '8080';
    }

    public getBackendPath(): string {
        return import.meta.env.VITE_BACKEND_PATH || '/polocloud';
    }

    public getBackendProtocol(): string {
        return import.meta.env.VITE_BACKEND_PROTOCOL || 'http';
    }

    public getBackendConfig(): { backendURL: string } | null {
        return this.backendURL ? { backendURL: this.backendURL } : null;
    }

    public setBackendURL(url: string): void {
        this.backendURL = url;

        if (typeof window !== 'undefined') {
            localStorage.setItem('backendURL', url);
        }
    }

    public clearBackendConfig(): void {
        this.backendURL = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('backendURL');
        }
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