class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    on(event: string, listener: Function): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event: string, listener: Function): void {
        if (!this.events[event]) return;
        const index = this.events[event].indexOf(listener);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    emit(event: string, ...args: any[]): void {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }
}

export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: number;
}

export interface WebSocketConnection {
    id: string;
    url: string;
    connected: boolean;
    connecting: boolean;
    lastPing?: number;
    latency?: number;
}

export type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketManager extends EventEmitter {
    private connections: Map<string, WebSocket> = new Map();
    private connectionStatus: Map<string, WebSocketConnection> = new Map();
    private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
    private reconnectIntervals: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private pingIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
    private readonly maxReconnectAttempts = 5;
    private readonly reconnectDelay = 1000;
    private readonly pingInterval = 30000;

    constructor() {
        super();
        this.setupGlobalEventHandlers();
    }

    async connect(id: string, url: string, token?: string): Promise<boolean> {
        try {
            const existingStatus = this.connectionStatus.get(id);
            if (existingStatus?.connecting || existingStatus?.connected) {
                
                return existingStatus.connected;
            }

            

            this.disconnect(id);

            const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;

            const ws = new WebSocket(wsUrl);

            this.connections.set(id, ws);
            this.connectionStatus.set(id, {
                id,
                url,
                connected: false,
                connecting: true
            });

            ws.onopen = () => this.handleOpen(id);
            ws.onmessage = (event) => this.handleMessage(id, event);
            ws.onclose = (event) => this.handleClose(id, event);
            ws.onerror = (error) => this.handleError(id, error);

            return new Promise((resolve) => {
                const checkConnection = () => {
                    const status = this.connectionStatus.get(id);
                    if (status && !status.connecting) {
                        resolve(status.connected);
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });

        } catch (error) {
            
            this.connectionStatus.set(id, {
                id,
                url,
                connected: false,
                connecting: false
            });
            return false;
        }
    }

    disconnect(id: string): void {
        const ws = this.connections.get(id);
        if (ws) {
            ws.close();
            this.connections.delete(id);
        }

        this.clearReconnectInterval(id);
        this.clearPingInterval(id);

        this.connectionStatus.set(id, {
            id,
            url: this.connectionStatus.get(id)?.url || '',
            connected: false,
            connecting: false
        });

        
    }

    send(id: string, message: WebSocketMessage): boolean {
        const ws = this.connections.get(id);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    subscribe(messageType: string, handler: MessageHandler): () => void {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, new Set());
        }

        this.messageHandlers.get(messageType)!.add(handler);

        return () => {
            const handlers = this.messageHandlers.get(messageType);
            if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    this.messageHandlers.delete(messageType);
                }
            }
        };
    }

    getConnectionStatus(id: string): WebSocketConnection | undefined {
        return this.connectionStatus.get(id);
    }

    private handleOpen(id: string): void {
        

        const status = this.connectionStatus.get(id);
        if (status) {
            status.connected = true;
            status.connecting = false;
        }

        this.emit('connection:open', { id });
        this.startPingInterval(id);
    }

    private handleMessage(id: string, event: MessageEvent): void {
        try {
            let message: WebSocketMessage;

            try {
                message = JSON.parse(event.data);
                message.timestamp = Date.now();

                if (message.type === 'pong') {
                    this.handlePong(id);
                    return;
                }

                this.emit('message', { id, message });

                const handlers = this.messageHandlers.get(message.type);
                if (handlers) {
                    handlers.forEach(handler => handler(message));
                }

            } catch (jsonError) {
                const rawMessage: WebSocketMessage = {
                    type: 'raw',
                    data: event.data,
                    timestamp: Date.now()
                };

                this.emit('message', { id, message: rawMessage });

                const handlers = this.messageHandlers.get('raw');
                if (handlers) {
                    handlers.forEach(handler => handler(rawMessage));
                }
            }

        } catch (error) {
        }
    }

    private handleClose(id: string, event: CloseEvent): void {

        const status = this.connectionStatus.get(id);
        if (status) {
            status.connected = false;
            status.connecting = false;
        }

        this.connections.delete(id);
        this.clearPingInterval(id);

        this.emit('connection:close', { id, code: event.code });

        if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005) {
            this.scheduleReconnect(id);
        }
    }

    private handleError(id: string, error: Event): void {
        this.emit('connection:error', { id, error });
    }

    private handlePong(id: string): void {
        const status = this.connectionStatus.get(id);
        if (status && status.lastPing) {
            status.latency = Date.now() - status.lastPing;
            this.emit('latency:update', { id, latency: status.latency });
        }
    }

    private startPingInterval(id: string): void {
        this.clearPingInterval(id);

        const interval = setInterval(() => {
            const ws = this.connections.get(id);
            if (ws && ws.readyState === WebSocket.OPEN) {
                const status = this.connectionStatus.get(id);
                if (status) {
                    status.lastPing = Date.now();
                }

                this.send(id, { type: 'ping', data: {}, timestamp: Date.now() });
            }
        }, this.pingInterval);

        this.pingIntervals.set(id, interval);
    }

    private clearPingInterval(id: string): void {
        const interval = this.pingIntervals.get(id);
        if (interval) {
            clearInterval(interval);
            this.pingIntervals.delete(id);
        }
    }

    private scheduleReconnect(id: string): void {
        this.clearReconnectInterval(id);

        const status = this.connectionStatus.get(id);
        if (!status) return;

        if (status.connecting) {
            return;
        }

        let attempts = 0;
        const attemptReconnect = async () => {
            attempts++;

            if (attempts <= this.maxReconnectAttempts) {
                const success = await this.connect(id, status.url);
                if (!success) {
                    const delay = this.reconnectDelay * Math.pow(2, attempts - 1);
                    const timeout = setTimeout(attemptReconnect, delay);
                    this.reconnectIntervals.set(id, timeout);
                }
            } else {
                this.emit('connection:failed', { id, attempts });
            }
        };

        const timeout = setTimeout(attemptReconnect, this.reconnectDelay);
        this.reconnectIntervals.set(id, timeout);
    }

    private clearReconnectInterval(id: string): void {
        const timeout = this.reconnectIntervals.get(id);
        if (timeout) {
            clearTimeout(timeout);
            this.reconnectIntervals.delete(id);
        }
    }

    private setupGlobalEventHandlers(): void {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.emit('app:background');
            } else {
                this.emit('app:foreground');
            }
        });

        window.addEventListener('beforeunload', () => {
            this.emit('app:unload');
            Array.from(this.connections.keys()).forEach(id => this.disconnect(id));
        });
    }
}

export const webSocketManager = new WebSocketManager();