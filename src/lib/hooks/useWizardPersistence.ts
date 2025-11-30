"use client";

import { useEffect, useCallback } from "react";
import type { ProposalFormData } from "@/components/proposals/wizard/types";

/**
 * Wizard State Interface
 */
interface WizardState {
  currentStep: number;
  formData: Partial<ProposalFormData>;
  lastSaved: string;
}

const STORAGE_KEY = "proposal-wizard-draft";
const EXPIRY_DAYS = 7; // Draft expires after 7 days

/**
 * useWizardPersistence Hook
 *
 * Manages localStorage persistence for wizard state.
 * Automatically saves and restores wizard progress.
 *
 * Features:
 * - Auto-save on form data change
 * - Auto-restore on mount
 * - Expiry mechanism (7 days)
 * - Clear draft functionality
 * - TypeScript safe
 *
 * @param currentStep - Current wizard step (0-based)
 * @param formData - Current form data
 * @param onRestore - Callback when draft is restored
 *
 * @returns Object with save, restore, clear, and hasDraft functions
 *
 * @example
 * ```tsx
 * const { hasDraft, clearDraft, restoreDraft } = useWizardPersistence(
 *   currentStep,
 *   formData,
 *   (state) => {
 *     setCurrentStep(state.currentStep);
 *     setFormData(state.formData);
 *   }
 * );
 * ```
 */
export function useWizardPersistence(
  currentStep: number,
  formData: Partial<ProposalFormData>,
  onRestore?: (state: WizardState) => void
) {
  /**
   * Save wizard state to localStorage
   */
  const saveDraft = useCallback(() => {
    try {
      const state: WizardState = {
        currentStep,
        formData,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save wizard draft:", error);
    }
  }, [currentStep, formData]);

  /**
   * Load wizard state from localStorage
   */
  const loadDraft = useCallback((): WizardState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const state: WizardState = JSON.parse(saved);

      // Check expiry
      const savedDate = new Date(state.lastSaved);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff > EXPIRY_DAYS) {
        // Draft expired, clear it
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return state;
    } catch (error) {
      console.error("Failed to load wizard draft:", error);
      return null;
    }
  }, []);

  /**
   * Clear saved draft
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear wizard draft:", error);
    }
  }, []);

  /**
   * Check if draft exists
   */
  const hasDraft = useCallback((): boolean => {
    const draft = loadDraft();
    return draft !== null;
  }, [loadDraft]);

  /**
   * Restore draft and call onRestore callback
   */
  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft && onRestore) {
      onRestore(draft);
    }
    return draft !== null;
  }, [loadDraft, onRestore]);

  /**
   * Auto-save on form data change (debounced)
   */
  useEffect(() => {
    // Don't save if form is empty
    if (!formData.developerName && !formData.rentModel) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeoutId);
  }, [formData, saveDraft]);

  /**
   * Auto-restore on mount (only once)
   */
  useEffect(() => {
    // Only restore if we're on step 0 and form is empty
    if (currentStep === 0 && !formData.developerName && hasDraft()) {
      const shouldRestore = confirm(
        "You have an unsaved draft. Would you like to resume where you left off?"
      );
      if (shouldRestore) {
        restoreDraft();
      } else {
        clearDraft();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    restoreDraft,
  };
}
