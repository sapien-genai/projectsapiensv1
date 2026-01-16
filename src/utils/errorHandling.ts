import { PostgrestError } from '@supabase/supabase-js';

export interface AppError {
  message: string;
  code?: string;
  details?: string;
  retryable: boolean;
}

export function getErrorMessage(error: unknown): AppError {
  if (error instanceof Error) {
    const postgrestError = error as PostgrestError;

    if (postgrestError.code) {
      switch (postgrestError.code) {
        case '23505':
          return {
            message: 'This item already exists. Please try a different name.',
            code: postgrestError.code,
            details: postgrestError.message,
            retryable: false,
          };
        case '23503':
          return {
            message: 'Unable to complete this action due to missing dependencies.',
            code: postgrestError.code,
            details: postgrestError.message,
            retryable: false,
          };
        case '42501':
          return {
            message: 'You do not have permission to perform this action.',
            code: postgrestError.code,
            details: postgrestError.message,
            retryable: false,
          };
        case 'PGRST116':
          return {
            message: 'No data found. The item may have been deleted.',
            code: postgrestError.code,
            details: postgrestError.message,
            retryable: false,
          };
        default:
          return {
            message: postgrestError.message || 'A database error occurred. Please try again.',
            code: postgrestError.code,
            details: postgrestError.details,
            retryable: true,
          };
      }
    }

    if (error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection and try again.',
        details: error.message,
        retryable: true,
      };
    }

    if (error.message.includes('timeout')) {
      return {
        message: 'Request timed out. Please try again.',
        details: error.message,
        retryable: true,
      };
    }

    return {
      message: error.message || 'An unexpected error occurred.',
      details: error.stack,
      retryable: true,
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      retryable: true,
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = getErrorMessage(error);

      if (!errorInfo.retryable) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoff, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

export function logError(error: unknown, context?: string) {
  const errorInfo = getErrorMessage(error);

  console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
    message: errorInfo.message,
    code: errorInfo.code,
    details: errorInfo.details,
    retryable: errorInfo.retryable,
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV === 'production') {
    // Future: Send to error tracking service (Sentry, etc.)
  }
}

export class RetryableError extends Error {
  retryable: boolean;

  constructor(message: string, retryable: boolean = true) {
    super(message);
    this.name = 'RetryableError';
    this.retryable = retryable;
  }
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('invalid credentials') ||
      message.includes('session')
    );
  }
  return false;
}
