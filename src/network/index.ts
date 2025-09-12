import { get_req, post_req, put_req } from "./network";

/**
 * Uploads training data to the server
 * @param path API endpoint path
 * @param data Data to be uploaded
 * @param headers Optional request headers
 * @returns Promise with the server response
 */
export const UploadTrain = async <T = any, D = any>(
  path: string,
  data: D,
  headers: Record<string, string> = {}
): Promise<T> => {
  const response = await post_req<T, D>(path, data, headers);
  return response.data;
};

/**
 * Sends a forgot password request
 * @param path API endpoint path
 * @param data Request data
 * @param headers Optional request headers
 * @returns Promise with the server response
 */
export const forgotPassword = async <T = any, D = any>(
  path: string,
  data: D,
  headers: Record<string, string> = {}
): Promise<T> => {
  const response = await post_req<T, D>(path, data, headers);
  return response.data;
};

/**
 * Changes the user's password
 * @param path API endpoint path
 * @param data New password data
 * @param headers Optional request headers
 * @returns Promise with the server response
 */
export const changePassword = async <T = any, D = any>(
  path: string,
  data: D,
  headers: Record<string, string> = {}
): Promise<T> => {
  const response = await put_req<T, D>(path, data, headers);
  return response.data;
};

/**
 * Fetches knowledge base data
 * @param path API endpoint path
 * @param headers Optional request headers
 * @returns Promise with the knowledge base data
 */
export const get_KBData = async <T = any>(
  path: string,
  headers: Record<string, string> = {}
): Promise<T> => {
  const response = await get_req<T>(path, headers);
  return response.data;
};
