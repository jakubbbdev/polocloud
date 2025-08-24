import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {CreateGroupObject, SetupStepProps} from '@/layout/groups/create/CreateGroupLayout';
import {cn} from '@/lib/utils';
import {Info} from 'lucide-react';
import {useEffect, useState} from 'react';
import {usePlatforms} from '@/hooks/usePlatforms';
import {motion} from 'framer-motion';

interface PlatformVersion {
    version: string;
}

export const SelectVersionStep: React.FC<SetupStepProps<CreateGroupObject>> = ({
                                                                                   onNext,
                                                                                   isOnFocus,
                                                                                   object,
                                                                                   setObject,
                                                                               }) => {
    const {platforms, loading, error} = usePlatforms();
    const [availableVersions, setAvailableVersions] = useState<PlatformVersion[]>([]);

    useEffect(() => {
        if (object.platform && platforms.length > 0) {
            const selectedPlatform = platforms.find(p => p.platform.name === object.platform);

            if (selectedPlatform) {
                setAvailableVersions(selectedPlatform.versions);
            }
        }
    }, [object.platform, platforms]);

    if (loading) {
        return (
            <Card className={`transition-all ${!isOnFocus ? 'opacity-50 pointer-events-none' : ''}`}>
                <CardHeader>
                    <CardTitle>Select Version</CardTitle>
                    <CardDescription>
                        Loading available versions for {object.platform}...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`transition-all ${!isOnFocus ? 'opacity-50 pointer-events-none' : ''}`}>
                <CardHeader>
                    <CardTitle>Select Version</CardTitle>
                    <CardDescription>
                        Error loading versions: {error}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-destructive p-4">
                        Failed to load versions. Please try again later.
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!object.platform) {
        return (
            <Card className={`transition-all ${!isOnFocus ? 'opacity-50 pointer-events-none' : ''}`}>
                <CardHeader>
                    <CardTitle>Select Version</CardTitle>
                    <CardDescription>
                        Please select a platform first.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-4">
                        No platform selected. Go back to select a platform.
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="text-center text-muted-foreground">
                        Please go back to select a platform first.
                    </div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className={`transition-all ${!isOnFocus ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
                <CardTitle>Select Version</CardTitle>
                <CardDescription>
                    Choose the version for your {object.platform} group.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {availableVersions.map((version, index) => (
                        <motion.div
                            key={version.version}
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.3, delay: index * 0.05}}
                        >
                            <div
                                onClick={() => setObject({...object, version: version.version})}
                                className={cn(
                                    'group p-4 border-2 rounded-xl items-center justify-center flex flex-col cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg',
                                    object.version === version.version
                                        ? 'bg-gradient-to-br from-[oklch(0.7554_0.1534_231.639)]/15 via-[oklch(0.7554_0.1534_231.639)]/10 to-transparent border-[oklch(0.7554_0.1534_231.639)] shadow-lg shadow-[oklch(0.7554_0.1534_231.639)]/25'
                                        : 'border-border hover:border-[oklch(0.7554_0.1534_231.639)]/50 hover:bg-[oklch(0.7554_0.1534_231.639)]/5'
                                )}
                            >
                                <div className="w-full h-10 mb-3 flex items-center justify-center text-center">
                                    <div
                                        className="text-sm font-bold text-white group-hover:text-[oklch(0.7554_0.1534_231.639)] transform translate-y-0">
                                        {version.version === 'latest' ? 'latest' : version.version}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {availableVersions.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        <Info className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50"/>
                        <p>No versions available for {object.platform}.</p>
                        <p className="text-sm">Please select a different platform.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={onNext}
                    disabled={!object.version}
                    className="w-full bg-[oklch(0.7554_0.1534_231.639)] hover:bg-[oklch(0.7554_0.1534_231.639)]/90"
                >
                    Next
                </Button>
            </CardFooter>
        </Card>
    );
};
