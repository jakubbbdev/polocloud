import { useBreadcrumbPage } from '@/components/system/breadcrumb/hook/useBreadcrumbPage';
import { AdvancedStep } from '@/layout/groups/create/steps/AdvancedStep';
import { BasicsStep } from '@/layout/groups/create/steps/BasicsStep';
import { SelectMemoryStep } from '@/layout/groups/create/steps/SelectMemoryStep';
import { SelectPlatformStep } from '@/layout/groups/create/steps/SelectPlatformStep';
import { SelectVersionStep } from '@/layout/groups/create/steps/SelectVersionStep';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ProgressStep } from '@/components/ui/progress-step';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePlatforms } from '@/hooks/usePlatforms';
import { getPlatformImage } from '@/lib/utils/platformUtils';
import { groupApi } from '@/lib/api';
import { GroupCreateModel } from '@/lib/api/types';

interface OrganizationSetupStep {
    component: React.FC<SetupStepProps<any>>;
    label: string;
}

export interface CreateGroupObject {
    name: string;
    platform?: string;
    version?: string;
    maxMemory: number;
    minMemory?: number;
    fallbackAvailable: boolean;
    staticService: boolean;
    fallback: boolean;
    minOnlineServices: number;
    maxOnlineServices: number;
    percentageToStart?: number;
    isStaticService?: boolean;
    isFallbackGroup?: boolean;
    templates: string[];
}

export interface SetupStepProps<T> {
    object: T;
    setObject: (object: T) => void;
    disabled: boolean;
    onNext: () => void;
    isOnFocus: boolean;
    onCreateGroup?: () => Promise<void>;
}

const steps: OrganizationSetupStep[] = [
    {
        component: BasicsStep,
        label: 'Basics',
    },
    {
        component: SelectPlatformStep,
        label: 'Select Platform',
    },
    {
        component: SelectVersionStep,
        label: 'Select Version',
    },
    {
        component: SelectMemoryStep,
        label: 'Select Memory',
    },
    {
        component: AdvancedStep,
        label: 'Advanced Settings',
    },
];

