"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ScenarioState {
  discountRate: number;
  inflationRate: number;
  rentGrowthFactor: number;
}

interface ScenarioContextType extends ScenarioState {
  updateAssumption: (key: keyof ScenarioState, value: number) => void;
  resetAssumptions: () => void;
}

const DEFAULT_STATE: ScenarioState = {
  discountRate: 0.08, // 8%
  inflationRate: 0.02, // 2%
  rentGrowthFactor: 1.0, // 100% (baseline)
};

const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined,
);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScenarioState>(DEFAULT_STATE);

  const updateAssumption = (key: keyof ScenarioState, value: number) => {
    setState((prev) => {
      // Skip update if value hasn't changed - prevents unnecessary re-renders
      // Critical for slider interactions that fire 60+ events/second
      if (prev[key] === value) {
        return prev;
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const resetAssumptions = () => {
    setState(DEFAULT_STATE);
  };

  return (
    <ScenarioContext.Provider
      value={{
        ...state,
        updateAssumption,
        resetAssumptions,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
}
