import {BaseApiClient} from '../../base/BaseApiClient.ts';
import {API_ENDPOINTS, Platform, PlatformVersion, PlatformWithVersions} from '../../types.ts';

export class PlatformApiClient extends BaseApiClient {

    async getPlatforms(): Promise<PlatformWithVersions[]> {
        try {
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.PLATFORM.LIST),
                {
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            if (response.status === 200) {
                const data = response.data;

                const platforms: PlatformWithVersions[] = [];

                const platformGroups: { versions: any[], platform: any }[] = [];

                for (let i = 0; i < data.length; i++) {
                    const item = data[i];

                    if (Array.isArray(item)) {
                        if (i + 1 < data.length) {
                            const nextItem = data[i + 1];

                            if (typeof nextItem === 'object' && nextItem.name) {
                                platformGroups.push({
                                    versions: item,
                                    platform: nextItem
                                });
                                i++;
                            }
                        }
                    }
                }

                platformGroups.forEach((group) => {
                    const versions: PlatformVersion[] = group.versions.map((v: any) => ({
                        version: v.version
                    }));

                    const platform: Platform = {
                        name: group.platform.name,
                        type: group.platform.type
                    };

                    const platformWithVersions = {
                        platform,
                        versions
                    };

                    platforms.push(platformWithVersions);
                });
                return platforms;
            }

            throw new Error(`Failed to fetch platforms: ${response.status}`);
        } catch (error) {
            throw error;
        }
    }


    async getPlatformByName(name: string): Promise<PlatformWithVersions | null> {
        try {
            const platforms = await this.getPlatforms();
            return platforms.find((p: PlatformWithVersions) => p.platform.name === name) || null;
        } catch (error) {
            return null;
        }
    }

    async getPlatformNames(): Promise<string[]> {
        try {
            const platforms = await this.getPlatforms();
            return platforms.map((p: PlatformWithVersions) => p.platform.name);
        } catch (error) {
            return [];
        }
    }

    async getPlatformsByType(type: 'SERVER' | 'PROXY'): Promise<PlatformWithVersions[]> {
        try {
            const platforms = await this.getPlatforms();
            return platforms.filter((p: PlatformWithVersions) => p.platform.type === type);
        } catch (error) {
            return [];
        }
    }
}

export const platformApi = new PlatformApiClient();
