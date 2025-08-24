import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {CreateGroupObject} from '@/layout/groups/create/CreateGroupLayout';
import {SetupStepProps} from '@/layout/groups/create/CreateGroupLayout';
import {cn} from '@/lib/utils';
import {usePlatforms} from '@/hooks/usePlatforms';
import {
    getPlatformImage,
    getPlatformDisplayName,
    getPlatformTypeDisplayName,
    getPlatformTypeColor
} from '@/lib/utils/platformUtils';
import {motion} from 'framer-motion';
import {Badge} from '@/components/ui/badge';

export const SelectPlatformStep: React.FC<SetupStepProps<CreateGroupObject>> = ({
                                                                                    onNext,
                                                                                    isOnFocus,
                                                                                    object,
                                                                                    setObject,
                                                                                }) => {
    const {platforms, loading, error} = usePlatforms();

    if (loading) {
        return (
            <Card className={`transition-all ${!isOnFocus ? 'opacity-50 pointer-events-none' : ''}`}>
                <CardHeader>
                    <CardTitle>Select Platform</CardTitle>
                    <CardDescription>
                        Loading available platforms...
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
                    <CardTitle>Select Platform</CardTitle>
                    <CardDescription>
                        Error loading platforms: {error}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-destructive p-4">
                        Failed to load platforms. Please try again later.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`transition-all ${!isOnFocus ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
                <CardTitle>Select Platform</CardTitle>
                <CardDescription>
                    Select from a variety of platforms to create your new Group.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {platforms.map((platformData, index) => (
                        <motion.div
                            key={platformData.platform.name}
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.3, delay: index * 0.05}}
                        >
                            <div
                                onClick={() => setObject({...object, platform: platformData.platform.name})}
                                className={cn(
                                    'group p-4 border-2 rounded-xl items-center justify-center flex flex-col cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg',
                                    object.platform === platformData.platform.name
                                        ? 'bg-gradient-to-br from-[oklch(0.7554_0.1534_231.639)]/15 via-[oklch(0.7554_0.1534_231.639)]/10 to-transparent border-[oklch(0.7554_0.1534_231.639)] shadow-lg shadow-[oklch(0.7554_0.1534_231.639)]/25'
                                        : 'border-border hover:border-[oklch(0.7554_0.1534_231.639)]/50 hover:bg-[oklch(0.7554_0.1534_231.639)]/5'
                                )}
                            >
                                <img
                                    src={getPlatformImage(platformData.platform.name)}
                                    className="w-12 h-12 mb-3 object-contain"
                                    alt={platformData.platform.name}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder.png';
                                    }}
                                />
                                <span className={cn(
                                    'capitalize font-medium text-xs text-center transition-colors duration-300 leading-tight',
                                    object.platform === platformData.platform.name
                                        ? 'text-[oklch(0.7554_0.1534_231.639)]'
                                        : 'text-foreground group-hover:text-[oklch(0.7554_0.1534_231.639)]/70'
                                )}>
                  {getPlatformDisplayName(platformData.platform.name)}
                </span>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        'mt-2 text-xs',
                                        getPlatformTypeColor(platformData.platform.type)
                                    )}
                                >
                                    {getPlatformTypeDisplayName(platformData.platform.type)}
                                </Badge>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                    {object.platform ? `Selected: ${getPlatformDisplayName(object.platform)}` : 'No platform selected'}
                </div>
                <Button
                    onClick={onNext}
                    disabled={!object.platform}
                    className="bg-[oklch(0.7554_0.1534_231.639)] hover:bg-[oklch(0.7554_0.1534_231.639)]/90"
                >
                    Next
                </Button>
            </CardFooter>
        </Card>
    );
};
