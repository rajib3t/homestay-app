// Re-export global types as aliases so existing imports keep working.
export type PaginatedResponse<T> = globalThis.PaginatedResponse<T>;
export type ApiResponse<T = unknown> = globalThis.ApiResponse<T>;
export type PaginatedMeta = globalThis.PaginatedMeta;
