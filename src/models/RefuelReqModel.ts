import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from ".";

export interface RefuelReqModel {
  id: string;
  plate: string;
  vehicleId: string;
  vehicleName: string;

  type: "refuel";
  requestedByName: string;
  requestedByUid: string;
  status: "pending" | "approved" | "rejected";

  // 🛢️ xăng
  previousFuelLevel: "empty" | "quarter" | "half" | "three_quarters" | "full";
  fuelLevel: "empty" | "quarter" | "half" | "three_quarters" | "full";
  liters: number;      // số lít đổ
  note: string;

  createdAt: TimeAtModel | FieldValue;
  updatedAt: TimeAtModel | FieldValue;
}