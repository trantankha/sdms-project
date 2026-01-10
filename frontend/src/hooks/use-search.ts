import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseSearchProps {
    defaultPage?: number;
    defaultLimit?: number;
    searchParamName?: string;
    pageParamName?: string;
    limitParamName?: string;
}

interface UseSearchReturn {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
    filters: Record<string, string>;
    setFilter: (key: string, value: string | null) => void;
    isPending: boolean;
    getQueryParams: () => Record<string, any>;
}

export function useSearch({
    defaultPage = 1,
    defaultLimit = 10,
    searchParamName = "search",
    pageParamName = "page",
    limitParamName = "limit",
}: UseSearchProps = {}): UseSearchReturn {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Get values directly from URL
    const searchQuery = searchParams.get(searchParamName) || "";
    const page = Number(searchParams.get(pageParamName)) || defaultPage;
    const limit = Number(searchParams.get(limitParamName)) || defaultLimit;

    // Helper to push new params
    const updateParams = useCallback((newParams: URLSearchParams) => {
        startTransition(() => {
            router.replace(`${pathname}?${newParams.toString()}`);
        });
    }, [pathname, router]);

    // Handlers
    const setSearchQuery = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(searchParamName, value);
        } else {
            params.delete(searchParamName);
        }
        params.set(pageParamName, "1"); // Reset directly to page 1
        updateParams(params);
    }, [searchParams, searchParamName, pageParamName, updateParams]);

    const setPage = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(pageParamName, newPage.toString());
        updateParams(params);
    }, [searchParams, pageParamName, updateParams]);

    const setLimit = useCallback((newLimit: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(limitParamName, newLimit.toString());
        params.set(pageParamName, "1");
        updateParams(params);
    }, [searchParams, limitParamName, pageParamName, updateParams]);

    const setFilter = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "ALL") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set(pageParamName, "1");
        updateParams(params);
    }, [searchParams, pageParamName, updateParams]);

    // Get all current filters
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        if (![searchParamName, pageParamName, limitParamName].includes(key)) {
            filters[key] = value;
        }
    });

    const getQueryParams = useCallback(() => {
        return {
            [searchParamName]: searchQuery,
            skip: (page - 1) * limit,
            limit: limit,
            ...filters
        };
    }, [searchQuery, page, limit, filters, searchParamName]);

    return {
        searchQuery,
        setSearchQuery,
        page,
        setPage,
        limit,
        setLimit,
        filters,
        setFilter,
        isPending,
        getQueryParams
    };
}
