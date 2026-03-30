import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from ".";

export interface VehicleModel {
  id: string;
  name: string;
  plate: string;
  status: "available" | "borrowed";
  imageUrl: string;
  currentKm: string;

  createdAt: TimeAtModel | FieldValue;
  updatedAt: TimeAtModel | FieldValue;
}
