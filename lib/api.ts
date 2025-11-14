// API service layer for frontend-backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }

  // Chemical API methods
  async getChemicals(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    return this.request(`/chemicals?${searchParams.toString()}`);
  }

  async getChemical(id: string) {
    return this.request(`/chemicals/${id}`);
  }

  async createChemical(data: any) {
    return this.request('/chemicals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChemical(id: string, data: any) {
    return this.request(`/chemicals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChemical(id: string) {
    return this.request(`/chemicals/${id}`, {
      method: 'DELETE',
    });
  }

  // Supplier API methods
  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    return this.request(`/suppliers?${searchParams.toString()}`);
  }

  async getSupplier(id: string) {
    return this.request(`/suppliers/${id}`);
  }

  async createSupplier(data: any) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplier(id: string, data: any) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  // Purchase Order API methods
  async getPurchaseOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    supplier?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.supplier) searchParams.append('supplier', params.supplier);

    return this.request(`/purchase-orders?${searchParams.toString()}`);
  }

  async createPurchaseOrder(data: any) {
    return this.request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Alert API methods
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    type?: string;
    severity?: string;
    isRead?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());

    return this.request(`/alerts?${searchParams.toString()}`);
  }

  async markAlertAsRead(id: string) {
    return this.request(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isRead: true }),
    });
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }
}

export const apiService = new ApiService();
export default apiService;
