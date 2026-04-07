import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { CarFront, ChevronLeft, Fuel, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { db, functions } from "../../firebase.config";
import { VehicleModel } from "../../models";
import { useUserStore } from "../../zustand";

type VehicleStatus = "available" | "borrowed" | "maintenance";
type ActionType = "borrow" | "return" | "refuel" | null;

export default function VehicleScan() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserStore();
  const [vehicle, setVehicle] = useState<VehicleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [borrowReason, setBorrowReason] = useState("");
  const [borrowReasonError, setBorrowReasonError] = useState("");

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setError("Thiếu mã xe.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const vehicleRef = doc(db, "vehicles", id);
        const vehicleSnap = await getDoc(vehicleRef);

        if (!vehicleSnap.exists()) {
          setError("Không tìm thấy xe.");
          setVehicle(null);
          return;
        }

        const data = vehicleSnap.data();

        setVehicle({
          id: vehicleSnap.id,
          name: data.name || "",
          plate: data.plate || "",
          status: data.status || "available",
          currentKm: data.currentKm || 0,
          imageUrl: data.imageUrl || "",
          type: data.type || "",

          fuelLevel: data.fuelLevel || "full",
          cleanStatus: data.cleanStatus || "clean",

          borrowedByName: data.borrowedByName || "",
          borrowedById: data.borrowedById || "",
          borrowedReason: data.borrowedReason || "",

          createdAt: data.createAt || Date.now(),
          updatedAt: data.updateAt || Date.now(),
        });
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu xe.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const getStatusText = (status: VehicleStatus) => {
    return status === "available" ? "Đang rảnh" : "Đang dùng";
  };

  const getStatusColor = (status: VehicleStatus) => {
    return status === "available" ? "#198754" : "#dc3545";
  };

  // const getActionTitle = () => {
  //   if (selectedAction === "borrow") return "GỬI YÊU CẦU MƯỢN XE";
  //   return "";
  // };

  const getActionQuestion = () => {
    if (selectedAction === "borrow")
      return "Bạn chắc chắn muốn gửi yêu cầu mượn xe này?";
    return "";
  };

  type SubmitBorrowRequestPayload = {
    vehicleId: string;
    reason: string;
  };

  type SubmitBorrowRequestResponse = {
    success: boolean;
    requestId: string;
    message: string;
  };
  const validateBorrowReason = () => {
    const value = borrowReason.trim();

    if (!value) {
      return "Vui lòng nhập mục đích mượn xe.";
    }

    if (value.length < 5) {
      return "Mục đích mượn xe phải có ít nhất 5 ký tự.";
    }

    return "";
  };

  const handleSubmitBorrowRequest = async () => {
    if (!vehicle || selectedAction !== "borrow") return;

    const validationError = validateBorrowReason();
    if (validationError) {
      setBorrowReasonError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");
      setBorrowReasonError("");

      const submitBorrowRequest = httpsCallable<
        SubmitBorrowRequestPayload,
        SubmitBorrowRequestResponse
      >(functions, "submitBorrowRequest");

      const result = await submitBorrowRequest({
        vehicleId: vehicle.id,
        reason: borrowReason.trim(),
      });

      handleToastSuccess(result.data.message);
      setBorrowReason("");
      setBorrowReasonError("");
      setSelectedAction(null);
    } catch (err: any) {
      const message =
        err?.message || "Không gửi được yêu cầu mượn xe. Vui lòng thử lại.";

      handleToastError(message);
      setSelectedAction(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div
          className="bg-white border shadow-sm p-4 text-center"
          style={{ width: 350 }}
        >
          Đang tải dữ liệu xe...
        </div>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="bg-white border shadow-sm p-4" style={{ width: 350 }}>
          <div className="alert alert-danger mb-3">{error}</div>
          <button
            className="btn btn-primary w-100"
            onClick={() => navigate("/")}
          >
            Quay lại trang quét
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light py-3">
      <div
        className="bg-white border shadow-sm overflow-hidden"
        style={{
          width: 400,
          minHeight: 560,
          maxWidth: "100%",
        }}
      >
        <div
          className="d-flex align-items-center px-3 text-white fw-semibold"
          style={{
            backgroundColor: "#1565c0",
            minHeight: 52,
            paddingTop: "max(12px, env(safe-area-inset-top))",
            paddingBottom: 12,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <ChevronLeft size={24} className="me-2 flex-shrink-0" />
          <span>Quét lại</span>
        </div>

        <div className="p-3">
          <div className="border-top pt-4">
            <div className="row g-3 align-items-center">
              <div className="col-12">
                <div
                  className="border rounded overflow-hidden bg-light d-flex align-items-center justify-content-center"
                  style={{ height: 200 }}
                >
                  {vehicle.imageUrl ? (
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      className="img-fluid"
                      style={{ maxHeight: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <span className="text-muted small">Chưa có ảnh</span>
                  )}
                </div>
              </div>

              <div className="col-12">
                <div className="fw-bold fs-3 text-primary">
                  {vehicle.name.toUpperCase()}
                </div>

                <div className="mt-2 fs-5">
                  Biển số: <b>{vehicle.plate}</b>
                </div>

                <div className="mt-2 fs-5">
                  Số Km: <b>{vehicle.currentKm}</b>
                </div>

                <div className="mt-2 fs-5">
                  Xăng:{" "}
                  <b>
                    {vehicle.fuelLevel === "empty"
                      ? "Hết"
                      : vehicle.fuelLevel === "quarter"
                        ? "1/4"
                        : vehicle.fuelLevel === "half"
                          ? "1/2"
                          : vehicle.fuelLevel === "three_quarters"
                            ? "3/4"
                            : "Đầy"}
                  </b>
                </div>

                <div className="mt-2 fs-5">
                  Trạng thái:{" "}
                  <span
                    style={{
                      color: getStatusColor(vehicle.status),
                      fontWeight: 700,
                    }}
                  >
                    {getStatusText(vehicle.status)}
                  </span>
                </div>

                <div className="mt-2 fs-5">
                  Người dùng:{" "}
                  <span style={{ fontWeight: 700 }}>
                    {vehicle.borrowedByName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-top mt-4 pt-4 text-center">
            <div className="fw-bold fs-4 mb-4">Bạn muốn làm gì?</div>

            {vehicle.status === "available" && (
              <button
                className="btn w-100 text-white fw-bold fs-3 mb-3 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "#dc3545",
                  minHeight: 56,
                }}
                onClick={() => {
                  setBorrowReason("");
                  setBorrowReasonError("");
                  setSelectedAction("borrow");
                }}
              >
                <CarFront size={28} className="me-2" />
                Mượn xe
              </button>
            )}

            {vehicle.status === "borrowed" &&
              vehicle.borrowedById === user?.id && (
                <button
                  className="btn w-100 text-white fw-bold fs-3 mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#198754",
                    minHeight: 56,
                  }}
                  onClick={() => navigate(`/vehicleReturnScreen/${vehicle.id}`)}
                >
                  <RefreshCcw size={28} className="me-2" />
                  Trả xe
                </button>
              )}

            <button
              className="btn w-100 text-white fw-bold fs-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#f0a500",
                minHeight: 56,
                opacity: vehicle.fuelLevel === "full" ? 0.3 : 1,
                cursor:
                  vehicle.fuelLevel === "full" ? "not-allowed" : "pointer",
              }}
              onClick={() => navigate(`/vehicleRefueScreen/${vehicle.id}`)}
              disabled={vehicle.fuelLevel === "full"}
            >
              <Fuel size={28} className="me-2" />
              Đổ xăng
            </button>
          </div>

          {successMessage && (
            <div className="alert alert-success mt-3 mb-0">
              {successMessage}
            </div>
          )}

          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
        </div>
      </div>

      {selectedAction === "borrow" && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 0 }}>
              <div
                className="d-flex align-items-center px-3"
                style={{
                  backgroundColor: "#1565c0",
                  minHeight: 52,
                  paddingTop: "max(12px, env(safe-area-inset-top))",
                  paddingBottom: 12,
                }}
              >
                <button
                  className="btn btn-link text-white p-0 border-0"
                  onClick={() => {
                    setBorrowReason("");
                    setBorrowReasonError("");
                    setSelectedAction(null);
                  }}
                >
                  <ChevronLeft size={28} />
                </button>
              </div>

              <div className="border-top pt-4">
                <div className="fs-5 mb-4 text-center">
                  {getActionQuestion()}
                </div>

                <div className="fw-bold fs-4 text-primary text-center">
                  XE: {vehicle.name.toUpperCase()}
                </div>

                <div className="fs-5 mt-3 text-center">
                  Biển số: <b>{vehicle.plate}</b>
                </div>

                <div className="mt-4 px-4">
                  <label className="form-label fw-semibold fs-5">
                    Mục đích mượn xe <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${borrowReasonError ? "is-invalid" : ""}`}
                    rows={4}
                    placeholder="Ví dụ: Đi công tác, gặp khách hàng, xử lý công việc tại cơ sở..."
                    value={borrowReason}
                    onChange={(e) => {
                      setBorrowReason(e.target.value);
                      if (borrowReasonError) setBorrowReasonError("");
                    }}
                    maxLength={250}
                    disabled={submitting}
                  />

                  {borrowReasonError && (
                    <div className="invalid-feedback d-block">
                      {borrowReasonError}
                    </div>
                  )}

                  <div className="text-muted small mt-1 text-end">
                    {borrowReason.trim().length}/250
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top-0 px-4 pb-4">
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={() => {
                    setBorrowReason("");
                    setBorrowReasonError("");
                    setSelectedAction(null);
                  }}
                  disabled={submitting}
                >
                  Hủy
                </button>

                <button
                  className="btn btn-primary px-4"
                  onClick={handleSubmitBorrowRequest}
                  disabled={
                    submitting ||
                    !borrowReason.trim() ||
                    borrowReason.trim().length < 5
                  }
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
