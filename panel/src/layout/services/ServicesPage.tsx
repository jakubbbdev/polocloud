import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Server,
    HardDrive,
    Users,
    Activity,
    Search,
    Globe,
    Cpu,
    Settings,
    Terminal,
    RefreshCw,
    Power,
    Play,
    Square,
    Loader2
} from 'lucide-react';
import { servicesApi } from '@/lib/api';
import useBreadcrumbStore from '@/components/system/breadcrumb/hook/useBreadcrumbStore';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { permissionService } from '@/lib/utils/PermissionService';

interface ApiService {
    name: string;
    state: string;
    type: string;
    groupName: string;
    hostname: string;
    port: number;
    templates: string[];
    information: {
        createdAt: number;
    };
    properties: {
        fallback?: string;
        [key: string]: any;
    };
    minMemory: number;
    maxMemory: number;
    playerCount: number;
    maxPlayerCount: number;
    memoryUsage: number;
    cpuUsage: number;
    motd: string;
}

interface Service {
    id: string;
    name: string;
    state: string;
    type: string;
    groupName: string;
    hostname: string;
    port: number;
    templates: string[];
    fallback: boolean;
    minMemory: number;
    maxMemory: number;
    playerCount: number;
    maxPlayerCount: number;
    memoryUsage: number;
    cpuUsage: number;
    motd: string;
    createdAt: number;
    statusColor: string;
    statusIcon: React.ReactNode;
    typeColor: string;
}

