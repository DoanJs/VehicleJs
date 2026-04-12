import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from ".";

export interface ReturnReqModel {
  id: string;
  plate: string;
  vehicleId: string;
  vehicleName: string;

  type: "borrow" | "return" | "refuel";
  requestedByName: string;
  requestedByUid: string;
  status: "pending" | "approved" | "rejected";

  cleanStatus: "clean" | "normal" | "dirty";
  currentKm: number;
  fuelLevel: "empty" | "quarter" | "half" | "three_quarters" | "full";
  kmIncrease: number;
  note: string;

  createdAt: TimeAtModel | FieldValue;
  updatedAt: TimeAtModel | FieldValue;
}
