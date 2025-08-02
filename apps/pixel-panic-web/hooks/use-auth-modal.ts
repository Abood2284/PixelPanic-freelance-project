// apps/pixel-panic-web/hooks/use-auth-modal.ts
import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
