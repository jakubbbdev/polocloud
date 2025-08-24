import {useState, useEffect, useCallback, useRef} from 'react';
import {webSocketManager, WebSocketConnection, WebSocketMessage, MessageHandler} from './WebSocketManager';

export interface UseWebSocketOptions {
    id: string;
    url: string;
    token?: string;
    autoConnect?: boolean;
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: (connection: WebSocketConnection) => void;
    onDisconnect?: (connection: WebSocketConnection) => void;
    onError?: (error: Event) => void;
}

export interface UseWebSocketReturn {
    connection: WebSocketConnection | undefined;
    connected: boolean;
    connecting: boolean;
    latency: number;
    connect: () => Promise<boolean>;
    disconnect: () => void;
    send: (message: WebSocketMessage) => boolean;
    subscribe: (messageType: string, handler: MessageHandler) => () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
    const {
        id,
        url,
        token,
        autoConnect = true,
        onMessage,
        onConnect,
        onDisconnect,
        onError
    } = options;

    const [connection, setConnection] = useState<WebSocketConnection | undefined>();
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [latency, setLatency] = useState(0);

    const unsubscribeRefs = useRef<Array<() => void>>([]);

    const updateState = useCallback(() => {
        const status = webSocketManager.getConnectionStatus(id);
        if (status) {
            setConnection(status);
            setConnected(status.connected);
            setConnecting(status.connecting);
            setLatency(status.latency || 0);
        }
    }, [id]);

    const connect = useCallback(async (): Promise<boolean> => {
        const success = await webSocketManager.connect(id, url, token);
        updateState();
        return success;
    }, [id, url, token, updateState]);

    const disconnect = useCallback(() => {
        webSocketManager.disconnect(id);
        updateState();
    }, [id, updateState]);

    const send = useCallback((message: WebSocketMessage): boolean => {
        return webSocketManager.send(id, message);
    }, [id]);

    const subscribe = useCallback((messageType: string, handler: MessageHandler): () => void => {
        const unsubscribe = webSocketManager.subscribe(messageType, handler);
        unsubscribeRefs.current.push(unsubscribe);
        return unsubscribe;
    }, []);

    useEffect(() => {
        const listeners: Array<() => void> = [];

        const handleOpen = ({id: connectionId}: { id: string }) => {
            if (connectionId === id) {
                updateState();
                onConnect?.(webSocketManager.getConnectionStatus(id)!);
            }
        };

        const handleClose = ({id: connectionId}: { id: string }) => {
            if (connectionId === id) {
                updateState();
                onDisconnect?.(webSocketManager.getConnectionStatus(id)!);
            }
        };

        const handleError = ({id: connectionId, error}: { id: string; error: Event }) => {
            if (connectionId === id) {
                onError?.(error);
            }
        };

        const handleLatencyUpdate = ({id: connectionId, latency: newLatency}: { id: string; latency: number }) => {
            if (connectionId === id) {
                setLatency(newLatency);
            }
        };

        const handleMessage = ({id: connectionId, message}: { id: string; message: WebSocketMessage }) => {
            if (connectionId === id) {
                onMessage?.(message);
            }
        };

        webSocketManager.on('connection:open', handleOpen);
        webSocketManager.on('connection:close', handleClose);
        webSocketManager.on('connection:error', handleError);
        webSocketManager.on('latency:update', handleLatencyUpdate);
        webSocketManager.on('message', handleMessage);

        listeners.push(
            () => webSocketManager.off('connection:open', handleOpen),
            () => webSocketManager.off('connection:close', handleClose),
            () => webSocketManager.off('connection:error', handleError),
            () => webSocketManager.off('latency:update', handleLatencyUpdate),
            () => webSocketManager.off('message', handleMessage)
        );

        updateState();

        if (autoConnect) {
            connect();
        }

        return () => {
            listeners.forEach(cleanup => cleanup());
            unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
            unsubscribeRefs.current = [];
        };
    }, [id, autoConnect, connect, updateState, onMessage, onConnect, onDisconnect, onError]);

    useEffect(() => {
        return () => {
            if (autoConnect) {
                disconnect();
            }
        };
    }, [autoConnect, disconnect]);

    return {
        connection,
        connected,
        connecting,
        latency,
        connect,
        disconnect,
        send,
        subscribe
    };
}
