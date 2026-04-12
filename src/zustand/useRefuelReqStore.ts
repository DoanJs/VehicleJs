import { create } from "zustand";
import { RefuelReqModel } from "../models";

interface RefuelReqState {
  refuelReqs: RefuelReqModel[];
  loading: boolean;
  error: string | null;
  setRefuelReqs: (refuelReqs: RefuelReqModel[]) => void;
  addRefuelReq: (refuelReq: RefuelReqModel) => void;
  editRefuelReq: (id: string, refuelReq: RefuelReqModel) => void;
  removeRefuelReq: (id: string) => void;
  clearRefuelReqs: () => void;
}

const useRefuelReqStore = create<RefuelReqState>((set) => ({
  refuelReqs: [],
  loading: false,
  error: null,

  setRefuelReqs: (refuelReqs: RefuelReqModel[]) => set({ refuelReqs }),
  addRefuelReq: (refuelReq: RefuelReqModel) =>
    set((state: any) => ({ refuelReqs: [...state.refuelReqs, refuelReq] })),
  editRefuelReq: (id: string, refuelReq: RefuelReqModel) =>
    set((state: any) => {
      const index = state.refuelReqs.findIndex((item: any) => item.id === id);
      state.refuelReqs[index] = refuelReq;
      return { refuelReqs: [...state.refuelReqs] };
    }),
  removeRefuelReq: (id: string) =>
    set((state: any) => ({
      refuelReqs: state.refuelReqs.filter(
        (item: RefuelReqModel) => item.id !== id,
      ),
    })),
  clearRefuelReqs: () => set({ refuelReqs: [] }),
}));

export default useRefuelReqStore;
