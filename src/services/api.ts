import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Generic API service for making HTTP requests
 */
class ApiService {
  private client: AxiosInstance;
  
  constructor(baseURL: string = API_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Add custom headers like authorization tokens if needed
  public setAuthHeader(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove auth header when logging out
  public clearAuthHeader(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Generic GET request
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  // Generic POST request
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  // Generic PUT request
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Example usage:
// import apiService from '../services/api';
//
// // Get all transactions
// const getTransactions = async () => {
//   try {
//     const transactions = await apiService.get<Transaction[]>('/transactions');
//     return transactions;
//   } catch (error) {
//     console.error('Error fetching transactions:', error);
//     throw error;
//   }
// };
//
// // Create a new transaction
// const createTransaction = async (transaction: Transaction) => {
//   try {
//     return await apiService.post<Transaction>('/transactions', transaction);
//   } catch (error) {
//     console.error('Error creating transaction:', error);
//     throw error;
//   }
// };