export default function ServicesPage() {
    const { initializePage } = useBreadcrumbStore();
    const [, setLocation] = useLocation();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [restartingServices, setRestartingServices] = useState<Set<string>>(new Set());

    useEffect(() => {
        initializePage([
            {
                label: 'Services',
                href: '/services',
                activeHref: '/services',
            },
        ]);
    }, [initializePage]);

    const fetchServices = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await servicesApi.getServices();

            if (result.success && result.data) {
                const apiServices = result.data as ApiService[];
                const convertedServices = apiServices.map(convertApiServiceToService);
                setServices(convertedServices);

            } else {
                setError(result.message || 'Failed to load services');

            }
        } catch (error) {
            setError('Error loading services');

        } finally {
            setIsLoading(false);
        }
    };

    const handleRestartService = async (serviceName: string) => {
        if (restartingServices.has(serviceName)) return;

        if (!permissionService.hasPermission('polocloud.service.restart')) {
            return;
        }

        setRestartingServices(prev => new Set(prev).add(serviceName));

        try {
            const result = await servicesApi.restartService(serviceName);

            if (result.success) {
                setTimeout(() => {
                    fetchServices();
                }, 2000);
            } else {
            }
        } catch (error) {

        } finally {
            setRestartingServices(prev => {
                const newSet = new Set(prev);
                newSet.delete(serviceName);
                return newSet;
            });
        }
    };

    const convertApiServiceToService = (apiService: ApiService): Service => {
        const getStatusColor = (state: string) => {
            switch (state) {
                case 'ONLINE': return 'text-green-600 bg-green-50 border-green-200';
                case 'OFFLINE': return 'text-red-600 bg-red-50 border-red-200';
                case 'STARTING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                case 'STOPPING': return 'text-orange-600 bg-orange-50 border-orange-200';
                default: return 'text-gray-600 bg-gray-50 border-gray-200';
            }
        };

        const getStatusIcon = (state: string) => {
            switch (state) {
                case 'ONLINE': return <Play className="h-4 w-4 text-green-500" />;
                case 'OFFLINE': return <Square className="h-4 w-4 text-red-500" />;
                case 'STARTING': return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
                case 'STOPPING': return <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />;
                default: return <Square className="h-4 w-4 text-gray-500" />;
            }
        };

        const getTypeColor = (type: string) => {
            switch (type) {
                case 'SERVER': return 'text-blue-600 bg-blue-50 border-blue-200';
                case 'PROXY': return 'text-purple-600 bg-purple-50 border-purple-200';
                default: return 'text-gray-600 bg-gray-50 border-gray-200';
            }
        };

        return {
            id: apiService.name,
            name: apiService.name,
            state: apiService.state,
            type: apiService.type,
            groupName: apiService.groupName,
            hostname: apiService.hostname,
            port: apiService.port,
            templates: apiService.templates,
            fallback: apiService.properties.fallback === 'true',
            minMemory: apiService.minMemory,
            maxMemory: apiService.maxMemory,
            playerCount: apiService.playerCount,
            maxPlayerCount: apiService.maxPlayerCount,
            memoryUsage: apiService.memoryUsage,
            cpuUsage: apiService.cpuUsage,
            motd: apiService.motd,
            createdAt: apiService.information.createdAt,
            statusColor: getStatusColor(apiService.state),
            statusIcon: getStatusIcon(apiService.state),
            typeColor: getTypeColor(apiService.type)
        };
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.groupName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGroup = selectedGroup === 'all' || service.groupName === selectedGroup;
            const matchesType = selectedType === 'all' || service.type === selectedType;

            return matchesSearch && matchesGroup && matchesType;
        });
    }, [services, searchTerm, selectedGroup, selectedType]);

    const availableGroups = useMemo(() => {
        const groups = [...new Set(services.map(service => service.groupName))];
        return groups.sort();
    }, [services]);

    const availableTypes = useMemo(() => {
        const types = [...new Set(services.map(service => service.type))];
        return types.sort();
    }, [services]);

    const stats = useMemo(() => {
        const totalServices = services.length;
        const onlineServices = services.filter(s => s.state === 'ONLINE').length;
        const totalPlayers = services.reduce((sum, s) => sum + s.playerCount, 0);
        const totalMemory = services.reduce((sum, s) => sum + s.memoryUsage, 0);

        return {
            total: totalServices,
            online: onlineServices,
            players: totalPlayers,
            memory: Math.round(totalMemory)
        };
    }, [services]);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading services...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Server className="h-10 w-10 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Error loading services</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={fetchServices} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Services</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Monitor and manage your running services
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Server className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Total Services</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Activity className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Online</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stats.online}</div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Users className="h-4 w-4 text-purple-500" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Total Players</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stats.players}</div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <HardDrive className="h-4 w-4 text-orange-500" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Memory Used</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stats.memory} MB</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    >
                        <option value="all">All Groups</option>
                        {availableGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    >
                        <option value="all">All Types</option>
                        {availableTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredServices.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 40, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: index * 0.12,
                                ease: [0.34, 1.56, 0.64, 1]
                            }}
                        >
                            <Card className="border-border/50 h-[460px] flex flex-col relative">
                                <CardHeader className="pb-3 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            {service.statusIcon}
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-sm font-semibold text-foreground truncate">
                                                    {service.name}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        {service.groupName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="absolute top-3 right-3 text-xs h-5 px-2"
                                    >
                                        {service.type}
                                    </Badge>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col space-y-0 pt-0">
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant="outline"
                                                className={`text-xs h-6 px-3 ${
                                                    service.state === 'ONLINE'
                                                        ? 'border-green-500/50 text-green-500 bg-green-500/10'
                                                        : service.state === 'OFFLINE'
                                                            ? 'border-red-500/50 text-red-500 bg-red-500/10'
                                                            : service.state === 'STARTING'
                                                                ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10'
                                                                : service.state === 'STOPPING'
                                                                    ? 'border-orange-500/50 text-orange-500 bg-orange-500/10'
                                                                    : 'border-gray-500/50 text-gray-500 bg-gray-500/10'
                                                }`}
                                            >
                                                {service.state}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <HardDrive className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm font-medium text-muted-foreground">Memory</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-foreground">
                                                {service.memoryUsage} / {service.maxMemory} MB
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium text-muted-foreground">CPU</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-foreground">
                                                {service.cpuUsage}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium text-muted-foreground">Players</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-foreground">
                                                {service.playerCount} / {service.maxPlayerCount}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm font-medium text-muted-foreground">Port</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-foreground">
                                                {service.port}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-border/30 mt-2 pt-3 flex-shrink-0">
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Settings className="w-4 h-4" />
                                                Advanced Settings
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Templates</span>
                                                <span className="text-sm font-medium text-foreground">
                                                    {service.templates.length}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Fallback</span>
                                                <span className="text-sm font-medium text-foreground">
                                                    {service.fallback ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1"></div>

                                    <div className="border-t border-border/30 pt-4 flex-shrink-0">
                                        <div className="flex items-center justify-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                title="Open Console"
                                                disabled={service.state === 'OFFLINE'}
                                                onClick={() => setLocation(`/service/${service.name}/screen`)}
                                            >
                                                <Terminal className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${
                                                    !permissionService.hasPermission('polocloud.service.restart')
                                                        ? 'text-gray-400 cursor-not-allowed opacity-50'
                                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                }`}
                                                title={
                                                    !permissionService.hasPermission('polocloud.service.restart')
                                                        ? 'Keine Berechtigung zum Neustarten von Services'
                                                        : 'Restart Service'
                                                }
                                                disabled={
                                                    service.state === 'STARTING' ||
                                                    service.state === 'STOPPING' ||
                                                    restartingServices.has(service.name) ||
                                                    !permissionService.hasPermission('polocloud.service.restart')
                                                }
                                                onClick={() => handleRestartService(service.name)}
                                            >
                                                {restartingServices.has(service.name) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title="Stop Service"
                                                disabled={service.state === 'OFFLINE' || service.state === 'STOPPING'}
                                            >
                                                <Power className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex-shrink-0">
                                        <div className="text-[10px] text-muted-foreground text-center">
                                            Created: {new Date(service.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="space-y-4">
                        <Server className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">
                                No services found
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                {searchTerm || selectedGroup !== 'all' || selectedType !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'No services are currently running'
                                }
                            </p>
                        </div>
                        {(searchTerm || selectedGroup !== 'all' || selectedType !== 'all') && (
                            <Button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedGroup('all');
                                    setSelectedType('all');
                                }}
                                variant="outline"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
