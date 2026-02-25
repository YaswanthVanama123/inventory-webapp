import api from './api';

const employeeDataService = {
  // Get my work data (filtered by my truck number)
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

  // Get my statistics
  async getMyStatistics(startDate, endDate) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await api.get(`/employee-data/my-statistics?${queryParams.toString()}`);
    return response;
  },

  // Get my recent activity
  async getMyRecentActivity(limit = 10) {
    const response = await api.get(`/employee-data/my-activity?limit=${limit}`);
    return response;
  },

  // Get my performance metrics
  async getMyPerformance(startDate, endDate) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await api.get(`/employee-data/my-performance?${queryParams.toString()}`);
    return response;
  },

  // Admin: Get employee data by truck number
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

  // Admin: Get all truck assignments
  async getAllTruckAssignments() {
    const response = await api.get('/employee-data/truck-assignments');
    return response;
  }
};

export default employeeDataService;
