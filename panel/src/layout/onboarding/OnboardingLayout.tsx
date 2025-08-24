import CurrentProgressTrack from '@/components/system/step/CurrentProgressTrack';
import { BackendConnectStep } from './steps/BackendConnectStep';
import { AdminAccountStep } from './steps/AdminAccountStep';
import { OverviewStep } from './steps/OverviewStep';
import { SetupStepProps } from '@/lib/steps/SetupStepProps';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

interface OnboardingStep {
    component: React.FC<SetupStepProps<any>>;
    label: string;
    description: string;
}

export interface OnboardingData {
    backendUrl: string;
    username: string;
    password: string;
    confirmPassword: string;
}

const steps: OnboardingStep[] = [
    {
        component: BackendConnectStep,
        label: 'Backend Connect',
        description: 'Connect to your PoloCloud backend',
    },
    {
        component: AdminAccountStep,
        label: 'Admin Account',
        description: 'Create your administrator account',
    },
    {
        component: OverviewStep,
        label: 'Overview',
        description: 'Review and complete setup',
    },
];

const OnboardingLayout = () => {
    const [, setLocation] = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({
        backendUrl: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const { markOnboardingCompleted } = useOnboarding();

    const handleFinish = async () => {
        try {
            const authResult = await authApi.login(onboardingData.username, onboardingData.password);

            if (authResult.success) {
                markOnboardingCompleted();
                localStorage.setItem('backendUrl', onboardingData.backendUrl);
                setLocation('/');
            } else {
                toast.error('Failed to login after setup. Please try again.');
            }
        } catch (error) {
            toast.error('Failed to login after setup. Please try again.');
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getCurrentStepComponent = () => {
        const step = steps[currentStep];
        return (
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
                <step.component
                    object={onboardingData}
                    setObject={setOnboardingData}
                    disabled={false}
                    onNext={handleNext}
                    isOnFocus={true}
                />
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="flex flex-col max-w-6xl w-full mx-auto p-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.div
                        className="flex justify-center mb-8"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <div className="relative">
                            <motion.div
                                className="size-20 rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-card via-card to-card/80 border border-border/50 backdrop-blur-sm"
                                whileHover={{
                                    scale: 1.05,
                                    rotate: [0, -5, 5, 0],
                                    transition: { duration: 0.6 }
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <img
                                    src="/logo.png"
                                    alt="PoloCloud Logo"
                                    className="size-12 object-contain"
                                />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.h1
                        className="text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Welcome to PoloCloud!
                    </motion.h1>

                    <motion.p
                        className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        Let's set up your cloud instance with our streamlined setup process.
                        Follow the steps below to get started in minutes.
                    </motion.p>
                </motion.div>

                <div className="flex flex-col lg:flex-row justify-between space-x-8">
                    <motion.div
                        className="flex flex-col w-full lg:w-96 space-y-6 lg:sticky top-4 self-center lg:self-start"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <motion.div
                            className="rounded-2xl p-6 bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-xl backdrop-blur-sm"
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <img
                                        src="/logo.png"
                                        alt="PoloCloud Logo"
                                        className="size-5 object-contain"
                                    />
                                </div>
                                <p className="font-semibold text-foreground">Setup Progress</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Backend URL:</span>
                                    <span className="text-sm font-medium text-foreground max-w-32 truncate">
                                        {onboardingData.backendUrl || 'Not set'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Admin Account:</span>
                                    <span className="text-sm font-medium text-foreground max-w-32 truncate">
                                        {onboardingData.username || 'Not created'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="rounded-2xl p-6 bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-xl backdrop-blur-sm"
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                                Setup Steps
                            </h3>
                            <CurrentProgressTrack
                                currentStep={currentStep}
                                labels={steps.map((step) => step.label)}
                                onProgressClick={(step) => step <= currentStep && setCurrentStep(step)}
                            />
                        </motion.div>

                        <motion.div
                            className="rounded-2xl p-6 bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-xl backdrop-blur-sm"
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                                Navigation
                            </h3>
                            <div className="flex space-x-3">
                                <motion.button
                                    onClick={handlePrevious}
                                    disabled={currentStep === 0}
                                    className="flex-1 px-4 py-3 text-sm font-medium bg-secondary/80 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <ChevronLeft className="size-4" />
                                    <span>Previous</span>
                                </motion.button>
                                <motion.button
                                    onClick={handleNext}
                                    disabled={currentStep === steps.length - 1}
                                    className="flex-1 px-4 py-3 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-primary-foreground shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span>Next</span>
                                    {currentStep === steps.length - 1 ? <Check className="size-4" /> : <ChevronRight className="size-4" />}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="flex-1 flex flex-col"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                    >
                        <motion.div
                            className="mb-8"
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground">
                                        {steps[currentStep].label}
                                    </h2>
                                    <p className="text-muted-foreground text-lg">
                                        {steps[currentStep].description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Step {currentStep + 1} of {steps.length}</span>
                                <div className="size-1 bg-muted-foreground rounded-full"></div>
                                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
                            </div>
                        </motion.div>

                        <div className="min-h-[500px]">
                            <AnimatePresence mode="wait">
                                {getCurrentStepComponent()}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;
