import {useOnboarding} from '@/hooks/use-onboarding';
import LoadingSpinner from '@/components/system/LoadingSpinner';
import {useLocation} from 'wouter';
import {useEffect} from 'react';

interface OnboardingGuardProps {
    children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({children}) => {
    const {isOnboardingCompleted, isLoading} = useOnboarding();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!isLoading && !isOnboardingCompleted) {
            setLocation('/onboarding');
        }
    }, [isOnboardingCompleted, isLoading, setLocation]);

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <LoadingSpinner/>
            </div>
        );
    }

    if (!isOnboardingCompleted) {
        return null;
    }

    return <>{children}</>;
};
