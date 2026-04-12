import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { SpinnerComponent } from "./components";
import { auth, db } from "./firebase.config";
import { UserModel } from "./models";
import {
  AdminScreen,
  ForgotPasswordScreen,
  HomeScreen,
  LoginScreen,
  RegisterScreen,
  VehicleRefueScreen,
  VehicleReturnScreen,
} from "./screens";
import VehicleScan from "./screens/vehicle/VehicleScan";
import { useUserStore } from "./zustand";
import UpdateToast from "./components/UpdateToast";
import "react-toastify/dist/ReactToastify.css";
// import { handleToastWarn } from "./constants/handleToast";

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

export default function App() {
  const { setUser } = useUserStore();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setAuthState({ user: currentUser, isLoading: false });

      if (currentUser) {
        // chỉ fetch khi có user
        try {
          getDoc(doc(db, "users", currentUser.uid as string))
            .then(async (result) => {
              setUser({ ...result.data(), id: currentUser.uid } as UserModel);
            })
            .catch(async () => {
              await signOut(auth);
              // handleToastWarn(
              //   "Tài khoản chưa được cấp quyền, vui lòng liên hệ admin !"
              // );
            });
        } catch (error) {
          console.log("error: ", error);
        }
      } else {
        // clear user khi logout
        setUser(null);
      }
    });
    return () => unsub();
  }, [setUser]);

  if (authState.isLoading) {
    return <SpinnerComponent />;
  }

  return (
    <div>
      <UpdateToast />
      <ToastContainer
        position="bottom-right"
        style={{ width: 340 }}   // 👈 fix width
        newestOnTop
        closeOnClick={false}
        pauseOnHover
        draggable={false}
        theme="light"
      />
      
      <Routes>
        <Route
          path="/login"
          element={
            authState.user ? <Navigate to="/" replace /> : <LoginScreen />
          }
        />
        <Route
          path="/"
          element={
            authState.user ? <HomeScreen /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="admin"
          element={
            authState.user &&
            ["iUPNmw1RSifaTd2iUMBSQEuS3Im2"].includes(authState.user.uid) ? (
              <AdminScreen />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="vehicleScan/:id" element={<VehicleScan />} />
        <Route
          path="vehicleReturnScreen/:id"
          element={<VehicleReturnScreen />}
        />
        <Route path="vehicleRefueScreen/:id" element={<VehicleRefueScreen />} />

        <Route path="register" element={<RegisterScreen />} />
        <Route path="forgotPassword" element={<ForgotPasswordScreen />} />

        <Route path="*" element={<>404</>} />
      </Routes>

      <ToastContainer />
    </div>
  );
}
