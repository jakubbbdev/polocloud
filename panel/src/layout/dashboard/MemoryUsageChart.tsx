'use client';

import {Cpu, MemoryStick, Activity, HardDrive} from 'lucide-react';
import {systemInformationApi} from '@/lib/api';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {motion} from 'framer-motion';
import {useSpring, animated} from '@react-spring/web';
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Legend
} from 'recharts';


export function MemoryUsageChart() {
    const [realMemoryUsage, setRealMemoryUsage] = useState(0);
    const [realCpuUsage, setRealCpuUsage] = useState(0);

    const [avgMemory, setAvgMemory] = useState<number | null>(null);
    const [avgCpu, setAvgCpu] = useState<number | null>(null);
    const [isLoadingAverage, setIsLoadingAverage] = useState(false);

    const [showInGB, setShowInGB] = useState(false);

    const [timeRange, setTimeRange] = useState<'10m' | '1d' | '3d' | '7d'>('7d');

    const [chartData, setChartData] = useState<Array<{
        timestamp: number,
        memory: number,
        cpu: number,
        time: string
    }>>([]);

    const formatMemorySize = (mb: number, forceGB: boolean = false): string => {
        if (forceGB || mb >= 1024) {
            const gb = mb / 1024;
            return `${gb.toFixed(1)} GB`;
        }
        return `${(Math.round(mb * 10) / 10).toFixed(1)} MB`;
    };

    const loadChartData = async () => {
        try {
            const now = Date.now();
            let from: number;
            let endpoint: 'minutes' | 'hours' | 'days';

            switch (timeRange) {
                case '10m':
                    from = now - (10 * 60 * 1000); // 10 minutes ago
                    endpoint = 'minutes';
                    break;
                case '1d':
                    from = now - (24 * 60 * 60 * 1000); // 24 hours ago
                    endpoint = 'hours';
                    break;
                case '3d':
                    from = now - (3 * 24 * 60 * 60 * 1000); // 3 days ago
                    endpoint = 'days';
                    break;
                case '7d':
                    from = now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
                    endpoint = 'days';
                    break;
                default:
                    from = now - (7 * 24 * 60 * 60 * 1000); // Default to 7 days
                    endpoint = 'days';
            }

            let result;
            switch (endpoint) {
                case 'minutes':
                    result = await systemInformationApi.getSystemDataMinutes(from, now);
                    break;
                case 'hours':
                    result = await systemInformationApi.getSystemDataHours(from, now);
                    break;
                case 'days':
                    result = await systemInformationApi.getSystemDataDays(from, now);
                    break;
            }

            if (result.success && result.data) {
                let data = generateGranularLabels(result.data, timeRange);
                setChartData(data);
            } else {
                generateMockChartData();
            }
        } catch (error) {
            
            generateMockChartData();
        }
    };

    const generateGranularLabels = (originalData: any[], timeRange: string) => {
        const now = Date.now();
        let points: number;
        let interval: number;

        switch (timeRange) {
            case '10m':
                points = 10;
                interval = 60 * 1000; // 1 minute
                break;
            case '1d':
                points = 24;
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case '3d':
                points = 72;
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case '7d':
                points = 168;
                interval = 60 * 60 * 1000; // 1 hour
                break;
            default:
                points = 24;
                interval = 60 * 60 * 1000;
        }

        const data = [];
        for (let i = points - 1; i >= 0; i--) {
            const timestamp = now - (i * interval);
            const date = new Date(timestamp);
            let timeString: string;

            switch (timeRange) {
                case '10m':
                    timeString = date.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
                    break;
                case '1d':
                    timeString = date.toLocaleTimeString('de-DE', {hour: '2-digit'});
                    break;
                case '3d':
                case '7d':
                    timeString = date.toLocaleDateString('de-DE', {month: 'short', day: 'numeric'});
                    break;
                default:
                    timeString = date.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
            }

            const closestPoint = originalData.find(p => Math.abs(p.timestamp - timestamp) < interval / 2);

            if (closestPoint) {
                data.push({
                    timestamp: closestPoint.timestamp,
                    memory: closestPoint.avgRam,
                    cpu: closestPoint.avgCpu,
                    time: timeString
                });
            } else {
                const baseMemory = realMemoryUsage || 2048;
                const baseCpu = realCpuUsage || 25;

                data.push({
                    timestamp,
                    memory: baseMemory * (0.8 + Math.random() * 0.4),
                    cpu: Math.max(0, Math.min(100, baseCpu * (0.8 + Math.random() * 0.4))),
                    time: timeString
                });
            }
        }

        return data;
    };

    const generateMockChartData = () => {
        const now = Date.now();
        let points: number;
        let interval: number;

        switch (timeRange) {
            case '10m':
                points = 20;
                interval = 30 * 1000; // 30 seconds
                break;
            case '1d':
                points = 24;
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case '3d':
                points = 72;
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case '7d':
                points = 168;
                interval = 60 * 60 * 1000; // 1 hour
                break;
            default:
                points = 168;
                interval = 60 * 60 * 1000;
        }

        const data = [];
        for (let i = points - 1; i >= 0; i--) {
            const timestamp = now - (i * interval);
            const baseMemory = realMemoryUsage || 2048;
            const baseCpu = realCpuUsage || 25;

            const memoryVariation = (Math.random() - 0.5) * 0.3;
            const cpuVariation = (Math.random() - 0.5) * 0.4;

            const memory = Math.max(0, baseMemory * (1 + memoryVariation));
            const cpu = Math.max(0, Math.min(100, baseCpu * (1 + cpuVariation)));

            const date = new Date(timestamp);
            let timeString: string;

            switch (timeRange) {
                case '10m':
                    timeString = date.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
                    break;
                case '1d':
                    timeString = date.toLocaleTimeString('de-DE', {hour: '2-digit'});
                    break;
                case '3d':
                case '7d':
                    timeString = date.toLocaleDateString('de-DE', {month: 'short', day: 'numeric'});
                    break;
                default:
                    timeString = date.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
            }

            data.push({
                timestamp,
                memory,
                cpu,
                time: timeString
            });
        }

        setChartData(data);
    };

    const loadSystemAverage = async () => {
        if (isLoadingAverage) {
            return;
        }
        setIsLoadingAverage(true);

        try {
            const now = Date.now();
            let from: number;

            switch (timeRange) {
                case '10m':
                    from = now - (10 * 60 * 1000); // 10 minutes ago
                    break;
                case '1d':
                    from = now - (24 * 60 * 60 * 1000); // 24 hours ago
                    break;
                case '3d':
                    from = now - (3 * 24 * 60 * 60 * 1000); // 3 days ago
                    break;
                case '7d':
                    from = now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
                    break;
                default:
                    from = now - (7 * 24 * 60 * 60 * 1000); // Default to 7 days
            }

            const result = await systemInformationApi.getSystemAverage(from, now);

            if (result.success && result.data) {
                setAvgMemory(result.data.avgRam);
                setAvgCpu(result.data.avgCpu);
            } else {
                setAvgMemory(null);
                setAvgCpu(null);
            }
        } catch (error) {
            setAvgMemory(null);
            setAvgCpu(null);
        } finally {
            setIsLoadingAverage(false);
        }
    };

    const loadSystemInfo = async () => {
        try {
            const result = await systemInformationApi.getSystemInformation();

            if (result.success && result.data) {
                setRealMemoryUsage(result.data.memoryUsage);
                setRealCpuUsage(result.data.cpuUsage);
            }
        } catch (error) {

        }
    };
    useEffect(() => {
        loadSystemInfo();
        loadChartData();
    }, []);

    useEffect(() => {
        loadSystemAverage();
        loadChartData();
    }, [timeRange]);

    useEffect(() => {
        const interval = setInterval(() => {
            loadSystemInfo();
            loadSystemAverage();
        }, 3000);

        return () => clearInterval(interval);
    }, [timeRange]);

    const memorySpring = useSpring({
        from: { value: realMemoryUsage },
        to: { value: realMemoryUsage },
        config: { tension: 120, friction: 14 },
        immediate: false
    });

    const cpuSpring = useSpring({
        from: { value: realCpuUsage },
        to: { value: realCpuUsage },
        config: { tension: 120, friction: 14 },
        immediate: false
    });

    const avgMemorySpring = useSpring({
        from: { value: avgMemory || 0 },
        to: { value: avgMemory || 0 },
        config: { tension: 120, friction: 14 },
        immediate: false
    });

    const avgCpuSpring = useSpring({
        from: { value: avgCpu || 0 },
        to: { value: avgCpu || 0 },
        config: { tension: 120, friction: 14 },
        immediate: false
    });

    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium text-foreground mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-xs" style={{color: entry.color}}>
                            {entry.name}: {entry.name === 'Memory' ? formatMemorySize(entry.value, showInGB) : `${entry.value.toFixed(1)}%`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6, staggerChildren: 0.1}}
            >
                <motion.div
                    className="stat-card"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.1}}
                >
                    <div
                        className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-lg rounded-2xl h-32">
                        <div
                            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75,54%,15.34%,0.03)_0%,transparent_50%)] opacity-60 rounded-2xl"/>

                        <div
                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(75.54% .1534 231.639)] to-[oklch(75.54% .1534 231.639)] rounded-t-2xl"/>

                        <div className="relative z-10 text-center p-4 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <MemoryStick className="w-4 h-4 text-foreground"/>
                                <span className="text-xs text-muted-foreground">Current Memory</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {realMemoryUsage > 0 ? (
                                    <animated.span>
                                        {memorySpring.value.to((val) => formatMemorySize(val, showInGB))}
                                    </animated.span>
                                ) : (
                                    <span>--</span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.2}}
                >
                    <div
                        className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-lg rounded-2xl h-32">
                        <div
                            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75,54%,15.34%,0.03)_0%,transparent_50%)] opacity-60 rounded-2xl"/>

                        <div
                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(75.54% .1534 231.639)] to-[oklch(75.54% .1534 231.639)] rounded-t-2xl"/>

                        <div className="relative z-10 text-center p-4 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Cpu className="w-4 h-4 text-foreground"/>
                                <span className="text-xs text-muted-foreground">Current CPU</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {realCpuUsage > 0 ? (
                                    <animated.span>
                                        {cpuSpring.value.to((val) => `${Math.round(val * 10) / 10}%`)}
                                    </animated.span>
                                ) : (
                                    <span>--</span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.3}}
                >
                    <div
                        className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-lg rounded-2xl h-32">
                        <div
                            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75,54%,15.34%,0.03)_0%,transparent_50%)] opacity-60 rounded-2xl"/>

                        <div
                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(75.54% .1534 231.639)] to-[oklch(75.54% .1534 231.639)] rounded-t-2xl"/>

                        <div className="relative z-10 text-center p-4 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <HardDrive className="w-4 h-4 text-foreground"/>
                                <span className="text-xs text-muted-foreground">Avg Memory</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {avgMemory && avgMemory > 0 ? (
                                    <animated.span>
                                        {avgMemorySpring.value.to((val) => formatMemorySize(val, showInGB))}
                                    </animated.span>
                                ) : (
                                    <span>--</span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.4}}
                >
                    <div
                        className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-lg rounded-2xl h-32">
                        <div
                            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75,54%,15.34%,0.03)_0%,transparent_50%)] opacity-60 rounded-2xl"/>

                        <div
                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(75.54% .1534 231.639)] to-[oklch(75.54% .1534 231.639)] rounded-t-2xl"/>

                        <div className="relative z-10 text-center p-4 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-foreground"/>
                                <span className="text-xs text-muted-foreground">Avg CPU</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {avgCpu && avgCpu > 0 ? (
                                    <animated.span>
                                        {avgCpuSpring.value.to((val) => `${Math.round(val * 10) / 10}%`)}
                                    </animated.span>
                                ) : (
                                    <span>--</span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-card/50 to-card/30 border border-border/50 backdrop-blur-sm"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: 0.2}}
            >
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg"></div>
                        <span className="text-sm font-medium text-foreground">Memory Usage</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-purple-500 shadow-lg"></div>
                        <span className="text-sm font-medium text-foreground">CPU Usage</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInGB(!showInGB)}
                        className="text-xs hover:bg-primary/10 hover:border-primary/50 transition-colors"
                    >
                        {showInGB ? 'Show in MB' : 'Show in GB'}
                    </Button>
                    <Select value={timeRange}
                            onValueChange={(value: '10m' | '1d' | '3d' | '7d') => setTimeRange(value)}>
                        <SelectTrigger
                            className="w-[180px] rounded-lg bg-background/50 border-border/50 hover:border-primary/50 transition-colors">
                            <SelectValue placeholder="Last 7 days"/>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-card/95 backdrop-blur-sm border border-border/50">
                            <SelectItem value="10m" className="rounded-lg">Last 10 minutes</SelectItem>
                            <SelectItem value="1d" className="rounded-lg">Last 24 hours</SelectItem>
                            <SelectItem value="3d" className="rounded-lg">Last 3 days</SelectItem>
                            <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            <motion.div
                className="p-6 rounded-xl bg-gradient-to-br from-card/50 to-card/30 border border-border/50 backdrop-blur-sm"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: 0.4}}
            >
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                            <defs>
                                <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.05}/>
                                </linearGradient>
                                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="rgb(147, 51, 234)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="rgb(147, 51, 234)" stopOpacity={0.05}/>
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="time"
                                stroke="rgba(255,255,255,0.5)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{fill: 'rgba(255,255,255,0.7)'}}
                            />

                            <YAxis
                                yAxisId="left"
                                stroke="rgba(255,255,255,0.5)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{fill: 'rgba(255,255,255,0.7)'}}
                                tickFormatter={(value) => formatMemorySize(value, showInGB)}
                            />

                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="rgba(255,255,255,0.5)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{fill: 'rgba(255,255,255,0.7)'}}
                                tickFormatter={(value) => `${value}%`}
                            />

                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend
                                verticalAlign="top"
                                height={36}
                                wrapperStyle={{paddingBottom: '20px'}}
                            />

                            <Area
                                type="monotone"
                                dataKey="memory"
                                yAxisId="left"
                                stroke="rgb(59, 130, 246)"
                                strokeWidth={3}
                                fill="url(#memoryGradient)"
                                dot={{fill: "rgb(59, 130, 246)", strokeWidth: 2, r: 4}}
                                activeDot={{r: 6, stroke: "rgb(59, 130, 246)", strokeWidth: 2}}
                            />

                            <Line
                                type="monotone"
                                dataKey="cpu"
                                yAxisId="right"
                                stroke="rgb(147, 51, 234)"
                                strokeWidth={3}
                                dot={{fill: "rgb(147, 51, 234)", strokeWidth: 2, r: 4}}
                                activeDot={{r: 6, stroke: "rgb(147, 51, 234)", strokeWidth: 2}}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {isLoadingAverage && (
                <motion.div
                    className="text-center py-6"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading average values...</p>
                </motion.div>
            )}
        </div>
    );
}

