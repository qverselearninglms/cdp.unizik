'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useProgramStore, Category } from '@/store/useProgramStore';
import { APP_CONFIG } from '@/config';

interface PaginatedCategories {
    current_page: number;
    data: Category[];
    last_page: number;
    total: number;
}

async function fetchCategories(): Promise<Category[]> {
    const res = await fetch(
        `${APP_CONFIG.apiUrl}/odl/categories`,
        { next: { revalidate: 3600 } } // ISR-friendly cache
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    }

    const json: PaginatedCategories = await res.json();
    return json.data;
}

export function useProgramCategories() {
    const setCategories = useProgramStore((s) => s.setCategories);

    const query = useQuery<Category[], Error>({
        queryKey: ['program-categories'],
        queryFn: fetchCategories,
        staleTime: 1000 * 60 * 60, // 1 hour — categories rarely change
        retry: 2,
    });

    // Hydrate Zustand store when data arrives
    useEffect(() => {
        if (query.data) {
            setCategories(query.data);
        }
    }, [query.data, setCategories]);

    return query;
}