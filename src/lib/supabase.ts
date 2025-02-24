import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 10000; // 10 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class RetryableSupabaseClient {
  private client;
  private retryCount: number = 0;

  constructor() {
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-client-info': 'supabase-js/2.39.7',
        },
      },
      db: {
        schema: 'public',
      },
    });

    // Initialize properties after client is created
    this.initializeProperties();
  }

  private async retryOperation<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Add timeout to the operation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Operation timed out after ${TIMEOUT}ms`)), TIMEOUT);
        });

        const result = await Promise.race([
          operation(),
          timeoutPromise
        ]) as T;

        // Reset retry count on success
        this.retryCount = 0;
        return result;
      } catch (error: any) {
        lastError = error;
        this.retryCount++;
        
        console.warn(`${context} - Attempt ${attempt + 1} failed:`, {
          error: error.message || error,
          context,
          attempt: attempt + 1,
          timestamp: new Date().toISOString()
        });

        if (this.retryCount >= MAX_RETRIES) {
          console.error(`${context} - Max retries reached:`, {
            error: error.message || error,
            context,
            maxRetries: MAX_RETRIES,
            timestamp: new Date().toISOString()
          });
          break;
        }

        await sleep(RETRY_DELAY * Math.pow(2, attempt)); // Exponential backoff
      }
    }
    
    throw lastError;
  }

  private initializeProperties() {
    // Initialize auth
    this.auth = {
      ...this.client.auth,
      signInWithPassword: (credentials: { email: string; password: string }) =>
        this.retryOperation(
          () => this.client.auth.signInWithPassword(credentials),
          'Auth:SignIn'
        ),
      signUp: (credentials: { email: string; password: string; options?: any }) =>
        this.retryOperation(
          () => this.client.auth.signUp(credentials),
          'Auth:SignUp'
        ),
      signOut: () =>
        this.retryOperation(
          () => this.client.auth.signOut(),
          'Auth:SignOut'
        ),
      getSession: () =>
        this.retryOperation(
          () => this.client.auth.getSession(),
          'Auth:GetSession'
        ),
      onAuthStateChange: this.client.auth.onAuthStateChange.bind(this.client.auth),
    };

    // Initialize from
    this.from = (table: string) => ({
      ...this.client.from(table),
      select: (query?: string) =>
        this.retryOperation(
          () => this.client.from(table).select(query),
          `DB:Select:${table}`
        ),
      insert: (values: any) =>
        this.retryOperation(
          () => this.client.from(table).insert(values),
          `DB:Insert:${table}`
        ),
      update: (values: any) =>
        this.retryOperation(
          () => this.client.from(table).update(values),
          `DB:Update:${table}`
        ),
      delete: () =>
        this.retryOperation(
          () => this.client.from(table).delete(),
          `DB:Delete:${table}`
        ),
    });

    // Initialize storage
    this.storage = {
      ...this.client.storage,
      from: (bucket: string) => ({
        ...this.client.storage.from(bucket),
        upload: (path: string, file: File) =>
          this.retryOperation(
            () => this.client.storage.from(bucket).upload(path, file),
            `Storage:Upload:${bucket}`
          ),
        getPublicUrl: (path: string) =>
          this.retryOperation(
            () => this.client.storage.from(bucket).getPublicUrl(path),
            `Storage:GetPublicUrl:${bucket}`
          ),
      }),
    };
  }

  auth: any;
  from: any;
  storage: any;
}

export const supabase = new RetryableSupabaseClient();