import { create } from 'zustand';

type Division = 'erp' | 'msp';

interface AppState {
    activeDivision: Division;
    activeModule: string | null;
    setDivision: (division: Division) => void;
    setModule: (module: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    activeDivision: 'erp', // Default to ERP
    activeModule: 'capital', // Default to Capital (first module)
    setDivision: (division) => set({ activeDivision: division }),
    setModule: (module) => set({ activeModule: module }),
}));
