import { getSupabaseServerClient } from "@/utils/supabase/server";

/**
 * Get authenticated user from server context
 * Uses official Supabase SSR pattern with createServerClient
 */
export async function getUser() {
  const supabase = getSupabaseServerClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

/**
 * Get authenticated Supabase client with user context
 * Official pattern for protected API routes
 * Returns both authenticated client and user, or throws if not authenticated
 */
export async function getAuthenticatedSupabase() {
  const supabase = getSupabaseServerClient();

  // Check if we have a user (following official Supabase pattern)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("not_authenticated");
  }

  return { supabase, user };
}
