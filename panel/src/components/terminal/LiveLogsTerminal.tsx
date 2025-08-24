import { useState, useEffect, useRef, useCallback } from 'react';
import { useLogsWebSocket } from '../../lib/websocket/logs/useLogsWebSocket';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wifi, WifiOff, Trash2, Download } from 'lucide-react';
import { terminalApi } from '@/lib/api/clients/terminal/TerminalApiClient';
import { permissionService } from '@/lib/utils/PermissionService';

interface LogEntry {
    id: string;
    timestamp: Date;
    content: string;
    rawContent: string;
}

export function LiveLogsTerminal() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [maxLogs] = useState(1000);
    const [autoScroll, setAutoScroll] = useState(true);
    const [commandInput, setCommandInput] = useState('');
    const [isSendingCommand, setIsSendingCommand] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const commandInputRef = useRef<HTMLInputElement>(null);

    const { connected, connecting, latency, connect } = useLogsWebSocket({
        autoConnect: true,
        onLog: (logContent: string) => {
            addLog(logContent);
        },
        onConnect: () => console.log('Logs WebSocket connected'),
        onDisconnect: () => console.log('Logs WebSocket disconnected'),
        onError: (error: Event) => console.error('Logs WebSocket error:', error)
    });

    const addLog = useCallback((content: string) => {
        const newLog: LogEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            content: parseAnsiColors(content),
            rawContent: content
        };

        setLogs(prevLogs => {
            const newLogs = [...prevLogs, newLog];
            if (newLogs.length > maxLogs) {
                return newLogs.slice(-maxLogs);
            }
            return newLogs;
        });
    }, [maxLogs]);

    useEffect(() => {
        if (autoScroll && scrollAreaRef.current && logs.length > 0) {
            const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [logs, autoScroll]);



    const maskIPAddresses = (text: string): string => {
        return text.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '***.***.***.***');
    };

    const parseAnsiColors = (text: string): string => {
        const maskedText = maskIPAddresses(text);

        return maskedText
            // Bold
            .replace(/\x1b\[1m/g, '<strong>')
            .replace(/\x1b\[22m/g, '</strong>')
            // Colors
            .replace(/\x1b\[31m/g, '<span style="color: #ff0000">') // Red
            .replace(/\x1b\[32m/g, '<span style="color: #00ff00">') // Green
            .replace(/\x1b\[33m/g, '<span style="color: #ffff00">') // Yellow
            .replace(/\x1b\[34m/g, '<span style="color: #0000ff">') // Blue
            .replace(/\x1b\[35m/g, '<span style="color: #ff00ff">') // Magenta
            .replace(/\x1b\[36m/g, '<span style="color: #00ffff">') // Cyan
            .replace(/\x1b\[37m/g, '<span style="color: #ffffff">') // White
            .replace(/\x1b\[39m/g, '</span>') // Reset color
            // Background colors
            .replace(/\x1b\[41m/g, '<span style="background-color: #ff0000">') // Red bg
            .replace(/\x1b\[42m/g, '<span style="background-color: #00ff00">') // Green bg
            .replace(/\x1b\[43m/g, '<span style="background-color: #ffff00">') // Yellow bg
            .replace(/\x1b\[44m/g, '<span style="background-color: #0000ff">') // Blue bg
            .replace(/\x1b\[45m/g, '<span style="background-color: #ff00ff">') // Magenta bg
            .replace(/\x1b\[46m/g, '<span style="background-color: #00ffff">') // Cyan bg
            .replace(/\x1b\[47m/g, '<span style="background-color: #ffffff">') // White bg
            .replace(/\x1b\[49m/g, '</span>') // Reset background
            // Reset all
            .replace(/\x1b\[0m/g, '</strong></span>')
            // Remove other ANSI codes
            .replace(/\x1b\[[0-9;]*m/g, '');
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const downloadLogs = () => {
        const logText = logs.map(log =>
            `[${log.timestamp.toISOString()}] ${log.rawContent}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `polocloud-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const sendCommand = async () => {
        if (!commandInput.trim() || !connected || isSendingCommand) return;

        if (!permissionService.hasPermission('polocloud.terminal.command')) {
            addLog(`Error: Keine Berechtigung zum Senden von Commands. Benötigte Permission: polocloud.terminal.command`);
            return;
        }

        try {
            setIsSendingCommand(true);
            const result = await terminalApi.sendCommand(commandInput.trim());

            if (result.success) {
                const commandLog = `<span class="text-blue-400">polocloud</span><span class="text-gray-400">@</span><span class="text-white">3.0.0-pre.6-SNAPSHOT</span> <span class="text-gray-400">»</span> <span class="text-white">${commandInput.trim()}</span>`;
                addLog(commandLog);
                setCommandInput('');

                setTimeout(() => {
                    commandInputRef.current?.focus();
                }, 0);
            } else {
                addLog(`Error: ${result.message}`);
            }
        } catch (error) {
            addLog(`Error: Failed to send command`);
        } finally {
            setIsSendingCommand(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendCommand();
        }
    };

    return (
        <div className="w-full h-full p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge
                            variant={connected ? "default" : "secondary"}
                            className={`px-3 py-1.5 rounded-full font-medium ${
                                connected
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                        >
                            {connecting ? (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : connected ? (
                                <Wifi className="h-3 w-3" />
                            ) : (
                                <WifiOff className="h-3 w-3" />
                            )}
                            <span className="ml-2">
                {connecting ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'}
              </span>
                        </Badge>

                        {connected && latency > 0 && (
                            <Badge
                                variant="outline"
                                className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border-blue-500/30"
                            >
                                {latency}ms
                            </Badge>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearLogs}
                            disabled={logs.length === 0}
                            className="px-4 py-2 rounded-lg border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-200"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear
                        </Button>

                        <Button
                            variant={autoScroll ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAutoScroll(!autoScroll)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                autoScroll
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                    : 'border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50'
                            }`}
                        >
                            <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                autoScroll ? 'bg-green-400' : 'bg-slate-400'
                            }`} />
                            <span className="ml-2">
                {autoScroll ? 'Auto-Scroll ON' : 'Auto-Scroll OFF'}
              </span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadLogs}
                            disabled={logs.length === 0}
                            className="px-4 py-2 rounded-lg border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-200"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/20 border border-slate-600/50 rounded-2xl shadow-xl shadow-slate-900/50 p-4 shadow-[0_0_50px_rgba(75.54%,15.34%,231.639%,0.8)] shadow-[0_0_100px_rgba(75.54%,15.34%,231.639%,0.4)]">
                <div className="bg-black text-green-400 font-mono text-sm rounded-xl overflow-hidden">
                    <ScrollArea
                        ref={scrollAreaRef}
                        className="h-[700px] w-full"
                    >
                        <div className="p-4 space-y-1">
                            {logs.length === 0 ? (
                                <div className="text-gray-500 italic">
                                    {connected ? 'Waiting for logs...' : 'Not connected'}
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-2">
                                        <div
                                            className="flex-1"
                                            dangerouslySetInnerHTML={{ __html: log.content }}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="border-t border-slate-600 bg-black p-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono">
                                <span className="text-blue-400">polocloud</span>
                                <span className="text-gray-400">@</span>
                                <span className="text-white">3.0.0-pre.6-SNAPSHOT</span>
                            </span>
                            <span className="text-gray-400 font-mono">»</span>
                            <input
                                type="text"
                                value={commandInput}
                                onChange={(e) => setCommandInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={
                                    !permissionService.hasPermission('polocloud.terminal.command')
                                        ? 'No Permissions'
                                        : 'Enter command...'
                                }
                                className={`flex-1 bg-transparent text-white outline-none placeholder-slate-500 font-mono ${
                                    !permissionService.hasPermission('polocloud.terminal.command')
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }`}
                                disabled={!connected || isSendingCommand || !permissionService.hasPermission('polocloud.terminal.command')}
                                ref={commandInputRef}
                            />
                            <Button
                                size="sm"
                                onClick={sendCommand}
                                disabled={!connected || isSendingCommand || !commandInput.trim() || !permissionService.hasPermission('polocloud.terminal.command')}
                                className={`px-3 py-1 rounded transition-colors ${
                                    !permissionService.hasPermission('polocloud.terminal.command')
                                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {isSendingCommand ? 'Sending...' : 'Send'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {!connected && (
                <div className="mt-4 flex justify-center">
                    <Button
                        onClick={connect}
                        disabled={connecting}
                        className="px-6 py-3 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 border border-slate-600/50 transition-all duration-200"
                    >
                        {connecting ? 'Connecting...' : 'Connect to Logs'}
                    </Button>
                </div>
            )}
        </div>
    );
}