import { create } from 'zustand';
import { VehicleModel } from '../models/VehicleModel';

interface VehicleState {
    vehicles: VehicleModel[];
    loading: boolean;
    error: string | null;
    setVehicles: (vehicles: VehicleModel[]) => void;
    addVehicle: (vehicle: VehicleModel) => void;
    editVehicle: (id: string, vehicle: VehicleModel) => void
    removeVehicle: (id: string) => void;
    clearVehicles: () => void;
}

const useVehicleStore = create<VehicleState>((set) => ({
    vehicles: [],
    loading: false,
    error: null,

    setVehicles: (vehicles: VehicleModel[]) => set({ vehicles }),
    addVehicle: (vehicle: VehicleModel) =>
        set((state: any) => ({ vehicles: [...state.vehicles, vehicle] })),
    editVehicle: (id: string, vehicle: VehicleModel) =>
        set((state: any) => {
            const index = state.vehicles.findIndex((item: any) => item.id === id)
            state.vehicles[index] = vehicle
            return ({ vehicles: [...state.vehicles] })
        }),
    removeVehicle: (id: string) =>
        set((state: any) => ({
            vehicles: state.vehicles.filter((item: VehicleModel) => item.id !== id),
        })),
    clearVehicles: () => set({ vehicles: [] }),
}));

export default useVehicleStore;