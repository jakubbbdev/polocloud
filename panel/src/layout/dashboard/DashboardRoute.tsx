import {useBreadcrumbPage} from '@/components/system/breadcrumb/hook/useBreadcrumbPage';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {MemoryUsageChart} from '@/layout/dashboard/MemoryUsageChart';
import {PlayerCountChart} from '@/layout/dashboard/PlayerCountChart';
import {Activity, Boxes, LucideIcon, Server, TrendingUp, TrendingDown, Minus} from 'lucide-react';
import {groupApi} from '@/lib/api/clients/group/GroupApiClient.ts';
import {servicesApi} from '@/lib/api/clients/services/ServicesApiClient.ts';
import {motion} from 'framer-motion';
import {useState, useEffect} from 'react';
import {useLocation} from 'wouter';

interface DashboardCardProps {
    title: string;
    icon: LucideIcon;
    value: string;
    subValue: string;
    trend: string;
    trendDirection: 'up' | 'down' | 'stable';
}

const DashboardCard = ({title, icon, value, subValue, trend, trendDirection}: DashboardCardProps) => {
    const LucideIcon = icon;

    const getTrendIcon = () => {
        switch (trendDirection) {
            case 'up':
                return <TrendingUp className="w-3 h-3"/>;
            case 'down':
                return <TrendingDown className="w-3 h-3"/>;
            case 'stable':
                return <Minus className="w-3 h-3"/>;
            default:
                return null;
        }
    };

    const getTrendBadgeColor = () => {
        switch (trendDirection) {
            case 'up':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'down':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'stable':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <Card
            className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-lg shadow-[0_0_30px_rgba(75.54%,15.34%,231.639,0.3)] min-h-[160px] min-w-[400px] rounded-2xl">
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75.54%,15.34%,0.05)_0%,transparent_50%)] opacity-60 rounded-2xl"/>

            <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(75.54% .1534 231.639)] via-[oklch(75.54% .1534 231.639,0.8)] to-[oklch(75.54% .1534 231.639)] rounded-t-2xl"/>

            <div
                className="absolute inset-0 rounded-2xl shadow-[0_0_50px_rgba(75.54%,15.34%,231.639,0.2)] pointer-events-none"/>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-foreground/90">{title}</CardTitle>
                <Badge variant="secondary" className={`${getTrendBadgeColor()} text-xs font-medium`}>
                    {getTrendIcon()}
                    <span className="ml-1">{trend}</span>
                </Badge>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="mb-4">
                    <div className="text-4xl font-bold text-foreground mb-2">{value}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{subValue}</p>
                </div>

                <div className="absolute top-4 right-4 opacity-10">
                    <LucideIcon className="size-20 text-foreground"/>
                </div>
            </CardContent>
        </Card>
    );
};

