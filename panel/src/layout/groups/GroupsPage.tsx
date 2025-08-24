import {useState, useEffect, useMemo} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Server,
    HardDrive,
    Settings,
    Filter,
    Trash2
} from 'lucide-react';
import {groupApi, userApi, rolesApi} from '@/lib/api';
import {toast} from 'sonner';
import {getPlatformImage} from '@/lib/utils/platformUtils';
import useBreadcrumbStore from '@/components/system/breadcrumb/hook/useBreadcrumbStore';
import {motion, AnimatePresence} from 'framer-motion';
import {useLocation} from 'wouter';
import {Link} from 'wouter';
import {usePlatforms} from '@/hooks/usePlatforms';
import {permissionService, type CurrentUser} from '@/lib/utils/PermissionService';
import type { Role } from "@/lib/api";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';

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
        [key: string]: any;
    };
}

interface Group {
    id: string;
    name: string;
    platform: string;
    platformIcon: string;
    version: string;
    playerCount: number;
    maxPlayers: number;
    activeServices: number;
    totalServices: number;
    minMemory: number;
    maxMemory: number;
    percentageToStart?: number;
    minOnlineServices: number;
    maxOnlineServices: number;
    staticService: boolean;
    fallback: boolean;
    templates: string[];
    createdAt: number;
}

