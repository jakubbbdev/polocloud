import {API_ENDPOINTS, BackendPaginatedResponse, BaseApiClient, Player} from "@/lib/api";


interface PaginationParams {
    page?: number;
    size?: number;
}

export class PlayerApiClient extends BaseApiClient {
    async getPlayers(params: PaginationParams = {}) {
        try {
            const url = this.buildUrl(API_ENDPOINTS.PLAYERS.LIST);
            const queryParams = new URLSearchParams();

            if (params?.page !== undefined) {
                queryParams.append('page', params.page.toString());
            }
            if (params?.size !== undefined) {
                queryParams.append('size', params.size.toString());
            }

            const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;

            
            const response = await this.client.get(
                fullUrl,
                { timeout: 10000, withCredentials: true, validateStatus: (status) => status >= 200 && status < 300 }
            );
            
            return { success: true, data: response.data as BackendPaginatedResponse<Player>, message: 'Players fetched successfully' };
        } catch (error) {
            
            return { success: false, data: { page: 1, size: 10, total: 0, totalPages: 0, data: [] } as BackendPaginatedResponse<Player>, message: 'Failed to fetch players' };
        }
    }

    async getPlayer(playerName: string) {
        try {
            
            const response = await this.client.get(
                this.buildUrl(API_ENDPOINTS.PLAYERS.GET(playerName)),
                { timeout: 10000, withCredentials: true, validateStatus: (status) => status >= 200 && status < 300 }
            );
            
            return { success: true, data: response.data as Player, message: 'Player fetched successfully' };
        } catch (error) {
            
            return { success: false, data: null, message: 'Failed to fetch player' };
        }
    }
}

export const playerApi = new PlayerApiClient();
