import {useState, useEffect, useCallback} from 'react';
import {useWebSocket} from '../useWebSocket.ts';
import {WebSocketMessage, MessageHandler} from '../WebSocketManager.ts';
import {userApi} from '@/lib/api/clients/user/UserApiClient.ts';
import {BackendConfig} from '@/lib/config/BackendConfig.ts';

export interface UseBackendWebSocketOptions {
    autoConnect?: boolean;
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

export interface UseBackendWebSocketReturn {
    connected: boolean;
    connecting: boolean;
    latency: number;
    connect: () => Promise<boolean>;
    disconnect: () => void;
    send: (message: WebSocketMessage) => boolean;
    subscribe: (messageType: string, handler: MessageHandler) => () => void;
}

const BACKEND_WS_ID = 'backend-status';
const BACKEND_WS_URL = BackendConfig.getInstance().getBackendWebSocketURL();

export function useBackendWebSocket(options: UseBackendWebSocketOptions = {}): UseBackendWebSocketReturn {
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

    const webSocket = useWebSocket({
        id: BACKEND_WS_ID,
        url: BACKEND_WS_URL,
        token: token || undefined,
        autoConnect: false,
        onMessage: options.onMessage,
        onConnect: options.onConnect,
        onDisconnect: options.onDisconnect,
        onError: options.onError
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
