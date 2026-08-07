import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock @supabase/supabase-js before any imports
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn((url, key) => ({ url, key })),
}));

describe("Supabase Client Initialization", () => {
  let originalEnv: Record<string, string>;

  beforeEach(() => {
    vi.resetModules();
    // Save original env values
    originalEnv = { ...import.meta.env };
  });

  afterEach(() => {
    // Restore original env values
    Object.keys(import.meta.env).forEach((key) => {
      delete import.meta.env[key];
    });
    Object.assign(import.meta.env, originalEnv);
  });

  it("should initialize the Supabase client using environment variables", async () => {
    import.meta.env.VITE_SUPABASE_URL = "https://env-url.supabase.co";
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = "env-key";

    const { supabase } = await import("./client");
    const { createClient } = await import("@supabase/supabase-js");

    expect(createClient).toHaveBeenCalledWith("https://env-url.supabase.co", "env-key");
    expect(supabase).toBeDefined();
  });

  it("should fall back to empty string if environment variables are not provided", async () => {
    import.meta.env.VITE_SUPABASE_URL = "";
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = "";

    const { supabase } = await import("./client");
    const { createClient } = await import("@supabase/supabase-js");

    expect(createClient).toHaveBeenCalledWith("", "");
    expect(supabase).toBeDefined();
  });
});
