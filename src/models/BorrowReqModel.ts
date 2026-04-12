import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from ".";

export interface BorrowReqModel {
  id: string;
 type: "borrow" | "return" | "refuel";
  plate: string;
  requestedByName: string
  requestedByUid: string
  status: "pending" | "approved" | "rejected";
  vehicleId: string;
  vehicleName: string

  createdAt: TimeAtModel | FieldValue;
  updatedAt: TimeAtModel | FieldValue;
}