const CreateGroupLayout = () => {
    useBreadcrumbPage({
        items: [
            {
                activeHref: '/groups',
                href: '/groups',
                label: 'Groups',
            },
            {
                activeHref: '/groups/create',
                href: '/groups/create',
                label: 'New Group',
            },
        ],
    });

    const [, setLocation] = useLocation();
    const { platforms: _ } = usePlatforms();
    const [currentStep, setCurrentStep] = useState(0);
    const [showSuccess] = useState(false);
    const [object, setObject] = useState<CreateGroupObject>({
        name: '',
        fallbackAvailable: false,
        fallback: false,
        staticService: false,
        maxMemory: 0,
        minMemory: 0,
        maxOnlineServices: 0,
        minOnlineServices: 0,
        templates: ['EVERY', 'EVERY_SERVER'],
    });

    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (stepRefs.current[currentStep] && currentStep > 0) {
            stepRefs.current[currentStep]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentStep]);

    function onNext(toStep: number) {
        if (toStep === currentStep || toStep < 0 || toStep > steps.length - 1) return;

        if (currentStep === steps.length - 1) {
            handleCreateGroup();
            return;
        }

        setCurrentStep(toStep);
    }

    const handleCreateGroup = async () => {

        try {
            const groupData: GroupCreateModel = {
                name: object.name,
                minMemory: object.minMemory || 0,
                maxMemory: object.maxMemory || 0,
                minOnlineService: object.minOnlineServices || 0,
                maxOnlineService: object.maxOnlineServices || 0,
                platform: {
                    name: object.platform || '',
                    version: object.version || ''
                },
                percentageToStartNewService: Number(object.percentageToStart || 0),
                information: {
                    createdAt: Date.now()
                },
                templates: object.templates || [],
                properties: Object.fromEntries(
                    Object.entries({
                        fallback: object.fallback,
                        staticService: object.staticService
                    }).filter(([_, value]) => value === true)
                )
            };

            if (!groupData.name.trim()) {
                throw new Error('Group name is required');
            }

            if (!groupData.platform.name || !groupData.platform.version) {
                throw new Error('Platform and version must be selected');
            }

            if (groupData.minMemory <= 0 || groupData.maxMemory <= 0) {
                throw new Error('Memory values must be greater than 0');
            }

            if (groupData.minMemory > groupData.maxMemory) {
                throw new Error('Minimum memory cannot be greater than maximum memory');
            }

            if (groupData.percentageToStartNewService < 0 || groupData.percentageToStartNewService > 100) {
                throw new Error('Percentage must be between 0 and 100');
            }

            await groupApi.createGroup(groupData);
            toast.success('Group Created Successfully!', {
                description: `${object.name} has been created and is now ready to use.`,
                duration: 5000,
                icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                action: {
                    label: 'View Groups',
                    onClick: () => setLocation('/groups'),
                },
            });

            setTimeout(() => {
                setLocation('/groups');
            }, 3000);

        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
            toast.error('Group Creation Failed', {
                description: errorMessage,
                duration: 5000,
            });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const stepVariants = {
        enter: {
            opacity: 0,
            scale: 0.95,
            y: 20
        },
        center: {
            zIndex: 1,
            opacity: 1,
            scale: 1,
            y: 0
        },
        exit: {
            zIndex: 0,
            opacity: 0,
            scale: 0.95,
            y: -20
        }
    };

    const previewVariants = {
        hidden: { opacity: 0, x: -50, scale: 0.9 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.3
            }
        }
    };

    const successVariants = {
        hidden: { opacity: 0, scale: 0.5, rotate: -180 },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                duration: 0.8
            }
        }
    };

    if (showSuccess) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={successVariants}
                    className="text-center space-y-6 p-12"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: 0.2
                        }}
                        className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border-4 border-green-500/20"
                    >
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl font-bold text-foreground">
                            Group Created Successfully!
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-md mx-auto">
                            Your group <span className="font-semibold text-foreground">{object.name}</span> has been created and is now ready to use.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-sm text-muted-foreground"
                    >
                        Redirecting to Groups page in a few seconds...
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="flex flex-col flex-1 relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex flex-col max-w-6xl w-full mx-auto p-8">
                <motion.div
                    variants={itemVariants}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        onClick={() => setLocation('/groups')}
                        className="flex flex-row space-x-2 items-center hover:bg-muted px-2 py-1 rounded-lg transition-all mb-4"
                    >
                        <ArrowLeft className="size-4" />
                        <span className="text-sm">Back</span>
                    </Button>
                    <h1 className="text-3xl font-semibold text-foreground">Let's start...</h1>
                    <p className="text-muted-foreground text-sm">
                        Please follow the following steps to create a new group.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row justify-between space-x-8 pt-14">
                    <div className="flex flex-col w-full lg:w-64 space-y-8 lg:sticky top-4 self-center lg:self-start">
                        <motion.div
                            variants={previewVariants}
                            className="rounded-xl p-5 bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-lg backdrop-blur-sm space-y-4"
                        >
                            <motion.div
                                variants={itemVariants}
                                className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                            >
                                <span className="text-sm font-semibold text-muted-foreground">Name:</span>
                                <span className="text-sm font-bold text-foreground">
                  {object && object.name.trim() === '' ? 'New Group' : object?.name}
                </span>
                            </motion.div>

                            <AnimatePresence>
                                {object.platform && (
                                    <motion.div
                                        key="platform"
                                        initial={{ opacity: 0, x: -20, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: "auto" }}
                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                        className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg overflow-hidden"
                                    >
                                        <span className="text-sm font-semibold text-muted-foreground">Platform:</span>
                                        <div className="flex items-center space-x-2">
                                            <img
                                                src={getPlatformImage(object.platform)}
                                                className="size-5 object-contain"
                                                alt={`${object.platform} Icon`}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder.png';
                                                }}
                                            />
                                            <span className="text-sm font-semibold text-foreground capitalize">{object.platform}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {object.version && (
                                    <motion.div
                                        key="version"
                                        initial={{ opacity: 0, x: -20, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: "auto" }}
                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
                                        className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg overflow-hidden"
                                    >
                                        <span className="text-sm font-semibold text-muted-foreground">Version:</span>
                                        <span className="text-sm font-semibold text-foreground">{object.version}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {object.maxMemory > 0 && (
                                    <motion.div
                                        key="memory"
                                        initial={{ opacity: 0, x: -20, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: "auto" }}
                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
                                        className="space-y-2 p-3 bg-muted/30 rounded-lg overflow-hidden"
                                    >
                                        <span className="text-sm font-semibold text-muted-foreground">Memory:</span>
                                        <div className="space-y-1 ml-3">
                                            {object.minMemory && object.minMemory > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <span className="text-xs text-muted-foreground">Min:</span>
                                                    <span className="text-sm font-semibold text-foreground">{object.minMemory} MB</span>
                                                </motion.div>
                                            )}
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="flex items-center space-x-2"
                                            >
                                                <span className="text-xs text-muted-foreground">Max:</span>
                                                <span className="text-sm font-semibold text-foreground">{object.maxMemory} MB</span>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {(object.percentageToStart && object.percentageToStart > 0 || object.minOnlineServices > 0 || object.maxOnlineServices > 0 || object.staticService || object.fallback) && (
                                    <motion.div
                                        key="advanced"
                                        initial={{ opacity: 0, x: -20, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: "auto" }}
                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
                                        className="pt-3 border-t border-border/30 overflow-hidden"
                                    >
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Advanced:</span>
                                        <div className="space-y-2 mt-3">
                                            {object.percentageToStart && object.percentageToStart > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -15 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                                                >
                                                    <span className="text-sm font-semibold text-muted-foreground">Auto-start:</span>
                                                    <span className="text-sm font-semibold text-foreground">{object.percentageToStart}%</span>
                                                </motion.div>
                                            )}
                                            {(object.minOnlineServices > 0 || object.maxOnlineServices > 0) && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -15 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                                                >
                                                    <span className="text-sm font-semibold text-muted-foreground">Services:</span>
                                                    <span className="text-sm font-semibold text-foreground">
                            Min: {object.minOnlineServices > 0 ? object.minOnlineServices : 0} | Max: {object.maxOnlineServices > 0 ? object.maxOnlineServices : 0}
                          </span>
                                                </motion.div>
                                            )}
                                            {object.staticService && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -15 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6 }}
                                                    className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                                                >
                                                    <span className="text-sm font-semibold text-muted-foreground">Static Service:</span>
                                                    <span className="text-sm font-semibold text-foreground">Yes</span>
                                                </motion.div>
                                            )}
                                            {object.fallback && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -15 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.7 }}
                                                    className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                                                >
                                                    <span className="text-sm font-semibold text-muted-foreground">Fallback Group:</span>
                                                    <span className="text-sm font-semibold text-foreground">Yes</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <ProgressStep
                                steps={steps.map((step, index) => ({
                                    label: step.label,
                                    completed: index < currentStep,
                                    current: index === currentStep
                                }))}
                                onStepClick={(stepIndex) => stepIndex <= currentStep && onNext(stepIndex)}
                            />
                        </motion.div>
                    </div>

                    <div className="flex-1 flex flex-col space-y-8 pb-32 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 35
                                }}
                                className="w-full"
                                ref={(el) => (stepRefs.current[currentStep] = el)}
                            >
                                {(() => {
                                    const StepComponent = steps[currentStep].component;
                                    return (
                                        <StepComponent
                                            object={object}
                                            setObject={setObject}
                                            disabled={false}
                                            onNext={() => onNext(currentStep + 1)}
                                            isOnFocus={true}
                                            onCreateGroup={handleCreateGroup}
                                        />
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CreateGroupLayout;
