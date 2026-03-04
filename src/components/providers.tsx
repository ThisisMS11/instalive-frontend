// TanStack Query + Clerk + Sonner providers
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30 * 1000, 
                        retry: 2,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <ClerkProvider>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    theme="dark"
                />
            </QueryClientProvider>
        </ClerkProvider>
    );
}
