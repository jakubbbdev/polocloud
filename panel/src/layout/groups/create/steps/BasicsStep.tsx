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
import {CreateGroupObject} from '@/layout/groups/create/CreateGroupLayout';
import {SetupStepProps} from '@/layout/groups/create/CreateGroupLayout';
import {cn} from '@/lib/utils';
import {useEffect, useState} from 'react';
import {groupApi} from '@/lib/api';
import {Search, X, Check, AlertTriangle} from 'lucide-react';

export const BasicsStep: React.FC<SetupStepProps<CreateGroupObject>> = ({
                                                                            onNext,
                                                                            isOnFocus,
                                                                            object,
                                                                            setObject,
                                                                        }) => {
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
    const [nameCheckTimeout, setNameCheckTimeout] = useState<NodeJS.Timeout | null>(null);

    const name = object?.name || '';
    const isNameValid = name.trim().length >= 3;
    const isNameEmpty = name.trim() === '';
    const showNameError = !isNameEmpty && !isNameValid;

    const checkNameAvailability = async (groupName: string) => {
        if (groupName.trim().length < 3) {
            setIsNameAvailable(null);
            return;
        }

        setIsCheckingName(true);
        try {
            const response = await groupApi.getGroups();
            if (response.success && response.data) {
                const existingGroup = response.data.find(
                    (group: any) => group.name.toLowerCase() === groupName.trim().toLowerCase()
                );
                setIsNameAvailable(!existingGroup);
            } else {
                setIsNameAvailable(true);
            }
        } catch (error) {
            setIsNameAvailable(true);
        } finally {
            setIsCheckingName(false);
        }
    };

    useEffect(() => {
        if (nameCheckTimeout) {
            clearTimeout(nameCheckTimeout);
        }

        if (name.trim().length >= 3) {
            const timeout = setTimeout(() => {
                checkNameAvailability(name);
            }, 500);
            setNameCheckTimeout(timeout);
        } else {
            setIsNameAvailable(null);
        }

        return () => {
            if (nameCheckTimeout) {
                clearTimeout(nameCheckTimeout);
            }
        };
    }, [name]);

    const isNameFullyValid = isNameValid && isNameAvailable === true;

    return (
        <Card
            className={`transition-all ${
                !isOnFocus ? 'opacity-50 pointer-events-none' : ''
            }`}
        >
            <CardHeader>
                <CardTitle>Create a new Group</CardTitle>
                <CardDescription>
                    Give basic information about your new Group.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="groupName" className="text-base font-semibold">Group Name</Label>
                        <Input
                            disabled={!isOnFocus}
                            id="groupName"
                            placeholder="Enter group name (min. 3 characters)"
                            value={object?.name || ''}
                            className={cn(
                                "w-full h-12 text-lg",
                                showNameError ? "border-red-500 focus:border-red-500" : "",
                                isNameValid ? "border-green-500/50 focus:border-green-500" : ""
                            )}
                            onChange={(e) => setObject({...object, name: e.target.value})}
                        />
                        {isNameEmpty && (
                            <p className="text-sm text-muted-foreground">
                                Please enter a group name to continue
                            </p>
                        )}

                        {showNameError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center justify-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500"/>
                                    <p className="text-sm text-red-500">
                                        Group name must be at least 3 characters long
                                    </p>
                                </div>
                            </div>
                        )}

                        {isNameValid && isCheckingName && (
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div className="flex items-center justify-center space-x-2">
                                    <Search className="h-4 w-4 text-blue-500"/>
                                    <p className="text-sm text-blue-500">
                                        Checking name availability...
                                    </p>
                                </div>
                            </div>
                        )}

                        {isNameValid && !isCheckingName && isNameAvailable === false && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center justify-center space-x-2">
                                    <X className="h-4 w-4 text-red-500"/>
                                    <p className="text-sm text-red-500">
                                        Group name already exists
                                    </p>
                                </div>
                            </div>
                        )}

                        {isNameValid && !isCheckingName && isNameAvailable === true && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="flex items-center justify-center space-x-2">
                                    <Check className="h-4 w-4 text-green-500"/>
                                    <p className="text-sm text-green-500">
                                        Group name is available
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button
                    disabled={!isNameFullyValid || !isOnFocus}
                    onClick={onNext}
                    className="w-full"
                >
                    Continue
                </Button>
            </CardFooter>
        </Card>
    );
};
