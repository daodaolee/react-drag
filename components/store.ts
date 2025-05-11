import { create } from "zustand";

export const Store = create((set) => ({

  activeItem:{
    id: '',
    mode: 'drag'
  },
  setActiveItem: (item) => set(() => ({ activeItem: item })),
}))