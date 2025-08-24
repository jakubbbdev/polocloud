import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Shield, Loader2, Plus, Edit2, Trash2, Users, Settings} from 'lucide-react';
import {ShimmerButton} from '@/components/magicui/shimmer-button';
import {toast} from 'sonner';
import {DataTable} from '@/components/ui/data-table';
import {ColumnDef} from '@tanstack/react-table';
import {rolesApi, userApi} from '@/lib/api';
import useBreadcrumbStore from '@/components/system/breadcrumb/hook/useBreadcrumbStore';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {AnimatePresence} from 'framer-motion';
import {HexColorPicker} from 'react-colorful';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {permissionService, type CurrentUser} from '@/lib/utils/PermissionService';
import type { Role } from "@/lib/api";

export default function RolePage() {
    const {initializePage} = useBreadcrumbStore();
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleColor, setNewRoleColor] = useState('#3b82f6');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

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

    const availablePermissions = {
        'System': {
            icon: Settings,
            permissions: [
                {key: 'polocloud.system.version', label: 'System Version'},
                {key: 'polocloud.system.information', label: 'System Information'}
            ]
        },
        'User Management': {
            icon: Users,
            permissions: [
                {key: 'polocloud.user.list', label: 'List Users'},
                {key: 'polocloud.user.get', label: 'Get User'}
            ]
        },
        'Service Management': {
            icon: Shield,
            permissions: [
                {key: 'polocloud.service.count', label: 'Service Count'},
                {key: 'polocloud.service.list', label: 'Service List'}
            ]
        },
        'Role Management': {
            icon: Shield,
            permissions: [
                {key: 'polocloud.role.list', label: 'List Roles'},
                {key: 'polocloud.role.get', label: 'Get Role'}
            ]
        },
        'Player Management': {
            icon: Users,
            permissions: [
                {key: 'polocloud.player.get', label: 'Get Player'},
                {key: 'polocloud.players.list', label: 'List Players'}
            ]
        },
        'Platform Management': {
            icon: Shield,
            permissions: [
                {key: 'polocloud.platform.list', label: 'List Platforms'}
            ]
        },
        'Group Management': {
            icon: Shield,
            permissions: [
                {key: 'polocloud.group.count', label: 'Group Count'},
                {key: 'polocloud.group.list', label: 'Group List'},
                {key: 'polocloud.group.get', label: 'Get Group'}
            ]
        },
        'WebSocket': {
            icon: Shield,
            permissions: [
                {key: 'polocloud.ws.alive', label: 'WebSocket Alive'},
                {key: 'polocloud.ws.logs', label: 'WebSocket Logs'},
                {key: 'polocloud.service.screen', label: 'Service Screen'}
            ]
        }
    };

    useEffect(() => {
        initializePage([
            {
                label: 'Roles',
                href: '/roles',
                activeHref: '/roles',
            },
        ]);
        fetchRoles();
        fetchCurrentUser();
    }, [initializePage]);

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: 'label',
            header: 'Role',
            cell: ({row}) => (
                <div className="flex items-center space-x-3">
                    <div
                        className="w-5 h-5 rounded-full border border-border/50 shadow-sm"
                        style={{backgroundColor: row.original.hexColor}}
                    />
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{row.original.label}</span>
                        {row.original.isDefaultRole && (
                            <Badge variant="secondary" className="text-xs">
                                Standard
                            </Badge>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'hexColor',
            header: 'Color',
            cell: ({row}) => (
                <div className="flex items-center space-x-3">
                    <div
                        className="w-8 h-8 rounded-lg border border-border/50 shadow-sm"
                        style={{backgroundColor: row.original.hexColor}}
                    />
                    <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-foreground">
                            {row.original.hexColor}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {row.original.hexColor.toUpperCase()}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'userCount',
            header: 'Users',
            cell: ({row}) => (
                <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground"/>
                    <span>{row.original.userCount}</span>
                </div>
            ),
        },
        {
            accessorKey: 'permissions',
            header: 'Permissions',
            cell: ({row}) => (
                <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground"/>
                    <span>{row.original.permissions?.length || 0}</span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({row}) => (
                <div className="flex items-center space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditRole(row.original)}
                                        className={`h-8 w-8 p-0 ${
                                            !permissionService.hasPermission('polocloud.role.edit') || row.original.isDefaultRole
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                        disabled={!permissionService.hasPermission('polocloud.role.edit') || row.original.isDefaultRole}
                                        title={
                                            !permissionService.hasPermission('polocloud.role.edit')
                                                ? 'Keine Berechtigung zum Bearbeiten von Rollen'
                                                : row.original.isDefaultRole
                                                    ? "Standard-Rollen können nicht bearbeitet werden"
                                                    : "Rolle bearbeiten"
                                        }
                                    >
                                        <Edit2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {!permissionService.hasPermission('polocloud.role.edit') && (
                                <TooltipContent>
                                    <p>Sie benötigen die Berechtigung "polocloud.role.edit" um Rollen zu bearbeiten</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteRole(row.original.id)}
                                        className={`h-8 w-8 p-0 ${
                                            !permissionService.hasPermission('polocloud.role.delete') || row.original.isDefaultRole
                                                ? 'opacity-50 cursor-not-allowed text-gray-400'
                                                : 'text-red-500 hover:text-red-600'
                                        }`}
                                        disabled={!permissionService.hasPermission('polocloud.role.delete') || row.original.isDefaultRole}
                                        title={
                                            !permissionService.hasPermission('polocloud.role.delete')
                                                ? 'Keine Berechtigung zum Löschen von Rollen'
                                                : row.original.isDefaultRole
                                                    ? "Standard-Rollen können nicht gelöscht werden"
                                                    : "Rolle löschen"
                                        }
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {!permissionService.hasPermission('polocloud.role.delete') && (
                                <TooltipContent>
                                    <p>Sie benötigen die Berechtigung "polocloud.role.delete" um Rollen zu löschen</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
    ];

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const result = await rolesApi.getRoles();

            if (result.success && result.data) {
                if (Array.isArray(result.data)) {
                    setRoles(result.data);
                } else if (typeof result.data === 'object') {
                    const rolesArray = Object.entries(result.data).map(([id, roleData]: [string, any]) => {
                        const label = roleData.label || roleData.name || roleData.title || 'Unknown Role';
                        const hexColor = roleData.hexColor || roleData.color || roleData.hex || '#6b7280';
                        const userCount = roleData.userCount || 0;
                        const permissions = roleData.permissions || [];
                        const isDefaultRole = roleData.default || roleData.isDefaultRole || false;

                        return {
                            id,
                            label,
                            hexColor,
                            userCount,
                            permissions,
                            isDefaultRole
                        };
                    });

                    const sortedRoles = rolesArray.sort((a, b) => {
                        const aNum = parseInt(a.id);
                        const bNum = parseInt(b.id);
                        return aNum - bNum;
                    });

                    setRoles(sortedRoles);
                } else {
                    toast.error('Invalid data format received from server');
                }
            } else {
                toast.error(`Failed to fetch roles: ${result.message}`);
            }
        } catch (error) {
            toast.error(`Error fetching roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            toast.error('Please enter a role name');
            return;
        }

        try {
            const result = await rolesApi.createRole({
                label: newRoleName.trim(),
                hexColor: newRoleColor,
                permissions: selectedPermissions
            });

            if (result.success) {
                toast.success('Role created successfully!');
                setNewRoleName('');
                setNewRoleColor('#3b82f6');
                setIsCreateModalOpen(false);
                const newRole: Role = {
                    id: result.data?.id || Date.now().toString(),
                    label: newRoleName.trim(),
                    hexColor: newRoleColor,
                    userCount: 0,
                    permissions: selectedPermissions
                };
                setRoles(prev => [...prev, newRole]);
            } else {
                toast.error(`Failed to create role: ${result.message}`);
            }
        } catch (error) {
            toast.error(`Error creating role: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleEditRole = (role: Role) => {
        if (!permissionService.hasPermission('polocloud.role.edit')) {
            toast.error('Sie haben keine Berechtigung, Rollen zu bearbeiten');
            return;
        }

        if (role.isDefaultRole) {
            toast.error('Standard-Rollen können nicht bearbeitet werden');
            return;
        }

        setEditingRole(role);
        setNewRoleName(role.label);
        setNewRoleColor(role.hexColor);
        setSelectedPermissions(role.permissions || []);
        setIsCreateModalOpen(true);
    };

    const handleUpdateRole = async () => {
        if (!editingRole || !newRoleName.trim()) {
            toast.error('Please enter a role name');
            return;
        }

        const updateData = {
            label: newRoleName.trim(),
            hexColor: newRoleColor,
            permissions: selectedPermissions
        };

        
        

        try {
            const result = await rolesApi.updateRole(editingRole.id, updateData);

            if (result.success) {
                toast.success('Role updated successfully!');
                setRoles(prev => prev.map(role =>
                    role.id === editingRole.id
                        ? {...role, label: newRoleName.trim(), hexColor: newRoleColor, permissions: selectedPermissions}
                        : role
                ));
                setEditingRole(null);
                setNewRoleName('');
                setNewRoleColor('#3b82f6');
                setSelectedPermissions([]);
                setIsCreateModalOpen(false);
            } else {
                toast.error(`Failed to update role: ${result.message}`);
            }
        } catch (error) {
            toast.error(`Error updating role: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!permissionService.hasPermission('polocloud.role.delete')) {
            toast.error('Sie haben keine Berechtigung, Rollen zu löschen');
            return;
        }

        const roleToDelete = roles.find(role => role.id === roleId);

        if (!roleToDelete) {
            toast.error('Role not found');
            return;
        }

        if (roleToDelete.isDefaultRole) {
            toast.error('Standard-Rollen können nicht gelöscht werden');
            return;
        }

        if (roleToDelete.userCount > 0) {
            toast.error('Cannot delete roles with assigned users');
            return;
        }

        if (roles.length <= 1) {
            toast.error('Cannot delete the last role');
            return;
        }

        try {
            const result = await rolesApi.deleteRole(roleId);

            if (result.success) {
                toast.success('Role deleted successfully!');
                setRoles(prev => prev.filter(role => role.id !== roleId));
            } else {
                toast.error(`Failed to delete role: ${result.message}`);
            }
        } catch (error) {
            toast.error(`Error deleting role: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleCancel = () => {
        setEditingRole(null);
        setNewRoleName('');
        setNewRoleColor('#3b82f6');
        setSelectedPermissions([]);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="space-y-6 p-6">
            <motion.div
                className="space-y-2"
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6, ease: "easeOut"}}
            >
                <motion.h1
                    className="text-3xl font-bold text-foreground"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.2, ease: "easeOut"}}
                >
                    Role Management
                </motion.h1>
                <motion.p
                    className="text-muted-foreground"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.4, ease: "easeOut"}}
                >
                    Manage team roles and permissions
                </motion.p>
            </motion.div>

            <motion.div
                initial={{opacity: 0, y: 20, scale: 0.95}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{duration: 0.8, delay: 0.6, ease: "easeOut"}}
            >
                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Shield className="h-5 w-5"/>
                            <span>Team Roles</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={fetchRoles}
                                disabled={isLoading}
                                variant="outline"
                                className="transition-all duration-200 hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                ) : null}
                                Refresh
                            </Button>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <ShimmerButton
                                                onClick={() => setIsCreateModalOpen(true)}
                                                disabled={!permissionService.hasPermission('polocloud.role.create') || permissionService.isLoading()}
                                                className={`shadow-2xl transition-all duration-200 hover:scale-[1.02] h-9 px-3 py-2 text-sm ${
                                                    !permissionService.hasPermission('polocloud.role.create')
                                                        ? 'opacity-50 cursor-not-allowed grayscale'
                                                        : ''
                                                }`}
                                                background="oklch(75.54% .1534 231.639)"
                                                shimmerColor="oklch(75.54% .1534 231.639)"
                                                shimmerDuration="2s"
                                                borderRadius="8px"
                                            >
                                                <Plus className="mr-2 h-4 w-4"/>
                                                Create Role
                                                {!permissionService.hasPermission('polocloud.role.create') && (
                                                    <span className="ml-2 text-xs opacity-75">(No Permission)</span>
                                                )}
                                            </ShimmerButton>
                                        </div>
                                    </TooltipTrigger>
                                    {!permissionService.hasPermission('polocloud.role.create') && (
                                        <TooltipContent>
                                            <p>Sie benötigen die Berechtigung "polocloud.role.create" um Rollen zu erstellen</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {permissionService.isLoading() ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500"/>
                                <span className="ml-2 text-muted-foreground">Loading roles...</span>
                            </div>
                        ) : roles.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No roles found.</p>
                        ) : (
                            <DataTable columns={columns} data={roles}/>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setIsCreateModalOpen(false)}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <motion.div
                            className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            initial={{opacity: 0, scale: 0.8, y: 50}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.8, y: 50}}
                            transition={{type: "spring", stiffness: 300, damping: 25}}
                        >
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {editingRole ? 'Edit Role' : 'Create New Role'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="roleName">Role Name</Label>
                                    <Input
                                        id="roleName"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        placeholder="Enter role name"
                                        className="mt-1"
                                        disabled={editingRole?.isDefaultRole}
                                    />
                                    {editingRole?.isDefaultRole && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Standard-Rollen können nicht bearbeitet werden
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="roleColor">Role Color</Label>
                                    <div className="mt-1 space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <HexColorPicker
                                                color={newRoleColor}
                                                onChange={setNewRoleColor}
                                                className="w-48 h-48"
                                            />
                                            <div className="flex flex-col space-y-2">
                                                <div
                                                    className="w-16 h-16 rounded-lg border border-border/50 shadow-sm"
                                                    style={{backgroundColor: newRoleColor}}
                                                />
                                                <span className="text-sm text-muted-foreground font-mono text-center">
                                            {newRoleColor}
                                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="text-sm font-medium">Permissions (Optional)</Label>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const allPermissions = Object.values(availablePermissions)
                                                        .flatMap(cat => cat.permissions.map(p => p.key));
                                                    setSelectedPermissions(allPermissions);
                                                }}
                                                className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                                            >
                                                Select All
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedPermissions([])}
                                                className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                    <div
                                        className="space-y-4 max-h-48 overflow-y-auto border border-border/40 rounded-lg p-3">
                                        {Object.entries(availablePermissions).map(([category, categoryData]) => (
                                            <div key={category} className="space-y-2">
                                                <div className="flex items-center gap-2 pb-1 border-b border-border/30">
                                                    <categoryData.icon className="h-4 w-4 text-muted-foreground"/>
                                                    <span
                                                        className="text-sm font-medium text-foreground">{category}</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-1.5 pl-1">
                                                    {categoryData.permissions.map((permission) => (
                                                        <div key={permission.key}
                                                             className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={permission.key}
                                                                checked={selectedPermissions.includes(permission.key)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setSelectedPermissions(prev => [...prev, permission.key]);
                                                                    } else {
                                                                        setSelectedPermissions(prev => prev.filter(p => p !== permission.key));
                                                                    }
                                                                }}
                                                                disabled={editingRole?.isDefaultRole}
                                                            />
                                                            <Label
                                                                id={permission.key}
                                                                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                {permission.label}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedPermissions.length > 0 ? (
                                        <div className="mt-3 p-2 bg-muted/20 rounded-md text-center">
                                            <span className="text-xs text-muted-foreground">
                                                {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-3 p-2 bg-muted/10 rounded-md text-center">
                                            <span className="text-xs text-muted-foreground">
                                                No permissions selected (optional)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-2 pt-4">
                                    <Button
                                        onClick={editingRole ? handleUpdateRole : handleCreateRole}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm"
                                        disabled={editingRole?.isDefaultRole}
                                    >
                                        {editingRole ? 'Update Role' : 'Create Role'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        className="flex-1 border-gray-300 hover:border-blue-500 hover:bg-gray-50 py-3 px-6 rounded-lg"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
