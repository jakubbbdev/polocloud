import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {toast} from 'sonner';
import {Edit, Save, X} from 'lucide-react';
import {userApi} from '@/lib/api';
import {Badge} from '@/components/ui/badge';
import { permissionService } from '@/lib/utils/PermissionService';

interface GeneralTabProps {
    user: UserData;
    skinHeadUrl: string;
    onUserUpdate?: (newUsername: string) => void;
}

interface UserData {
    name: string;
    uuid: string;
    role?: number;
    roleDetails?: {
        label: string;
        hexColor: string;
    };
}

export function GeneralTab({user, skinHeadUrl, onUserUpdate}: GeneralTabProps) {
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState(user.name);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveUsername = async () => {
        if (!newUsername.trim() || newUsername.trim() === user.name) {
            setIsEditingUsername(false);
            setNewUsername(user.name);
            return;
        }

        if (newUsername.trim().length < 3) {
            toast.error('Username must be at least 3 characters long');
            return;
        }

        if (!permissionService.hasPermission('polocloud.user.self.edit')) {
            toast.error('No permission to edit username. Required permission: polocloud.user.self.edit');
            setIsEditingUsername(false);
            setNewUsername(user.name);
            return;
        }

        setIsSaving(true);
        try {
            const result = await userApi.updateUsername(newUsername.trim());

            if (result.success) {
                toast.success('Username updated successfully!');
                setIsEditingUsername(false);

                if (onUserUpdate) {
                    onUserUpdate(newUsername.trim());
                }
            } else {
                toast.error(`Failed to update username: ${result.message}`);
                setNewUsername(user.name);
            }
        } catch (error) {
            toast.error('Failed to update username. Please try again.');
            setNewUsername(user.name);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingUsername(false);
        setNewUsername(user.name);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold mb-2">Account Information</h3>
                <p className="text-muted-foreground">
                    Manage your basic account details and profile information
                </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                        <img
                            src={skinHeadUrl}
                            alt={`${user.name}'s Minecraft skin`}
                            className="h-20 w-20 rounded-xl border-2 border-border/50 shadow-lg"
                            onError={(e) => {
                                e.currentTarget.src = 'https://mineskin.eu/helm/Steve/32.png';
                            }}
                        />
                        <div
                            className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold">{user.name}</h4>
                        <p className="text-muted-foreground font-mono text-sm">{user.uuid}</p>
                        <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                            Online
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                        <div className="flex items-center space-x-2">
                            {isEditingUsername ? (
                                <>
                                    <Input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="flex-1"
                                        placeholder="Enter new username"
                                        disabled={isSaving}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSaveUsername}
                                        disabled={isSaving || !newUsername.trim() || newUsername.trim() === user.name}
                                        className="px-3"
                                    >
                                        {isSaving ? (
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Save className="h-4 w-4"/>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="px-3"
                                    >
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Input
                                        type="text"
                                        value={user.name}
                                        className="flex-1 disabled:opacity-50"
                                        disabled
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsEditingUsername(true)}
                                        className={`px-3 ${
                                            !permissionService.hasPermission('polocloud.user.self.edit')
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                        disabled={!permissionService.hasPermission('polocloud.user.self.edit')}
                                        title={
                                            !permissionService.hasPermission('polocloud.user.self.edit')
                                                ? 'No permission to edit username'
                                                : 'Edit username'
                                        }
                                    >
                                        <Edit className="h-4 w-4"/>
                                        {!permissionService.hasPermission('polocloud.user.self.edit') && (
                                            <span className="ml-1 text-xs opacity-75">(No Permission)</span>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                        {isEditingUsername && (
                            <p className="text-xs text-muted-foreground">
                                Username must be at least 3 characters long
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                        <div className="flex items-center space-x-2">
                            {user.roleDetails ? (
                                <Badge
                                    variant="secondary"
                                    className="px-3 py-2 text-sm font-medium"
                                    style={{
                                        backgroundColor: user.roleDetails.hexColor + '20',
                                        color: user.roleDetails.hexColor,
                                        border: `1px solid ${user.roleDetails.hexColor}40`
                                    }}
                                >
                                    {user.roleDetails.label}
                                </Badge>
                            ) : (
                                <span
                                    className="px-3 py-2 text-sm text-muted-foreground bg-muted/30 border border-border rounded-md">
                                    {user.role !== undefined ? `Role ${user.role}` : 'Unknown Role'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}