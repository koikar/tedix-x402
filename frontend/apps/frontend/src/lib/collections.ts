import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const createBrandsCollection = (queryClient: QueryClient) =>
  createCollection(
    queryCollectionOptions({
      queryKey: ["brands"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("brands")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        return data || [];
      },
      getKey: (item) => item.id,
      queryClient,
      staleTime: 1000 * 30,
    }),
  );

// Collection for brand URLs - Query Collection pattern for fetching data
// export const createBrandUrlsCollection = (queryClient: QueryClient) =>
//   createCollection(
//     queryCollectionOptions({
//       queryKey: ["brand-urls"],
//       queryFn: async () => {
//         const { data, error } = await supabase
//           .from("brand_urls")
//           .select("*")
//           .order("created_at", { ascending: false })
//           .limit(500);

//         if (error) throw error;
//         return data || [];
//       },
//       getKey: (item) => item.id,
//       queryClient,
//       staleTime: 1000 * 30, // 30 seconds - prevent unnecessary refetches
//     }),
//   );
