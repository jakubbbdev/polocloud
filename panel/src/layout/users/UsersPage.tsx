import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Users, Loader2, ChevronDown, Plus, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {DataTable} from '@/components/ui/data-table';
import {ColumnDef} from '@tanstack/react-table';
import {userApi, rolesApi} from '@/lib/api';
import useBreadcrumbStore from '@/components/system/breadcrumb/hook/useBreadcrumbStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {ShimmerButton} from '@/components/magicui/shimmer-button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {permissionService, type CurrentUser} from '@/lib/utils/PermissionService';
import type { Role } from "@/lib/api";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';

interface User {
    uuid: string;
    username: string;
    role: number;
    createdAt: number;
    roleDetails?: {
        label: string;
        hexColor: string;
    };
}

interface UserRole {
    id: number;
    label: string;
    hexColor: string;
    default: boolean;
}

export default function UsersPage() {
    const {initializePage} = useBreadcrumbStore();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        username: '',
        roleId: ''
    });
    const [isCreating, setIsCreating] = useState(false);

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

    useEffect(() => {
        initializePage([
            {
                label: 'Users',
                href: '/users',
                activeHref: '/users',
            },
        ]);
    }, [initializePage]);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchCurrentUser();
    }, []);

    const fetchRoles = async () => {
        try {
            const result = await rolesApi.getRoles();

            if (result.success && result.data) {
                const rolesData = result.data as Record<string, any>;
                

                let rolesArray: UserRole[];

                if (Array.isArray(result.data)) {
                    rolesArray = result.data.map((role: any) => ({
                        id: parseInt(role.id),
                        label: role.label || role.name || 'Unknown',
                        hexColor: role.hexColor,
                        default: role.default || false
                    }));
                } else {
                    rolesArray = Object.keys(rolesData).map(key => ({
                        id: parseInt(key),
                        label: rolesData[key].label || rolesData[key].name || 'Unknown',
                        hexColor: rolesData[key].hexColor,
                        default: rolesData[key].default || false
                    }));
                }

                rolesArray.sort((a, b) => {
                    if (a.id === -1) return -1;
                    if (b.id === -1) return 1;
                    return a.id - b.id;
                });

                

                setRoles(rolesArray);
            } else {
                
                toast.error(`Failed to fetch roles: ${result.message}`);
            }
        } catch (error) {
            
            toast.error(`Error fetching roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const result = await userApi.getAllUsers();

            

            if (result.success && result.data) {
                

                if (Array.isArray(result.data)) {
                    const usersWithRoles = await Promise.all(
                        result.data.map(async (userData: any) => {
                            try {
                                const roleResult = await rolesApi.getRole(userData.role.toString());
                                let roleDetails = undefined;

                                if (roleResult.success && roleResult.data) {
                                    const roleData = roleResult.data as any;
                                    roleDetails = {
                                        label: roleData.label,
                                        hexColor: roleData.hexColor
                                    };
                                }

                                return {
                                    uuid: userData.uuid,
                                    username: userData.username,
                                    createdAt: userData.createdAt,
                                    role: userData.role,
                                    roleDetails
                                };
                            } catch (error) {
                                
                                return {
                                    uuid: userData.uuid,
                                    username: userData.username,
                                    createdAt: userData.createdAt,
                                    role: userData.role,
                                    roleDetails: undefined
                                };
                            }
                        })
                    );

                    
                    setUsers(usersWithRoles);
                } else {
                    
                    toast.error('Invalid data format received from server');
                }
            } else {
                
                toast.error(`Failed to fetch users: ${result.message}`);
            }
        } catch (error) {
            
            toast.error(`Error fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'username',
            header: 'Name',
            cell: ({row}) => (
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            src={`https://mineskin.eu/helm/${row.original.username}/32.png`}
                            alt={`${row.original.username}'s Minecraft skin`}
                            className="h-8 w-8 rounded-md border border-border/50 transition-transform duration-200 hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.src = 'https://mineskin.eu/helm/HttpMarco/32.png';
                            }}
                        />
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/20 rounded-md flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                    <span className="font-medium">{row.original.username}</span>
                </div>
            ),
        },
        {
            accessorKey: 'uuid',
            header: 'UUID',
            cell: ({row}) => (
                <div className="font-mono text-sm text-muted-foreground">
                    {row.original.uuid}
                </div>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({row}) => (
                <div className="flex items-center space-x-2">
                    {row.original.roleDetails ? (
                        <Badge
                            variant="secondary"
                            style={{
                                backgroundColor: row.original.roleDetails.hexColor + '20',
                                color: row.original.roleDetails.hexColor
                            }}
                        >
                            {row.original.roleDetails.label}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground">Role {row.original.role}</span>
                    )}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-6 px-2 ${
                                                    !permissionService.hasPermission('polocloud.user.edit')
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : ''
                                                }`}
                                                disabled={!permissionService.hasPermission('polocloud.user.edit')}
                                            >
                                                <ChevronDown className="h-3 w-3"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {roles.map((role) => (
                                                <DropdownMenuItem
                                                    key={role.id}
                                                    onClick={() => handleRoleChange(row.original.uuid, role.id)}
                                                    className="flex items-center space-x-2"
                                                    disabled={!permissionService.hasPermission('polocloud.user.edit')}
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{backgroundColor: role.hexColor}}
                                                    />
                                                    <span>{role.label}</span>
                                                    {role.default && (
                                                        <Badge variant="outline" className="text-xs ml-auto">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TooltipTrigger>
                            {!permissionService.hasPermission('polocloud.user.edit') && (
                                <TooltipContent>
                                    <p>Sie benötigen die Berechtigung "polocloud.user.edit" um Benutzer-Rollen zu ändern</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({row}) => (
                <div className="text-sm text-muted-foreground">
                    {formatDate(row.original.createdAt)}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            size: 120,
            cell: ({row}) => {
                const user = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.uuid)}
                                            disabled={!permissionService.hasPermission('polocloud.user.delete')}
                                            className={`p-2 h-8 w-8 ${
                                                !permissionService.hasPermission('polocloud.user.delete')
                                                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                                                    : 'text-red-500 hover:text-red-600 hover:bg-red-50/50'
                                            }`}
                                            title={
                                                !permissionService.hasPermission('polocloud.user.delete')
                                                    ? 'Keine Berechtigung zum Löschen von Benutzern'
                                                    : 'Delete user'
                                            }
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!permissionService.hasPermission('polocloud.user.delete') && (
                                    <TooltipContent>
                                        <p>Sie benötigen die Berechtigung "polocloud.user.delete" um Benutzer zu löschen</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
        },
    ];

    const handleRoleChange = async (userUuid: string, newRoleId: number) => {
        if (!permissionService.hasPermission('polocloud.user.edit')) {
            toast.error('Sie haben keine Berechtigung, Benutzer-Rollen zu ändern');
            return;
        }

        try {
            const currentUser = users.find(user => user.uuid === userUuid);
            const currentRole = roles.find(role => role.id === newRoleId);

            if (!currentUser || !currentRole) {
                toast.error('User or role not found');
                return;
            }

            const loadingToast = toast.loading(`Changing role for ${currentUser.username}...`);

            const result = await userApi.updateUserRole(userUuid, newRoleId);

            if (result.success) {
                toast.success(`Role changed successfully! ${currentUser.username} is now ${currentRole.label}`, {
                    id: loadingToast
                });

                await fetchUsers();
            } else {
                toast.error(`Failed to change role: ${result.message}`, {
                    id: loadingToast
                });
            }
        } catch (error) {
            
            toast.error(`Failed to change user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleCreateUser = async () => {
        if (!newUserData.username.trim() || !newUserData.roleId) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsCreating(true);
        try {
            const result = await userApi.createUser({
                username: newUserData.username.trim(),
                roleId: parseInt(newUserData.roleId)
            });

            if (result.success) {
                const generatedPassword = result.data?.password;
                if (generatedPassword) {
                    toast.success(
                        <div className="space-y-3">
                            <div className="font-semibold text-green-600">User "{newUserData.username}" created
                                successfully!
                            </div>

                            <div className="bg-muted/50 p-3 rounded-lg border border-border">
                                <div className="text-sm flex items-center justify-between mb-2">
                                    <span className="text-muted-foreground font-medium">Generated Password:</span>
                                    <button
                                        onClick={() => copyToClipboard(generatedPassword)}
                                        className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors font-medium"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                                <div
                                    className="font-mono bg-background px-3 py-2 rounded border border-border text-primary font-bold text-center text-lg tracking-wider">
                                    {generatedPassword}
                                </div>
                            </div>

                            <div
                                className="text-xs text-muted-foreground text-center bg-yellow-50/50 p-2 rounded border border-yellow-200/50">
                                Save this password securely and share it with the user. It won't be shown again.
                            </div>
                        </div>,
                        {
                            duration: 20000,
                        }
                    );
                } else {
                    toast.success(`User "${newUserData.username}" created successfully!`);
                }

                setNewUserData({username: '', roleId: ''});
                setIsCreateModalOpen(false);

                await fetchUsers();
            } else {
                toast.error(`Failed to create user: ${result.message}`);
            }
        } catch (error) {
            
            toast.error(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancelCreate = () => {
        setNewUserData({username: '', roleId: ''});
        setIsCreateModalOpen(false);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Password copied to clipboard!');
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Password copied to clipboard!');
        }
    };

    const handleDeleteUser = async (userUuid: string) => {
        if (!permissionService.hasPermission('polocloud.user.delete')) {
            toast.error('Sie haben keine Berechtigung, Benutzer zu löschen');
            return;
        }

        try {
            const currentUser = users.find(user => user.uuid === userUuid);
            if (!currentUser) {
                toast.error('User not found');
                return;
            }

            const confirm = window.confirm(`Are you sure you want to delete user "${currentUser.username}"? This action cannot be undone.`);
            if (!confirm) {
                return;
            }

            const loadingToast = toast.loading(`Deleting user ${currentUser.username}...`);
            const result = await userApi.deleteUser(userUuid);

            if (result.success) {
                toast.success(`User "${currentUser.username}" deleted successfully!`, {
                    id: loadingToast
                });
                await fetchUsers();
            } else {
                toast.error(`Failed to delete user: ${result.message}`, {
                    id: loadingToast
                });
            }
        } catch (error) {
            
            toast.error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
                    Users Management
                </motion.h1>
                <motion.p
                    className="text-muted-foreground"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.4, ease: "easeOut"}}
                >
                    Manage system users and their roles
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
                            <Users className="h-5 w-5"/>
                            <span>System Users</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={fetchUsers}
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
                                                disabled={!permissionService.hasPermission('polocloud.user.create') || permissionService.isLoading()}
                                                className={`shadow-2xl transition-all duration-200 hover:scale-[1.02] h-9 px-4 py-2 text-sm ${
                                                    !permissionService.hasPermission('polocloud.user.create')
                                                        ? 'opacity-50 cursor-not-allowed grayscale'
                                                        : ''
                                                }`}
                                                background="oklch(75.54% .1534 231.639)"
                                                shimmerColor="oklch(75.54% .1534 231.639)"
                                                shimmerDuration="2s"
                                                borderRadius="8px"
                                            >
                                                <Plus className="mr-2 h-4 w-4"/>
                                                Create User
                                                {!permissionService.hasPermission('polocloud.user.create') && (
                                                    <span className="ml-2 text-xs opacity-75">(No Permission)</span>
                                                )}
                                            </ShimmerButton>
                                        </div>
                                    </TooltipTrigger>
                                    {!permissionService.hasPermission('polocloud.user.create') && (
                                        <TooltipContent>
                                            <p>Sie benötigen die Berechtigung "polocloud.user.create" um Benutzer zu erstellen</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500"/>
                                <span className="ml-2 text-muted-foreground">Loading users...</span>
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No users found.</p>
                        ) : (
                            <DataTable columns={columns} data={users}/>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {isCreateModalOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                >
                    <motion.div
                        className="bg-background border border-border rounded-lg p-6 w-full max-w-md"
                        initial={{scale: 0.9, y: 20}}
                        animate={{scale: 1, y: 0}}
                        transition={{duration: 0.2}}
                    >
                        <h3 className="text-lg font-semibold mb-4">Create New User</h3>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={newUserData.username}
                                    onChange={(e) => setNewUserData(prev => ({...prev, username: e.target.value}))}
                                    placeholder="Enter username"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={newUserData.roleId}
                                    onValueChange={(value) => setNewUserData(prev => ({...prev, roleId: value}))}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select a role"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{backgroundColor: role.hexColor}}
                                                    />
                                                    <span>{role.label}</span>
                                                    {role.default && (
                                                        <Badge variant="outline" className="text-xs ml-auto">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button
                                    onClick={handleCreateUser}
                                    disabled={isCreating}
                                    className="flex-1"
                                >
                                    {isCreating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    ) : null}
                                    Create User
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCancelCreate}
                                    disabled={isCreating}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
