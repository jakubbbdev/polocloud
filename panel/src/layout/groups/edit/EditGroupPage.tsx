import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Save,
    RotateCcw,
    HardDrive,
    Server,
    Settings,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { groupApi, GroupEditModel } from '@/lib/api';
import useBreadcrumbStore from '@/components/system/breadcrumb/hook/useBreadcrumbStore';
import { toast } from 'sonner';

interface GroupDisplayModel {
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
        fallback?: boolean;
        static?: boolean;
        [key: string]: any;
    };
}

export default function EditGroupPage() {
    const { groupName } = useParams<{ groupName: string }>();
    const [, setLocation] = useLocation();
    const { initializePage } = useBreadcrumbStore();

    const [group, setGroup] = useState<GroupDisplayModel | null>(null);
    const [originalGroup, setOriginalGroup] = useState<GroupDisplayModel | null>(null);
    const [editData, setEditData] = useState<GroupEditModel | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

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
                {
                    label: 'Edit',
                    href: `/groups/${groupName}/edit`,
                    activeHref: `/groups/${groupName}/edit`,
                },
            ]);
        }
    }, [groupName, initializePage]);

    useEffect(() => {
        const fetchData = async () => {
            if (!groupName) return;

            setIsLoading(true);
            setError(null);

            try {
                const groupResult = await groupApi.getGroup(groupName);
                if (groupResult.success && groupResult.data) {
                    const groupData = groupResult.data as any;
                    const displayModel: GroupDisplayModel = {
                        name: groupData.name,
                        minMemory: groupData.minMemory,
                        maxMemory: groupData.maxMemory,
                        minOnlineService: groupData.minOnlineService,
                        maxOnlineService: groupData.maxOnlineService,
                        platform: groupData.platform,
                        percentageToStartNewService: groupData.percentageToStartNewService,
                        templates: groupData.templates || [],
                        properties: groupData.properties || { fallback: false, static: false }
                    };
                    setGroup(displayModel);
                    setOriginalGroup(displayModel);

                    const editModel: GroupEditModel = {
                        minMemory: groupData.minMemory,
                        maxMemory: groupData.maxMemory,
                        minOnlineService: groupData.minOnlineService,
                        maxOnlineService: groupData.maxOnlineService,
                        percentageToStartNewService: groupData.percentageToStartNewService
                    };
                    setEditData(editModel);
                } else {
                    setError(groupResult.message || 'Failed to load group');
                }
            } catch (error) {
                setError('Error loading data');
                
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [groupName]);

    useEffect(() => {
        if (group && originalGroup) {
            const changed = JSON.stringify(group) !== JSON.stringify(originalGroup);
            setHasChanges(changed);
        }
    }, [group, originalGroup]);

    const handleInputChange = (field: string, value: any) => {
        if (!group) return;
        setGroup(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = async () => {
        if (!group || !groupName || !editData) return;

        setIsSaving(true);
        try {
            const updateData: GroupEditModel = {
                minMemory: group.minMemory,
                maxMemory: group.maxMemory,
                minOnlineService: group.minOnlineService,
                maxOnlineService: group.maxOnlineService,
                percentageToStartNewService: group.percentageToStartNewService
            };

            const result = await groupApi.updateGroup(groupName, updateData);

            if (result.success) {
                toast.success('Group updated successfully!');
                setOriginalGroup(group);
                setHasChanges(false);
                setLocation(`/groups/${groupName}`);
            } else {
                toast.error(result.message || 'Failed to update group');
            }
        } catch (error) {
            toast.error('Failed to update group');
            
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (originalGroup) {
            setGroup(originalGroup);
            setHasChanges(false);
        }
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
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Error loading group
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {error || 'Failed to load group data'}
                    </p>
                    <Button onClick={() => setLocation('/groups')} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Groups
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/groups/${groupName}`)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edit Group</h1>
                        <p className="text-muted-foreground">Modify group settings and configuration</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600/50">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Unsaved Changes
                        </Badge>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={!hasChanges}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="min-w-[120px]"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Group Information (Read-only)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Group Name</Label>
                                <div className="mt-1 text-sm font-medium text-foreground">{group.name}</div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Platform</Label>
                                <div className="mt-1 text-sm font-medium text-foreground">{group.platform.name}</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Version</Label>
                                <div className="mt-1 text-sm font-medium text-foreground">{group.platform.version}</div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Templates</Label>
                                <div className="mt-1">
                                    {group.templates.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {group.templates.map((template, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {template}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No templates configured</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Editable Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <HardDrive className="h-5 w-5 text-purple-500" />
                                Memory Configuration
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="minMemory">Minimum Memory (MB)</Label>
                                    <Input
                                        id="minMemory"
                                        type="number"
                                        value={group.minMemory}
                                        onChange={(e) => handleInputChange('minMemory', parseInt(e.target.value))}
                                        min="512"
                                        step="512"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="maxMemory">Maximum Memory (MB)</Label>
                                    <Input
                                        id="maxMemory"
                                        type="number"
                                        value={group.maxMemory}
                                        onChange={(e) => handleInputChange('maxMemory', parseInt(e.target.value))}
                                        min="1024"
                                        step="512"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Server className="h-5 w-5 text-green-500" />
                                Service Configuration
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="minOnline">Min Online Services</Label>
                                    <Input
                                        id="minOnline"
                                        type="number"
                                        value={group.minOnlineService}
                                        onChange={(e) => handleInputChange('minOnlineService', parseInt(e.target.value))}
                                        min="0"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="maxOnline">Max Online Services</Label>
                                    <Input
                                        id="maxOnline"
                                        type="number"
                                        value={group.maxOnlineService}
                                        onChange={(e) => handleInputChange('maxOnlineService', parseInt(e.target.value))}
                                        min="1"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="percentage">Auto-start Percentage</Label>
                                    <Input
                                        id="percentage"
                                        type="number"
                                        value={group.percentageToStartNewService}
                                        onChange={(e) => handleInputChange('percentageToStartNewService', parseInt(e.target.value))}
                                        min="0"
                                        max="100"
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Percentage of max services to start new service automatically
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
