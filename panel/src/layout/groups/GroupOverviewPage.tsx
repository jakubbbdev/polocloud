import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Server,
    HardDrive,
    Clock,
    Settings,
    ArrowLeft,
    Edit,
    Trash2,
    Activity,
    MemoryStick
} from 'lucide-react';
import { groupApi } from '@/lib/api';
import { getPlatformImage, getPlatformDisplayName } from '@/lib/utils/platformUtils';
import useBreadcrumbStore from '@/components/system/breadcrumb/hook/useBreadcrumbStore';
import { permissionService } from '@/lib/utils/PermissionService';

interface ApiGroup {
    name: string;
    minMemory: number;
    maxMemory: number;
    minOnlineService: number;
    maxOnlineService: number;
    platform: {
        name: string;
        version: string;
    };
    percentageToStartNewService: number;
    information: {
        createdAt: number;
    };
    templates: string[];
    properties: {
        fallback?: boolean;
        static?: boolean;
        [key: string]: any;
    };
}
interface Group {
    id: string;
    name: string;
    minMemory: number;
    maxMemory: number;
    minOnlineService: number;
    maxOnlineService: number;
    platform: {
        name: string;
        version: string;
    };
    percentageToStartNewService: number;
    templates: string[];
    properties: {
        fallback: boolean;
        static: boolean;
        [key: string]: any;
    };
    createdAt: number;
    platformIcon: string;
    platformDisplayName: string;
}

export default function GroupOverviewPage() {
    const { groupName } = useParams<{ groupName: string }>();
    const [, setLocation] = useLocation();
    const { initializePage } = useBreadcrumbStore();
    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (groupName) {
            initializePage([
                {
                    label: 'Groups',
                    href: '/groups',
                    activeHref: '/groups',
                },
                {
                    label: groupName,
                    href: `/groups/${groupName}`,
                    activeHref: `/groups/${groupName}`,
                },
            ]);
        }
    }, [groupName, initializePage]);

    const fetchGroup = async () => {
        if (!groupName) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await groupApi.getGroup(groupName);
            if (result.success && result.data) {
                const apiGroup = result.data as ApiGroup;
                const convertedGroup = convertApiGroupToGroup(apiGroup);
                setGroup(convertedGroup);
            } else {
                setError(result.message || 'Failed to load group');
            }
        } catch (error) {
            setError('Error loading group');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteGroup = async (groupName: string) => {
        if (!permissionService.hasPermission('polocloud.group.delete')) {
            return;
        }

        if (confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
            try {
                const result = await groupApi.deleteGroup(groupName);
                if (result.success) {
                    setLocation('/groups');
                } else {
                }
            } catch (error) {
                
            }
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [groupName]);

    const convertApiGroupToGroup = (apiGroup: ApiGroup): Group => {
        return {
            id: apiGroup.name,
            name: apiGroup.name,
            minMemory: apiGroup.minMemory,
            maxMemory: apiGroup.maxMemory,
            minOnlineService: apiGroup.minOnlineService,
            maxOnlineService: apiGroup.maxOnlineService,
            platform: apiGroup.platform,
            percentageToStartNewService: apiGroup.percentageToStartNewService,
            templates: apiGroup.templates || [],
            properties: {
                fallback: apiGroup.properties?.fallback || false,
                static: apiGroup.properties?.static || false,
                ...apiGroup.properties
            },
            createdAt: apiGroup.information.createdAt,
            platformIcon: getPlatformImage(apiGroup.platform.name),
            platformDisplayName: getPlatformDisplayName(apiGroup.platform.name)
        };
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading group...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Server className="h-10 w-10 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Error loading group</h3>
                    <p className="text-muted-foreground mb-4">{error || 'Group not found'}</p>
                    <Button onClick={() => setLocation('/groups')} variant="outline">
                        Back to Groups
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Button
                        onClick={() => setLocation('/groups')}
                        variant="ghost"
                        size="sm"
                        className="p-2 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <img
                            src={group.platformIcon}
                            alt={group.platform.name}
                            className="w-10 h-10"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">
                                    {group.platformDisplayName}
                                </p>
                                <Badge variant="outline" className="text-xs h-5 px-2">
                                    {group.platform.version}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className={`px-4 py-2 border-border/50 transition-colors duration-200 ${
                            !permissionService.hasPermission('polocloud.group.edit')
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:border-border'
                        }`}
                        onClick={() => setLocation(`/groups/${group.name}/edit`)}
                        disabled={!permissionService.hasPermission('polocloud.group.edit')}
                        title={
                            !permissionService.hasPermission('polocloud.group.edit')
                                ? 'Keine Berechtigung zum Bearbeiten von Gruppen'
                                : 'Edit Group'
                        }
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Group
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className={`px-4 py-2 transition-all duration-200 ${
                            !permissionService.hasPermission('polocloud.group.delete')
                                ? 'opacity-50 cursor-not-allowed border-gray-600/50 bg-gray-500/20 text-gray-400'
                                : 'border-red-600/50 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:border-red-500/70'
                        }`}
                        onClick={() => handleDeleteGroup(group.name)}
                        disabled={!permissionService.hasPermission('polocloud.group.delete')}
                        title={
                            !permissionService.hasPermission('polocloud.group.delete')
                                ? 'Keine Berechtigung zum Löschen von Gruppen'
                                : 'Delete Group'
                        }
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Group
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <MemoryStick className="h-4 w-4 text-purple-500" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Memory Range</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {group.minMemory} - {group.maxMemory} MB
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Activity className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Service Range</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {group.minOnlineService} - {group.maxOnlineService}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Settings className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Auto-start</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {group.percentageToStartNewService}%
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Clock className="h-4 w-4 text-orange-500" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Created</span>
                        </div>
                        <div className="text-sm font-medium text-foreground">
                            {new Date(group.createdAt).toLocaleDateString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            Group Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Platform</span>
                                <span className="text-sm font-medium text-foreground">{group.platformDisplayName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Version</span>
                                <span className="text-sm font-medium text-foreground">{group.platform.version}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Memory Range</span>
                                <span className="text-sm font-medium text-foreground">{group.minMemory} - {group.maxMemory} MB</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Service Range</span>
                                <span className="text-sm font-medium text-foreground">{group.minOnlineService} - {group.maxOnlineService}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Auto-start Threshold</span>
                                <Badge variant="outline">{group.percentageToStartNewService}%</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Fallback Group</span>
                                <Badge variant={group.properties.fallback ? "default" : "secondary"}>
                                    {group.properties.fallback ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Static Service</span>
                                <Badge variant={group.properties.static ? "default" : "secondary"}>
                                    {group.properties.static ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Created</span>
                                <span className="text-sm font-medium text-foreground">
                                    {new Date(group.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5" />
                            Templates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {group.templates.length > 0 ? (
                            <div className="space-y-2">
                                {group.templates.map((template, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs h-5 px-2 mr-2 mb-2"
                                    >
                                        {template}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No templates configured</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
