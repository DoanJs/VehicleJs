import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from ".";

export interface BorrowReqModel {
  id: string;
  type: string
  plate: string;
  requestedByName: string
  requestedByUid: string
  status: "pending" | "approved" | "reject";
  vehicleId: string;
  vehicleName: string

  createdAt: TimeAtModel | FieldValue;
  updatedAt: TimeAtModel | FieldValue;
}
