import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {CreateGroupObject} from '@/layout/groups/create/CreateGroupLayout';
import {SetupStepProps} from '@/layout/groups/create/CreateGroupLayout';
import {Loader2} from 'lucide-react';
import {useState} from 'react';

export const AdvancedStep: React.FC<SetupStepProps<CreateGroupObject>> = ({
                                                                              isOnFocus,
                                                                              object,
                                                                              setObject,
                                                                              onCreateGroup,
                                                                          }) => {
    const [isCreating, setIsCreating] = useState(false);

    const isServicesValid = (object.minOnlineServices || 0) <= (object.maxOnlineServices || 0);

    const isFormValid = object.name &&
        object.platform &&
        object.version &&
        object.maxMemory > 0 &&
        isServicesValid;

    const handleCreateGroup = async () => {
        if (!onCreateGroup) return;

        setIsCreating(true);

        try {
            await onCreateGroup();
        } catch (error) {

        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Card
            className={`transition-all ${
                !isOnFocus ? 'opacity-50 pointer-events-none' : ''
            }`}
        >
            <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                    Configure advanced settings for your Group.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Service Management</Label>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Percentage to Start New
                            Service</Label>
                        <Input
                            type="number"
                            placeholder="Enter percentage (0-100)"
                            value={object.percentageToStart || ''}
                            onChange={(e) => setObject({...object, percentageToStart: parseInt(e.target.value) || 0})}
                            min="0"
                            max="100"
                            className="h-11 text-center text-lg font-medium"
                        />
                        <p className="text-xs text-muted-foreground text-center">
                            When to automatically start a new service instance
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-muted-foreground">Min Online Services</Label>
                                <Input
                                    type="number"
                                    placeholder="Min services"
                                    value={object.minOnlineServices || ''}
                                    onChange={(e) => {
                                        const minServices = parseInt(e.target.value) || 0;
                                        if (minServices <= (object.maxOnlineServices || 0)) {
                                            setObject({...object, minOnlineServices: minServices});
                                        }
                                    }}
                                    min="0"
                                    max={object.maxOnlineServices || 999}
                                    className="h-11 text-center text-lg font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-muted-foreground">Max Online Services</Label>
                                <Input
                                    type="number"
                                    placeholder="Max services"
                                    value={object.maxOnlineServices || ''}
                                    onChange={(e) => {
                                        const maxServices = parseInt(e.target.value) || 0;
                                        let newMinServices = object.minOnlineServices || 0;

                                        if (maxServices < newMinServices) {
                                            newMinServices = Math.max(0, maxServices);
                                        }

                                        setObject({
                                            ...object,
                                            maxOnlineServices: maxServices,
                                            minOnlineServices: newMinServices
                                        });
                                    }}
                                    min="0"
                                    className="h-11 text-center text-lg font-medium"
                                />
                            </div>
                        </div>

                        {object.minOnlineServices > 0 && object.maxOnlineServices > 0 &&
                            object.minOnlineServices > object.maxOnlineServices && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-sm text-red-500 text-center">
                                        ⚠️ Minimum services cannot be greater than maximum services
                                    </p>
                                </div>
                            )}

                        {object.minOnlineServices > 0 && object.maxOnlineServices > 0 &&
                            object.minOnlineServices <= object.maxOnlineServices && (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <p className="text-sm text-blue-500 text-center">
                                        Service range: {object.minOnlineServices} - {object.maxOnlineServices}
                                    </p>
                                </div>
                            )}
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base font-semibold">Templates</Label>
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Template Names</Label>
                        <div className="space-y-2">
                            {object.templates?.map((template, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="Template name (e.g., lobby, survival, minigame)"
                                        value={template}
                                        onChange={(e) => {
                                            const newTemplates = [...(object.templates || [])];
                                            newTemplates[index] = e.target.value;
                                            setObject({...object, templates: newTemplates});
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newTemplates = object.templates?.filter((_, i) => i !== index) || [];
                                            setObject({...object, templates: newTemplates});
                                        }}
                                        className="px-3"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const newTemplates = [...(object.templates || []), ''];
                                    setObject({...object, templates: newTemplates});
                                }}
                                className="w-full"
                            >
                                Add Template
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Add template names that this group should use. Leave empty if no templates are needed.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base font-semibold">Group Behavior</Label>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Static Service Group</Label>
                                <p className="text-xs text-muted-foreground">Group runs as a static service</p>
                            </div>
                            <Switch
                                checked={object.staticService || false}
                                onCheckedChange={(checked) => setObject({...object, staticService: checked})}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Fallback Group</Label>
                                <p className="text-xs text-muted-foreground">Group acts as fallback</p>
                            </div>
                            <Switch
                                checked={object.fallback || false}
                                onCheckedChange={(checked) => setObject({...object, fallback: checked})}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button
                    onClick={handleCreateGroup}
                    className="w-full"
                    disabled={!isOnFocus || isCreating || !isFormValid}
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            Creating Group...
                        </>
                    ) : (
                        'Create Group'
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};
