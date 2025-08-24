import {User, Settings, LogOut, User as UserIcon, Shield, Lock, Eye, EyeOff, Palette} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useEffect, useState} from 'react';
import {dashboardApi, authApi, userApi, rolesApi} from '@/lib/api';
import {useLocation} from 'wouter';
import {toast} from 'sonner';
import {GeneralTab} from './settings/GeneralTab';
import {SecurityTab} from './settings/SecurityTab';
import {AppearanceTab} from './settings/AppearanceTab';
import {Badge} from '@/components/ui/badge';
import {useSidebar} from '@/components/ui/sidebar';

interface UserData {
    name: string;
    uuid: string;
    role?: number;
    hasChangedPassword?: boolean;
    roleDetails?: {
        label: string;
        hexColor: string;
    };
}

export function UserInfo() {
    const {state} = useSidebar();
    const [user, setUser] = useState<UserData>({
        name: 'HttpMarco',
        uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        role: -1,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const fetchUserData = async () => {
            if (window.location.pathname === '/onboarding') {
                return;
            }

            setIsLoading(true);
            try {
                const connectionTest = await dashboardApi.testConnection();

                if (connectionTest) {
                    const result = await dashboardApi.getCurrentUser();

                    if (result.success && result.data) {
                        const userData = {
                            name: result.data.username || result.data.name || 'HttpMarco',
                            uuid: result.data.uuid || result.data.id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                            role: result.data.role,
                            hasChangedPassword: result.data.hasChangedPassword,
                        };

                        setUser(userData);

                        if (result.data.hasChangedPassword === false) {
                            setIsPasswordChangeModalOpen(true);
                        }

                        if (result.data.role !== undefined) {
                            try {
                                const rolesResult = await rolesApi.getRoles();

                                if (rolesResult.success && rolesResult.data) {
                                    const userRoleId = result.data.role;

                                    const matchingRole = rolesResult.data.find((role: any) => {
                                        const roleId = role.id;
                                        const userId = userRoleId;

                                        const roleIdNum = Number(roleId);
                                        const userIdNum = Number(userId);

                                        const isMatch = roleIdNum === userIdNum;

                                        return isMatch;
                                    });

                                    if (matchingRole) {
                                        setUser(prev => ({
                                            ...prev,
                                            roleDetails: {
                                                label: matchingRole.label,
                                                hexColor: matchingRole.hexColor
                                            }
                                        }));
                                    } else {
                                        const fallbackRole = getFallbackRole(result.data.role);
                                        if (fallbackRole) {
                                            setUser(prev => ({
                                                ...prev,
                                                roleDetails: fallbackRole
                                            }));
                                        }
                                    }
                                } else {

                                    const fallbackRole = getFallbackRole(result.data.role);
                                    if (fallbackRole) {
                                        setUser(prev => ({
                                            ...prev,
                                            roleDetails: fallbackRole
                                        }));
                                    }
                                }
                            } catch (error) {
                                const fallbackRole = getFallbackRole(result.data.role);
                                if (fallbackRole) {
                                    setUser(prev => ({
                                        ...prev,
                                        roleDetails: fallbackRole
                                    }));
                                }
                            }
                        }
                    } else {

                    }
                } else {

                }
            } catch (error) {

            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const getFallbackRole = (roleId: number) => {
        switch (roleId) {
            case -1:
                return {
                    label: 'Admin',
                    hexColor: '#DC2626'
                };
            case 0:
                return {
                    label: 'User',
                    hexColor: '#059669'
                };
            case 1:
                return {
                    label: 'Moderator',
                    hexColor: '#D97706'
                };
            default:
                return {
                    label: `Role ${roleId}`,
                    hexColor: '#6B7280'
                };
        }
    };

    const handlePasswordChange = async () => {
        if (!newPassword.trim() || !confirmPassword.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setIsChangingPassword(true);
        try {
            const result = await userApi.changePassword(newPassword);

            if (result.success) {
                toast.success('Password changed successfully!');
                setIsPasswordChangeModalOpen(false);
                setNewPassword('');
                setConfirmPassword('');

                setUser(prev => ({
                    ...prev,
                    hasChangedPassword: true
                }));
            } else {
                toast.error(`Failed to change password: ${result.message}`);
            }
        } catch (error) {
            toast.error('Failed to change password. Please try again.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            const result = await authApi.logout();

            if (result.success) {
                toast.success('Logout successful');

                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');

                setTimeout(() => {
                    setLocation('/login');
                }, 1000);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Logout failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const skinHeadUrl = `https://mineskin.eu/helm/${user.name}/32.png`;

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralTab user={user} skinHeadUrl={skinHeadUrl} onUserUpdate={handleUserUpdate}/>;
            case 'security':
                return <SecurityTab/>;
            case 'appearance':
                return <AppearanceTab/>;
            default:
                return null;
        }
    };

    const handleUserUpdate = (newUsername: string) => {
        setUser(prev => ({
            ...prev,
            name: newUsername
        }));

        localStorage.setItem('currentUser', newUsername);

        toast.success(`Username updated to "${newUsername}"`);
    };

    return (
        <>
            {state === 'expanded' && (
                <div className="px-3 py-2">
                    <div
                        className="h-px bg-gradient-to-r from-transparent via-sidebar-foreground/15 to-transparent"></div>
                </div>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        className={`flex items-center ${state === 'expanded' ? 'justify-between p-3 mt-2' : 'justify-center p-2 mt-4'} rounded-lg transition-all duration-200 hover:bg-sidebar-foreground/5 hover:shadow-sm cursor-pointer group w-full`}>
                        <div className={`flex items-center ${state === 'expanded' ? 'space-x-3' : ''}`}>
                            <div className="relative">
                                {state === 'expanded' ? (
                                    <img
                                        src={skinHeadUrl}
                                        alt={`${user.name}'s Minecraft skin`}
                                        className="h-8 w-8 rounded-md border border-border/50 transition-transform duration-200 group-hover:scale-105"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://mineskin.eu/helm/HttpMarco/32.png';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="h-8 w-8 rounded-md border border-border/50 bg-sidebar-accent flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                                        <User className="h-5 w-5 text-sidebar-foreground"/>
                                    </div>
                                )}
                                {isLoading && (
                                    <div
                                        className="absolute inset-0 bg-black/20 rounded-md flex items-center justify-center">
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                            {state === 'expanded' && (
                                <>
                                    <div className="flex flex-col space-y-1 flex-1">
                                        <p className="text-sm font-medium text-white transition-colors duration-200 group-hover:text-sidebar-foreground/90">{user.name}</p>
                                        {user.roleDetails ? (
                                            <Badge
                                                variant="secondary"
                                                className="ml-0 w-fit"
                                                style={{
                                                    backgroundColor: user.roleDetails.hexColor + '20',
                                                    color: user.roleDetails.hexColor
                                                }}
                                            >
                                                {user.roleDetails.label}
                                            </Badge>
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground/70 font-mono tracking-wide transition-colors duration-200 group-hover:text-sidebar-foreground/80">
                                                {user.role !== undefined ? `Role ${user.role}` : 'Unknown Role'}
                                            </p>
                                        )}
                                    </div>
                                    <Settings
                                        className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110 ml-8"/>
                                </>
                            )}
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center space-x-2">
                            <img
                                src={skinHeadUrl}
                                alt={`${user.name}'s Minecraft skin`}
                                className="h-6 w-6 rounded-md border border-border/50"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://mineskin.eu/helm/HttpMarco/32.png';
                                }}
                            />
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                {user.roleDetails ? (
                                    <Badge
                                        variant="secondary"
                                        className="ml-0 w-fit"
                                        style={{
                                            backgroundColor: user.roleDetails.hexColor + '20',
                                            color: user.roleDetails.hexColor
                                        }}
                                    >
                                        {user.roleDetails.label}
                                    </Badge>
                                ) : (
                                    <p className="text-xs leading-none text-muted-foreground/70 font-mono tracking-wide">
                                        {user.role !== undefined ? `Role ${user.role}` : 'Unknown Role'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem className="cursor-pointer transition-colors duration-150 hover:bg-accent/80">
                        <User className="mr-2 h-4 w-4"/>
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer transition-colors duration-150 hover:bg-accent/80"
                        onClick={() => setIsSettingsOpen(true)}
                    >
                        <Settings className="mr-2 h-4 w-4"/>
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        className="cursor-pointer transition-colors duration-150 hover:bg-accent/80 text-red-500 hover:text-red-400"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4"/>
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Settings className="h-5 w-5 text-primary"/>
                            <span>User Settings</span>
                        </DialogTitle>
                        <DialogDescription>
                            Manage your account settings and preferences
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex h-full">
                        <div className="w-48 border-r border-border/50 pr-4">
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`w-full flex items-center justify-start h-12 px-4 rounded-md transition-all duration-200 ${
                                        activeTab === 'general'
                                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    <UserIcon className="mr-3 h-4 w-4"/>
                                    General
                                </button>

                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center justify-start h-12 px-4 rounded-md transition-all duration-200 ${
                                        activeTab === 'security'
                                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    <Shield className="mr-3 h-4 w-4"/>
                                    Security
                                </button>

                                <button
                                    onClick={() => setActiveTab('appearance')}
                                    className={`w-full flex items-center justify-start h-12 px-4 rounded-md transition-all duration-200 ${
                                        activeTab === 'appearance'
                                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    <Palette className="mr-3 h-4 w-4"/>
                                    Appearance
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            {renderContent()}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isPasswordChangeModalOpen}
                onOpenChange={(open) => {
                    if (user.hasChangedPassword) {
                        setIsPasswordChangeModalOpen(open);
                    }
                }}
                modal={true}
            >
                <DialogContent
                    className="max-w-md"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Lock className="h-5 w-5 text-primary"/>
                            <span>Change Password Required</span>
                        </DialogTitle>
                        <DialogDescription>
                            For security reasons, you must change your password before continuing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                </Button>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <Button
                                onClick={handlePasswordChange}
                                disabled={isChangingPassword || !newPassword.trim() || !confirmPassword.trim() || newPassword !== confirmPassword || newPassword.length < 8}
                                className="flex-1"
                            >
                                {isChangingPassword ? (
                                    <>
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Changing Password...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 mr-2"/>
                                        Change Password
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground text-center">
                            Password must be at least 8 characters long
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}