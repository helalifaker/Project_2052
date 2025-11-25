import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ProposalFilters {
  search?: string;
  rentModel?: string[];
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

interface ProposalState {
  // Filters
  filters: ProposalFilters;
  setFilters: (filters: Partial<ProposalFilters>) => void;
  clearFilters: () => void;

  // Comparison
  selectedProposals: string[];
  toggleProposal: (proposalId: string) => void;
  clearSelection: () => void;
  setSelectedProposals: (proposalIds: string[]) => void;

  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Sorting
  sortBy: string;
  sortOrder: "asc" | "desc";
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

const initialFilters: ProposalFilters = {
  search: undefined,
  rentModel: undefined,
  status: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

export const useProposalStore = create<ProposalState>()(
  devtools(
    (set) => ({
      // Filters
      filters: initialFilters,
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      clearFilters: () => set({ filters: initialFilters }),

      // Comparison
      selectedProposals: [],
      toggleProposal: (proposalId) =>
        set((state) => ({
          selectedProposals: state.selectedProposals.includes(proposalId)
            ? state.selectedProposals.filter((id) => id !== proposalId)
            : [...state.selectedProposals, proposalId],
        })),
      clearSelection: () => set({ selectedProposals: [] }),
      setSelectedProposals: (proposalIds) =>
        set({ selectedProposals: proposalIds }),

      // Pagination
      page: 1,
      pageSize: 10,
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),

      // Sorting
      sortBy: "createdAt",
      sortOrder: "desc",
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
    }),
    { name: "Proposal Store" },
  ),
);
