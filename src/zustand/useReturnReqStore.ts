import { create } from "zustand";
import { ReturnReqModel } from "../models";

interface ReturnReqState {
  returnReqs: ReturnReqModel[];
  loading: boolean;
  error: string | null;
  setReturnReqs: (returnReqs: ReturnReqModel[]) => void;
  addReturnReq: (returnReq: ReturnReqModel) => void;
  editReturnReq: (id: string, returnReq: ReturnReqModel) => void;
  removeReturnReq: (id: string) => void;
  clearReturnReqs: () => void;
}

const useReturnReqStore = create<ReturnReqState>((set) => ({
  returnReqs: [],
  loading: false,
  error: null,

  setReturnReqs: (returnReqs: ReturnReqModel[]) => set({ returnReqs }),
  addReturnReq: (returnReq: ReturnReqModel) =>
    set((state: any) => ({ returnReqs: [...state.returnReqs, returnReq] })),
  editReturnReq: (id: string, returnReq: ReturnReqModel) =>
    set((state: any) => {
      const index = state.returnReqs.findIndex((item: any) => item.id === id);
      state.returnReqs[index] = returnReq;
      return { returnReqs: [...state.returnReqs] };
    }),
  removeReturnReq: (id: string) =>
    set((state: any) => ({
      returnReqs: state.returnReqs.filter(
        (item: ReturnReqModel) => item.id !== id,
      ),
    })),
  clearReturnReqs: () => set({ returnReqs: [] }),
}));

export default useReturnReqStore;
