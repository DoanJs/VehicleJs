import { collection, onSnapshot, query } from "firebase/firestore";
import { ReactNode, useEffect } from "react";
import { db } from "./firebase.config";
import {
  useBorrowReqStore,
  useRefuelReqStore,
  useReturnReqStore,
  useVehicleStore,
} from "./zustand";

type AppProviderProps = {
  children: ReactNode;
};

export default function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    // Vehicle store
    const {
      setVehicles,
      //   setLoading: setVehicleLoading,
      //   setError: setVehicleError,
    } = useVehicleStore.getState();

    // Borrow request store
    const {
      setBorrowReqs,
      //   setLoading: setBorrowLoading,
      //   setError: setBorrowError,
    } = useBorrowReqStore.getState();

    // Return request store
    const {
      setReturnReqs,
      //   setLoading: setReturnLoading,
      //   setError: setReturnError,
    } = useReturnReqStore.getState();
    // Return request store

    const {
      setRefuelReqs,
      //   setLoading: setReturnLoading,
      //   setError: setReturnError,
    } = useRefuelReqStore.getState();

    // setVehicleLoading(true);
    // setBorrowLoading(true);
    // setReturnLoading(true);

    const vehiclesQuery = query(collection(db, "vehicles"));
    const borrowReqsQuery = query(collection(db, "borrow_requests"));
    const returnReqsQuery = query(collection(db, "return_requests"));
    const refuelReqsQuery = query(collection(db, "refuel_requests"));

    const unsubVehicles = onSnapshot(
      vehiclesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVehicles(data as any);
        // setVehicleError(null);
        // setVehicleLoading(false);
      },
      (error) => {
        console.error("Listen vehicles error:", error);
        // setVehicleError(error.message || "Có lỗi khi tải vehicles realtime");
        // setVehicleLoading(false);
      },
    );

    const unsubBorrowReqs = onSnapshot(
      borrowReqsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBorrowReqs(data as any);
        // setBorrowError(null);
        // setBorrowLoading(false);
      },
      (error) => {
        console.error("Listen borrow_requests error:", error);
        // setBorrowError(error.message || "Có lỗi khi tải borrow requests realtime");
        // setBorrowLoading(false);
      },
    );

    const unsubReturnReqs = onSnapshot(
      returnReqsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReturnReqs(data as any);
        // setReturnError(null);
        // setReturnLoading(false);
      },
      (error) => {
        console.error("Listen return_requests error:", error);
        // setReturnError(error.message || "Có lỗi khi tải return requests realtime");
        // setReturnLoading(false);
      },
    );
    const unsubRefuelReqs = onSnapshot(
      refuelReqsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRefuelReqs(data as any);
        // setReturnError(null);
        // setReturnLoading(false);
      },
      (error) => {
        console.error("Listen refuel_requests error:", error);
        // setReturnError(error.message || "Có lỗi khi tải return requests realtime");
        // setReturnLoading(false);
      },
    );

    return () => {
      unsubVehicles();
      unsubBorrowReqs();
      unsubReturnReqs();
      unsubRefuelReqs();
    };
  }, []);

  return <>{children}</>;
}
