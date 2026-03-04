// API client for Go backend
// All requests go through here — no Next.js API routes needed

const API_BASE = process.env.NEXT_PUBLIC_GO_BACKEND_URL || "http://localhost:8080";

type RequestOptions = {
    method?: string;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
};

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

export async function api<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = "GET", body, token, headers = {} } = options;

    const config: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };

    if (body && method !== "GET") {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            errorData?.message || `API Error: ${response.status}`,
            response.status,
            errorData
        );
    }

    return response.json();
}

// Convenience methods
export const apiClient = {
    get: <T>(endpoint: string, token?: string | null) =>
        api<T>(endpoint, { token }),

    post: <T>(endpoint: string, body: unknown, token?: string | null) =>
        api<T>(endpoint, { method: "POST", body, token }),

    put: <T>(endpoint: string, body: unknown, token?: string | null) =>
        api<T>(endpoint, { method: "PUT", body, token }),

    delete: <T>(endpoint: string, token?: string | null) =>
        api<T>(endpoint, { method: "DELETE", token }),

    // For file uploads (multipart/form-data)
    upload: async <T>(
        endpoint: string,
        formData: FormData,
        token?: string | null
    ): Promise<T> => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData, // Don't set Content-Type — browser adds boundary
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new ApiError(
                errorData?.message || `Upload Error: ${response.status}`,
                response.status,
                errorData
            );
        }

        return response.json();
    },
};
