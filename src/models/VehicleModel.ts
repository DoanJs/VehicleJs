import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from ".";

export interface VehicleModel {
  id: string;
  name: string;
  type: string
  plate: string;
  status: "available" | "borrowed" | "maintenance";
  imageUrl: string;
  currentKm: string;
  
  fuelLevel: "empty" | "quarter" | "half" | "three_quarters" | "full";
  cleanStatus: "clean" | "normal" | "dirty";

  borrowedByName: string
  borrowedById: string
  borrowedReason: string

  createdAt: TimeAtModel | FieldValue;
  updatedAt: TimeAtModel | FieldValue;
}
