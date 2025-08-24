import {useEffect, useState} from 'react';

export const useOnboarding = () => {
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkOnboardingStatus = () => {
            try {
                const status = localStorage.getItem('onboardingCompleted');
                const completed = status === 'true';
                setIsOnboardingCompleted(completed);
            } catch (error) {

                setIsOnboardingCompleted(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkOnboardingStatus();
    }, []);

    const markOnboardingCompleted = () => {
        try {
            localStorage.setItem('onboardingCompleted', 'true');
            setIsOnboardingCompleted(true);
        } catch (error) {

        }
    };

    const resetOnboarding = () => {
        try {
            localStorage.removeItem('onboardingCompleted');
            localStorage.removeItem('backendUrl');
            setIsOnboardingCompleted(false);
        } catch (error) {

        }
    };

    return {
        isOnboardingCompleted,
        isLoading,
        markOnboardingCompleted,
        resetOnboarding,
    };
};
