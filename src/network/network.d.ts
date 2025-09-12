import { AxiosPromise } from 'axios';

declare module '../../network/network' {
    export const get_req: <T = any>(url: string, headers?: Record<string, string>) => Promise<{ data: T }>;
    export const post_req: <T = any>(
        url: string, 
        data: any, 
        headers?: Record<string, string>
    ) => Promise<{ data: T }>;
    export const put_req: <T = any>(
        url: string, 
        data: any, 
        headers?: Record<string, string>
    ) => Promise<{ data: T }>;
    export const setRequestHeader: () => void;
    export const setAuthHeader: (authToken: string) => void;
    export const setImagHeader: (contentType: string) => void;
}
