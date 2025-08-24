import {useState, useEffect, useCallback} from 'react';
import {PlatformApiClient} from '@/lib/api/clients/platform/PlatformApiClient.ts';
import {PlatformWithVersions} from '@/lib/api/types';

export const usePlatforms = () => {
    const [platforms, setPlatforms] = useState<PlatformWithVersions[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const platformApiClient = new PlatformApiClient();

    const fetchPlatforms = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const platformsData = await platformApiClient.getPlatforms();
            setPlatforms(platformsData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch platforms';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getPlatformByName = useCallback(async (name: string) => {
        try {
            return await platformApiClient.getPlatformByName(name);
        } catch (err) {
            return null;
        }
    }, []);

    const getPlatformNames = useCallback(async () => {
        try {
            return await platformApiClient.getPlatformNames();
        } catch (err) {
            return [];
        }
    }, []);

    const getPlatformsByType = useCallback(async (type: 'SERVER' | 'PROXY') => {
        try {
            return await platformApiClient.getPlatformsByType(type);
        } catch (err) {
            return [];
        }
    }, []);

    useEffect(() => {
        fetchPlatforms();
    }, [fetchPlatforms]);

    return {
        platforms,
        loading,
        error,
        refetch: fetchPlatforms,
        getPlatformByName,
        getPlatformNames,
        getPlatformsByType
    };
};