export default function GroupsPage() {
    const {initializePage} = useBreadcrumbStore();
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [, setLocation] = useLocation();
    const {platforms, loading: platformsLoading} = usePlatforms();
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCurrentUser = async () => {
        try {
            const result = await userApi.getCurrentUser();
            if (result.success && result.data) {
                const userData = result.data as CurrentUser;

                if (userData.role) {
                    try {
                        const roleResult = await rolesApi.getRole(userData.role.toString());
                        if (roleResult.success && roleResult.data) {
                            const roleData = roleResult.data as Role;
                            const permissions = roleData.permissions || [];

                            permissionService.setUserData(userData, permissions);

                        }
                    } catch (roleError) {
                        
                        permissionService.setUserData(userData, []);
                    }
                } else {
                    permissionService.setUserData(userData, []);
                }
            }
        } catch (error) {
            
        } finally {
            permissionService.setLoadingStatus(false);
        }
    };

    const convertApiGroupToGroup = (apiGroup: ApiGroup): Group => {
        const platformName = apiGroup.platform.name;
        const platformIcon = getPlatformImage(platformName);

        return {
            id: apiGroup.name,
            name: apiGroup.name,
            platform: platformName,
            platformIcon: platformIcon,
            version: apiGroup.platform.version,
            playerCount: 0,
            maxPlayers: 0,
            activeServices: 0,
            totalServices: 0,
            minMemory: apiGroup.minMemory,
            maxMemory: apiGroup.maxMemory,
            percentageToStart: apiGroup.percentageToStartNewService,
            minOnlineServices: apiGroup.minOnlineService,
            maxOnlineServices: apiGroup.maxOnlineService,
            staticService: apiGroup.properties.staticService || false,
            fallback: apiGroup.properties.fallback || false,
            templates: apiGroup.templates || [],
            createdAt: apiGroup.information.createdAt
        };
    };

    const openDeleteModal = (group: Group) => {
        setGroupToDelete(group);
        setDeleteConfirmation('');
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setGroupToDelete(null);
        setDeleteConfirmation('');
        setIsDeleting(false);
    };

    const handleDeleteGroup = async () => {
        if (!groupToDelete || deleteConfirmation !== groupToDelete.name) {
            return;
        }

        if (!permissionService.hasPermission('polocloud.group.delete')) {
            toast.error('Keine Berechtigung zum Löschen von Gruppen. Benötigte Permission: polocloud.group.delete');
            return;
        }

        setIsDeleting(true);
        try {
            const result = await groupApi.deleteGroup(groupToDelete.name);
            if (result.success) {
                setGroups(prev => prev.filter(group => group.name !== groupToDelete.name));

                closeDeleteModal();
                toast.success(`Group "${groupToDelete.name}" deleted successfully!`);
            } else {
                toast.error(result.message || `Failed to delete group "${groupToDelete.name}"`);
            }
        } catch (error) {
            toast.error(`Error deleting group "${groupToDelete.name}"`);
        } finally {
            setIsDeleting(false);
        }
    };

    const fetchGroups = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await groupApi.getGroups();

            if (result.success && result.data) {
                const apiGroups = result.data as ApiGroup[];
                const convertedGroups = apiGroups.map(convertApiGroupToGroup);
                setGroups(convertedGroups);

            } else {
                setError(result.message || 'Failed to load groups');

            }
        } catch (error) {
            setError('Error loading groups');

        } finally {
            setIsLoading(false);
        }
    };

    const allAvailablePlatforms = useMemo(() => {
        if (platformsLoading) return [];
        return platforms.map(p => p.platform.name).sort();
    }, [platforms, platformsLoading]);

    const filteredGroups = useMemo(() => {
        if (selectedPlatform === 'all') {
            return groups;
        }
        return groups.filter(group => group.platform === selectedPlatform);
    }, [selectedPlatform, groups]);

    useEffect(() => {
        initializePage([
            {
                label: 'Groups',
                href: '/groups',
                activeHref: '/groups',
            },
        ]);
        fetchGroups();
        fetchCurrentUser();
    }, [initializePage]);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading groups...</p>
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
                        <Server className="h-10 w-10 text-red-500"/>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Error loading groups</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={fetchGroups} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Groups</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage your server groups and their services
                </p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground"/>
                        <span className="text-sm font-medium text-muted-foreground">Platform:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPlatform('all')}
                            className="text-xs h-8 px-3"
                        >
                            All Platforms
                        </Button>
                        {platformsLoading ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                Loading platforms...
                            </div>
                        ) : (
                            allAvailablePlatforms
                                .filter(platform => groups.some(group => group.platform === platform))
                                .map((platform) => {
                                    const groupCount = groups.filter(group => group.platform === platform).length;
                                    return (
                                        <Button
                                            key={platform}
                                            variant={selectedPlatform === platform ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedPlatform(platform)}
                                            className="text-xs h-8 px-3"
                                            title={`Filter by ${platform}`}
                                        >
                                            {platform}
                                            <span className="ml-1 text-xs">({groupCount})</span>
                                        </Button>
                                    );
                                })
                        )}
                    </div>
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Button
                                    onClick={() => setLocation('/groups/create')}
                                    disabled={!permissionService.hasPermission('polocloud.group.create') || permissionService.isLoading()}
                                    className={`h-8 px-3 text-xs transition-all duration-200 hover:scale-[1.02] shadow-lg ${
                                        permissionService.hasPermission('polocloud.group.create')
                                            ? 'bg-[oklch(75.54%_0.1534_231.639)] hover:bg-[oklch(75.54%_0.1534_231.639/0.8)]'
                                            : 'bg-gray-400 cursor-not-allowed opacity-50'
                                    }`}
                                >
                                    <Server className="w-4 h-4 mr-2"/>
                                    Create Group
                                    {!permissionService.hasPermission('polocloud.group.create') && (
                                        <span className="ml-2 text-xs opacity-75">(No Permission)</span>
                                    )}
                                </Button>
                            </div>
                        </TooltipTrigger>
                        {!permissionService.hasPermission('polocloud.group.create') && (
                            <TooltipContent>
                                <p>Sie benötigen die Berechtigung "polocloud.group.create" um Gruppen zu erstellen</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            {filteredGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredGroups.map((group, index) => (
                            <motion.div
                                key={group.id}
                                initial={{opacity: 0, y: 40, scale: 0.85}}
                                animate={{opacity: 1, y: 0, scale: 1}}
                                exit={{
                                    opacity: 0,
                                    scale: 0.8,
                                    y: -20,
                                    transition: {duration: 0.3, ease: "easeInOut"}
                                }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.12,
                                    ease: [0.34, 1.56, 0.64, 1]
                                }}
                                className="relative"
                            >
                                <Card
                                    className="border-border/50 hover:border-border transition-colors duration-200 h-80">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDeleteModal(group);
                                        }}
                                        disabled={!permissionService.hasPermission('polocloud.group.delete')}
                                        className={`absolute top-2 right-2 h-8 w-8 p-0 z-10 ${
                                            !permissionService.hasPermission('polocloud.group.delete')
                                                ? 'text-gray-400 cursor-not-allowed opacity-50'
                                                : 'text-red-500 hover:text-red-600 hover:bg-red-500/10'
                                        }`}
                                        title={
                                            !permissionService.hasPermission('polocloud.group.delete')
                                                ? 'Keine Berechtigung zum Löschen von Gruppen'
                                                : 'Delete Group'
                                        }
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={group.platformIcon}
                                                alt={group.platform}
                                                className="w-7 h-7"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-sm font-semibold text-foreground truncate">
                                                    {group.name}
                                                </CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-muted-foreground">
                                                        {group.platform}
                                                    </p>
                                                    <Badge variant="outline" className="text-xs h-5 px-2">
                                                        {group.version}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3 pt-0">
                                        <div className="border-t border-border/30"></div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="w-3 h-3 text-purple-500"/>
                                                <span
                                                    className="text-xs font-medium text-muted-foreground">Memory</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-medium text-foreground">
                                                    {group.minMemory} - {group.maxMemory} MB
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Server className="w-3 h-3 text-green-500"/>
                                                <span
                                                    className="text-xs font-medium text-muted-foreground">Services</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-medium text-foreground">
                                                    min: {group.minOnlineServices} | max: {group.maxOnlineServices}
                                                </div>
                                            </div>
                                        </div>

                                        {(group.percentageToStart || group.fallback || group.staticService || (group.templates && group.templates.length > 0)) && (
                                            <>
                                                <div className="border-t border-border/30"></div>
                                                <div className="space-y-2">
                                                    <div
                                                        className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                        <Settings className="w-3 h-3"/>
                                                        Advanced Settings
                                                    </div>

                                                    {group.percentageToStart && (
                                                        <div className="flex items-center justify-between">
                                                            <span
                                                                className="text-xs text-muted-foreground">Auto-start</span>
                                                            <span className="text-xs font-medium text-foreground">
                                                                {group.percentageToStart}%
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Fallback</span>
                                                        <span className="text-xs font-medium text-foreground">
                                                            {group.fallback ? "Yes" : "No"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Static</span>
                                                        <span className="text-xs font-medium text-foreground">
                                                            {group.staticService ? "Yes" : "No"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Templates</span>
                                                        <div className="text-right">
                                                            {group.templates && group.templates.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1 justify-end">
                                                                    {group.templates.map((template, index) => (
                                                                        <Badge
                                                                            key={index}
                                                                            variant="secondary"
                                                                            className="text-xs h-5 px-2"
                                                                        >
                                                                            {template}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">No templates</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="border-t border-border/30 pt-2">
                                            <div className="text-xs text-muted-foreground text-center">
                                                Created: {new Date(group.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Link href={`/groups/${group.name}`}>
                                    <div className="absolute inset-0 cursor-pointer"/>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="space-y-4">
                        <Server className="w-16 h-16 text-muted-foreground mx-auto opacity-50"/>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">
                                No groups found for {selectedPlatform}
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                There are no groups configured for the {selectedPlatform} platform yet.
                            </p>
                        </div>
                        <Button
                            onClick={() => setLocation('/groups/create')}
                            className="mt-4"
                        >
                            <Server className="w-4 h-4 mr-2"/>
                            Create {selectedPlatform} Group
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Delete Group</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. To confirm deletion, please type the group
                            name: <strong>{groupToDelete?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Input
                            placeholder="Enter group name to confirm"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="font-mono"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={closeDeleteModal}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteGroup}
                            disabled={deleteConfirmation !== groupToDelete?.name || isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Group'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
