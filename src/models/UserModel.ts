import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from ".";

export interface UserModel {
  id: string;//nhớ tự customID khi tạo user mới
  fullName: string;
  shortName: string
  email: string;
  phone: string;
  avatar: string;
  birth: string
  role: string
  position: string

  createdAt: TimeAtModel | FieldValue;
  updatedAt: TimeAtModel | FieldValue;
}
