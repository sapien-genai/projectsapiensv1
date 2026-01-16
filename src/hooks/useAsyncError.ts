import { useState, useCallback } from 'react';
import { getErrorMessage, logError, retryOperation } from '../utils/errorHandling';
import type { AppError } from '../utils/errorHandling';

interface UseAsyncErrorOptions {
  retryCount?: number;
  logContext?: string;
  onError?: (error: AppError) => void;
}

export function useAsyncError(options: UseAsyncErrorOptions = {}) {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      customOptions?: UseAsyncErrorOptions
    ): Promise<T | null> => {
      const mergedOptions = { ...options, ...customOptions };
      setIsLoading(true);
      setError(null);

      try {
        const result = mergedOptions.retryCount
          ? await retryOperation(operation, mergedOptions.retryCount)
          : await operation();

        setIsLoading(false);
        return result;
      } catch (err) {
        const appError = getErrorMessage(err);
        setError(appError);
        setIsLoading(false);

        if (mergedOptions.logContext) {
          logError(err, mergedOptions.logContext);
        }

        if (mergedOptions.onError) {
          mergedOptions.onError(appError);
        }

        return null;
      }
    },
    [options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isLoading,
    executeAsync,
    clearError,
  };
}
