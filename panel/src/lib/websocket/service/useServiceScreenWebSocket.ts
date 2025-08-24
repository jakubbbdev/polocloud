import { useState, useEffect, useCallback } from 'react';
import {MessageHandler, WebSocketMessage} from "@/lib/websocket/WebSocketManager.ts";
import {useWebSocket} from "@/lib/websocket/useWebSocket.ts";
import {userApi} from "@/lib/api";
import {BackendConfig} from "@/lib/config/BackendConfig.ts";

export interface UseServiceScreenWebSocketOptions {
    serviceName: string;
    autoConnect?: boolean;
    onLog?: (log: string) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

export interface UseServiceScreenWebSocketReturn {
    connected: boolean;
    connecting: boolean;
    latency: number;
    connect: () => Promise<boolean>;
    disconnect: () => void;
    send: (message: WebSocketMessage) => boolean;
    subscribe: (messageType: string, handler: MessageHandler) => () => void;
}

const SERVICE_SCREEN_WS_ID = 'polocloud-service-screen';

export function useServiceScreenWebSocket(options: UseServiceScreenWebSocketOptions): UseServiceScreenWebSocketReturn {
    const [token, setToken] = useState<string | null>(null);
    const [isTokenLoading, setIsTokenLoading] = useState(false);

    const getCurrentToken = useCallback(async (): Promise<string | null> => {
        try {
            setIsTokenLoading(true);

            const tokenResponse = await (userApi as any).client.get('/api/v3/auth/token', {
                withCredentials: true,
                timeout: 10000
            });

            if (tokenResponse.data && tokenResponse.data.token) {
                const newToken = tokenResponse.data.token;
                setToken(newToken);
                return newToken;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        } finally {
            setIsTokenLoading(false);
        }
    }, []);

    const wsUrl = BackendConfig.getInstance().getServiceScreenWebSocketURL(options.serviceName);


    const webSocket = useWebSocket({
        id: `${SERVICE_SCREEN_WS_ID}-${options.serviceName}`,
        url: wsUrl,
        token: token || undefined,
        autoConnect: false,
        onMessage: (message) => {

            if (message.type === 'raw' && typeof message.data === 'string') {
                options.onLog?.(message.data);
            } else if (typeof message.data === 'string') {
                options.onLog?.(message.data);
            } else {
            }
        },
        onConnect: () => {
            options.onConnect?.();
        },
        onDisconnect: () => {
            options.onDisconnect?.();
        },
        onError: (error) => {
            options.onError?.(error);
        }
    });

    const connect = useCallback(async (): Promise<boolean> => {
        if (!token) {
            const newToken = await getCurrentToken();
            if (!newToken) {
                return false;
            }
        }

        return webSocket.connect();
    }, [token, getCurrentToken, webSocket]);

    useEffect(() => {
        if (options.autoConnect && !token) {
            getCurrentToken();
        }
    }, [options.autoConnect, token, getCurrentToken]);

    useEffect(() => {
        if (token && options.autoConnect) {
            const timer = setTimeout(() => {
                webSocket.connect();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [token, options.autoConnect, webSocket]);

    return {
        connected: webSocket.connected,
        connecting: webSocket.connecting || isTokenLoading,
        latency: webSocket.latency,
        connect,
        disconnect: webSocket.disconnect,
        send: webSocket.send,
        subscribe: webSocket.subscribe
    };
}
