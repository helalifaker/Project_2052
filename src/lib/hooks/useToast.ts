"use client";

import { toast as sonnerToast } from "sonner";

// Toast utility functions with consistent styling
export const toast = {
  success: (
    message: string,
    options?: { description?: string; duration?: number },
  ) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
    });
  },

  error: (
    message: string,
    options?: { description?: string; duration?: number },
  ) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 10000,
    });
  },

  warning: (
    message: string,
    options?: { description?: string; duration?: number },
  ) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 7000,
    });
  },

  info: (
    message: string,
    options?: { description?: string; duration?: number },
  ) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
    });
  },

  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    });
  },

  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
  },

  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  // Action toast with button
  action: (
    message: string,
    options: {
      description?: string;
      actionLabel: string;
      onAction: () => void;
      duration?: number;
    },
  ) => {
    return sonnerToast(message, {
      description: options.description,
      duration: options.duration ?? 10000,
      action: {
        label: options.actionLabel,
        onClick: options.onAction,
      },
    });
  },
};

// Hook for using toast (re-exports for consistency)
export function useToast() {
  return toast;
}
