// API service layer for frontend-backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

  async getPurchaseOrder(id: string) {
    return this.request(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: any) {
    return this.request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseOrder(id: string, data: any) {
    return this.request(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePurchaseOrder(id: string) {
    return this.request(`/purchase-orders/${id}`, {
      method: 'DELETE',
    });
  }

  async autoUpdatePOStatus() {
    return this.request('/purchase-orders/auto-update-status', {
      method: 'POST',
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

  async cleanupOrphanedAlerts() {
    return this.request('/alerts/cleanup', {
      method: 'POST',
    });
  }

  async deleteAllAlerts() {
    return this.request('/alerts/cleanup', {
      method: 'DELETE',
    });
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Activity Log API methods
  async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    severity?: string;
    user?: string;
    dateRange?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.user) searchParams.append('user', params.user);
    if (params?.dateRange) searchParams.append('dateRange', params.dateRange);

    return this.request(`/activity-logs?${searchParams.toString()}`);
  }

  async createActivityLog(data: any) {
    return this.request('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
