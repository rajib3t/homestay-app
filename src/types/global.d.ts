declare global {
    /**
     * Generic paginated response interface
     */
    interface PaginatedResponse<T> {
        data: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }

    /**
     * Standard API response wrapper used by the backend
     */
    interface ApiResponse<T = unknown> {
        success: boolean;
        data: T;
        message?: string;
        error?: string;
        meta?: PaginatedMeta | null;
    }

    /**
     * Paginated meta information returned by the API
     */
    interface PaginatedMeta {
        total?: number;
        page?: number;
        size?: number;
        
    }

    interface RouteSearch {
        page?: string;
        limit?: string;
         sort?: string;
         sort_order?: string;
         filter?: Filter[];
    }
    
    interface SearchParams {
        // Optional array of filters to apply to a search/query
        filter?: Filter[];
    }
    interface Filter {

        search_field?: string;
        search_value?: string | number | boolean | null;
    }
}

export {};