export default function DashboardRoute() {
    useBreadcrumbPage({});
    const [, setLocation] = useLocation();

    const [groupCount, setGroupCount] = useState<number>(0);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [currentGroupCount, setCurrentGroupCount] = useState<number>(0);
    const [isLoadingCurrentGroups, setIsLoadingCurrentGroups] = useState(true);
    const [groupTrend, setGroupTrend] = useState<string>('+0%');
    const [groupTrendDirection, setGroupTrendDirection] = useState<'up' | 'down' | 'stable'>('stable');
    const [serviceCount, setServiceCount] = useState<number>(0);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [currentServiceCount, setCurrentServiceCount] = useState<number>(0);
    const [isLoadingCurrentServices, setIsLoadingCurrentServices] = useState(true);
    const [serviceTrend, setServiceTrend] = useState<string>('+0%');
    const [serviceTrendDirection, setServiceTrendDirection] = useState<'up' | 'down' | 'stable'>('stable');

    useEffect(() => {
        const fetchCurrentGroupCount = async () => {
            try {
                setIsLoadingCurrentGroups(true);
                const result = await groupApi.getCurrentGroupCount();

                if (result.success && result.data) {
                    setCurrentGroupCount(result.data.groupCount || 0);

                } else {

                    setCurrentGroupCount(0);
                }
            } catch (error) {

                setCurrentGroupCount(0);
            } finally {
                setIsLoadingCurrentGroups(false);
            }
        };

        fetchCurrentGroupCount();
    }, []);

    useEffect(() => {
        const fetchGroupCount = async () => {
            try {
                setIsLoadingGroups(true);
                const result = await groupApi.getGroupCount();

                if (result.success && result.data) {
                    const sevenDayCount = result.data.groupCount || 0;
                    setGroupCount(sevenDayCount);

                    if (result.data.percentage !== undefined) {
                        const percentage = result.data.percentage;
                        if (percentage > 0) {
                            setGroupTrend(`+${Math.round(percentage)}%`);
                            setGroupTrendDirection('up');
                        } else if (percentage < 0) {
                            setGroupTrend(`${Math.round(percentage)}%`);
                            setGroupTrendDirection('down');
                        } else {
                            setGroupTrend('0%');
                            setGroupTrendDirection('stable');
                        }

                    }

                } else {

                    setGroupCount(0);
                }
            } catch (error) {

                setGroupCount(0);
            } finally {
                setIsLoadingGroups(false);
            }
        };

        fetchGroupCount();
    }, []);

    useEffect(() => {
        const fetchCurrentServiceCount = async () => {
            try {
                setIsLoadingCurrentServices(true);
                const result = await servicesApi.getCurrentServiceCount();

                if (result.success && result.data) {
                    setCurrentServiceCount(result.data.serviceCount || 0);

                } else {

                    setCurrentServiceCount(0);
                }
            } catch (error) {

                setCurrentServiceCount(0);
            } finally {
                setIsLoadingCurrentServices(false);
            }
        };

        fetchCurrentServiceCount();
    }, []);

    useEffect(() => {
        const fetchServiceCount = async () => {
            try {
                setIsLoadingServices(true);

                const result = await servicesApi.getServiceCount();

                if (result.success && result.data) {
                    const twentyFourHourCount = result.data.serviceCount || 0;
                    setServiceCount(twentyFourHourCount);

                    if (result.data.percentage !== undefined) {
                        const percentage = result.data.percentage;
                        if (percentage > 0) {
                            setServiceTrend(`+${Math.round(percentage)}%`);
                            setServiceTrendDirection('up');
                        } else if (percentage < 0) {
                            setServiceTrend(`${Math.round(percentage)}%`);
                            setServiceTrendDirection('down');
                        } else {
                            setServiceTrend('0%');
                            setServiceTrendDirection('stable');
                        }
                    }
                } else {

                    setServiceCount(0);
                }
            } catch (error) {

                setServiceCount(0);
            } finally {
                setIsLoadingServices(false);
            }
        };

        fetchServiceCount();
    }, []);

    const handleGroupsClick = () => {
        setLocation('/groups');
    };

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                duration: 1.5,
                staggerChildren: 0.25,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.98
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1],
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    const chartVariants = {
        hidden: {
            opacity: 0,
            y: 25,
            scale: 0.96
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
                type: "spring",
                stiffness: 80,
                damping: 25
            }
        }
    };

    return (
        <div className="flex flex-1 flex-col">

            <motion.div
                className="flex flex-1 flex-col p-6 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="flex justify-center"
                    variants={itemVariants}
                >
                    <div className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-3">
                        <motion.div
                            className="dashboard-card"
                            variants={itemVariants}
                        >
                            <DashboardCard
                                title="System Status"
                                icon={Activity}
                                value="Healthy"
                                subValue="No major incidents in the last 24 hours"
                                trend="+2.5%"
                                trendDirection="up"
                            />
                        </motion.div>
                        <motion.div
                            className="dashboard-card"
                            variants={itemVariants}
                        >
                            <div onClick={handleGroupsClick} className="cursor-pointer">
                                <DashboardCard
                                    title="Active Groups"
                                    icon={Boxes}
                                    value={isLoadingCurrentGroups ? "..." : currentGroupCount.toString()}
                                    subValue={isLoadingGroups ? "Loading groups..." : `+${groupCount} active group${groupCount !== 1 ? 's' : ''} in last 7 days`}
                                    trend={groupTrend}
                                    trendDirection={groupTrendDirection}
                                />
                            </div>
                        </motion.div>
                        <motion.div
                            className="dashboard-card"
                            variants={itemVariants}
                        >
                            <DashboardCard
                                title="Running Services"
                                icon={Server}
                                value={isLoadingCurrentServices ? "..." : currentServiceCount.toString()}
                                subValue={isLoadingServices ? "Loading services..." : `+${serviceCount} active service${serviceCount !== 1 ? 's' : ''} in last 24 hours`}
                                trend={serviceTrend}
                                trendDirection={serviceTrendDirection}
                            />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    variants={itemVariants}
                >
                    <motion.div
                        className="chart-card"
                        variants={chartVariants}
                    >
                        <Card
                            className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-lg shadow-[0_0_40px_rgba(75.54%,15.34%,231.639,0.4)] min-h-[300px] rounded-2xl">
                            <div
                                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75.54%,15.34%,0.05)_0%,transparent_50%)] opacity-60 rounded-2xl"/>

                            <div
                                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(75.54% .1534 231.639)] via-[oklch(75.54% .1534 231.639,0.8)] to-[oklch(75.54% .1534 231.639)] rounded-t-2xl"/>

                            <div
                                className="absolute inset-0 rounded-2xl shadow-[0_0_60px_rgba(75.54%,15.34%,231.639,0.3)] pointer-events-none"/>

                            <CardHeader className="relative z-10">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                                    <div
                                        className="w-2 h-2 bg-[oklch(75.54% .1534 231.639)] rounded-full animate-pulse"></div>
                                    Player Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <PlayerCountChart/>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        className="chart-card"
                        variants={chartVariants}
                    >
                        <Card
                            className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-lg shadow-[0_0_40px_rgba(75.54%,15.34%,231.639,0.4)] min-h-[300px] rounded-2xl">
                            <div
                                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75.54%,15.34%,0.05)_0%,transparent_50%)] opacity-60 rounded-2xl"/>

                            <div
                                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(75.54% .1534 231.639)] via-[oklch(75.54% .1534 231.639,0.8)] to-[oklch(75.54% .1534 231.639)] rounded-t-2xl"/>

                            <div
                                className="absolute inset-0 rounded-2xl shadow-[0_0_60px_rgba(75.54%,15.34%,231.639,0.3)] pointer-events-none"/>

                            <CardHeader className="relative z-10">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                                    <div
                                        className="w-2 h-2 bg-[oklch(75.54% .1534 231.639)] rounded-full animate-pulse"></div>
                                    System Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <MemoryUsageChart/>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
