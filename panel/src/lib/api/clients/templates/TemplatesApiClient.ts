import {
    API_ENDPOINTS,
    ApiResponse,
    BaseApiClient,
    CreateTemplateRequest,
    EditTemplateRequest,
    Template
} from "@/lib/api";


export class TemplatesApiClient extends BaseApiClient {


    async getTemplates(): Promise<ApiResponse<Template[]>> {
        try {
            const url = this.buildUrl(API_ENDPOINTS.TEMPLATES.LIST);
            const response = await this.client.get(url, {
                timeout: 10000,
                withCredentials: true,
                validateStatus: (status) => status >= 200 && status < 300
            });

            return {
                success: true,
                data: response.data as Template[],
                message: 'Templates fetched successfully'
            };
        } catch (error) {
            return {
                success: false,
                data: [],
                message: 'Failed to fetch templates'
            }
        }
    }

    async createTemplate(tempplateData: CreateTemplateRequest): Promise<ApiResponse<Template>> {
        try {
            const url = this.buildUrl(API_ENDPOINTS.TEMPLATES.CREATE);
            const response = await this.client.post(url, tempplateData, {
                timeout: 10000,
                withCredentials: true,
                validateStatus: (status) => status >= 200 && status < 300
            });

            return {
                success: true,
                data: response.data as Template,
                message: 'Template created successfully'
            };
        } catch (error) {
            return {
                success: false,
                data: undefined,
                message: 'Failed to create template'
            }
        }
    }

    async deleteTemplate(templateName: string): Promise<ApiResponse<boolean>> {
        try {
            const url = this.buildUrl(API_ENDPOINTS.TEMPLATES.DELETE(templateName));
            const response = await this.client.delete(url, {
                timeout: 10000,
                withCredentials: true,
                validateStatus: (status) => status >= 200 && status < 300
            });

            return {
                success: true,
                data: true,
                message: 'Template deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                data: false,
                message: 'Failed to delete template'
            }
        }
    }

    async editTemplate(templateName: string, templateData: EditTemplateRequest): Promise<ApiResponse<Template>> {
        try {
            const url = this.buildUrl(API_ENDPOINTS.TEMPLATES.EDIT(templateName));
            const response = await this.client.patch(url, templateData, {
                timeout: 10000,
                withCredentials: true,
                validateStatus: (status) => status >= 200 && status < 300
            });

            return {
                success: true,
                data: { name: templateData.name, size: 0.0 } as Template,
                message: 'Template edited successfully'
            };
        } catch (error) {
            console.error('Failed to edit template:', error);
            return {
                success: false,
                data: undefined,
                message: 'Failed to edit template'
            };
        }
    }

}

export const templatesApi = new TemplatesApiClient();
