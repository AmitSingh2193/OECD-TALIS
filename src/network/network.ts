import axios, { AxiosInstance, InternalAxiosRequestConfig ,AxiosRequestConfig, AxiosResponse, AxiosError, CancelTokenSource } from 'axios';

// Define types for API responses
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
  request?: any;
}

// Create axios client with default config
const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig ) => {
    // Uncomment and modify this when you have StorageManager
    // const authToken = StorageManager.getLocal('authToken', null);
    // if (authToken) {
    //   config.headers = {
    //     ...config.headers,
    //     Authorization: `Bearer ${authToken}`,
    //   };
    // }

    
    if (config.headers && config.headers['Content-Type'] === 'multipart/form-data') {
      // Let axios set the correct Content-Type for FormData
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle errors globally here if needed
    return Promise.reject(error);
  }
);

// Helper function to create cancel token
const createCancelToken = (): CancelTokenSource => {
  return axios.CancelToken.source();
};

// API methods
export const get_req = async <T = any>(
  url: string,
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  const source = createCancelToken();
  try {
    const response = await axiosClient.get<T>(url, {
      headers,
      cancelToken: source.token,
    });
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    }
    throw error;
  }
};

export const post_req = async <T = any, D = any>(
  url: string,
  data: D,
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  // const source = createCancelToken();
  try {
    const response = await axiosClient.post<T>(url, data, {
      headers,
      // cancelToken: source.token,
    });
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    }
    throw error;
  }
};

export const put_req = async <T = any, D = any>(
  url: string,
  data: D,
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  const source = createCancelToken();
  try {
    const response = await axiosClient.put<T>(url, data, {
      headers,
      cancelToken: source.token,
    });
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    }
    throw error;
  }
};

// Header management
export const setRequestHeader = (): void => {
  axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig ) => {
      if (!config.headers) {
        // config.headers = null;
      }
      config.headers['RequestTimestamp'] = new Date().toISOString();
      return config;
    },
    null,
    { synchronous: true }
  );
};

export const setAuthHeader = (authToken: string): void => {
  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
};

export const setImageHeader = (contentType: string): void => {
  axiosClient.defaults.headers.post['Content-Type'] = contentType;
};

// Export axios instance in case it's needed directly
export { axiosClient };

// Export axios types for external use
export type { AxiosResponse, AxiosError, AxiosRequestConfig };
