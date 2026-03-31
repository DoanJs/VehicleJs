import { create } from "zustand";
import { BorrowReqModel } from "../models";

interface BorrowReqState {
  borrowReqs: BorrowReqModel[];
  loading: boolean;
  error: string | null;
  setBorrowReqs: (borrowReqs: BorrowReqModel[]) => void;
  addBorrowReq: (borrowReq: BorrowReqModel) => void;
  editBorrowReq: (id: string, borrowReq: BorrowReqModel) => void;
  removeBorrowReq: (id: string) => void;
  clearBorrowReqs: () => void;
}

const useclearBorrowReqStore = create<BorrowReqState>((set) => ({
  borrowReqs: [],
  loading: false,
  error: null,

  setBorrowReqs: (borrowReqs: BorrowReqModel[]) => set({ borrowReqs }),
  addBorrowReq: (borrowReq: BorrowReqModel) =>
    set((state: any) => ({ borrowReqs: [...state.borrowReqs, borrowReq] })),
  editBorrowReq: (id: string, borrowReq: BorrowReqModel) =>
    set((state: any) => {
      const index = state.borrowReqs.findIndex((item: any) => item.id === id);
      state.borrowReqs[index] = borrowReq;
      return { borrowReqs: [...state.borrowReqs] };
    }),
  removeBorrowReq: (id: string) =>
    set((state: any) => ({
      borrowReqs: state.borrowReqs.filter((item: BorrowReqModel) => item.id !== id),
    })),
  clearBorrowReqs: () => set({ borrowReqs: [] }),
}));

export default useclearBorrowReqStore;
