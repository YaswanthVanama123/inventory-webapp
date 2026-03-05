import api from './api';

const employeeDataService = {
  
  async getMyWorkData(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.invoiceType) queryParams.append('invoiceType', params.invoiceType);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/employee-data/my-work?${queryParams.toString()}`);
    return response;
  },

  
  async getMyStatistics(startDate, endDate) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await api.get(`/employee-data/my-statistics?${queryParams.toString()}`);
    return response;
  },

  
  async getMyRecentActivity(limit = 10) {
    const response = await api.get(`/employee-data/my-activity?limit=${limit}`);
    return response;
  },

  
  async getMyPerformance(startDate, endDate) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await api.get(`/employee-data/my-performance?${queryParams.toString()}`);
    return response;
  },

  
  async getEmployeeDataByTruckNumber(truckNumber, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.invoiceType) queryParams.append('invoiceType', params.invoiceType);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(`/employee-data/by-truck/${truckNumber}?${queryParams.toString()}`);
    return response;
  },


  async getAllTruckAssignments() {
    const response = await api.get('/employee-data/truck-assignments');
    return response;
  },

  // Combined dashboard endpoint - gets statistics, activity, and performance in one call
  async getMyCombinedDashboard(startDate, endDate, limit = 10) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (limit) queryParams.append('limit', limit);

    const response = await api.get(`/employee-data/my-dashboard?${queryParams.toString()}`);
    return response;
  }
};

export default employeeDataService;
