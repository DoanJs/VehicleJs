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

type VehicleStatus = "available" | "borrowed" | "maintenance";
type ActionType = "borrow" | "return" | "refuel" | null;

export default function VehicleScan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<VehicleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [successMessage, setSuccessMessage] = useState("");

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
    return status === "available" ? "Đang rảnh" : "Đang được mượn";
  };

  const getStatusColor = (status: VehicleStatus) => {
    return status === "available" ? "#198754" : "#dc3545";
  };

  const getActionTitle = () => {
    if (selectedAction === "borrow") return "GỬI YÊU CẦU MƯỢN XE";
    return "";
  };

  const getActionQuestion = () => {
    if (selectedAction === "borrow")
      return "Bạn chắc chắn muốn gửi yêu cầu mượn xe này?";
    return "";
  };

  type SubmitBorrowRequestPayload = {
    vehicleId: string;
  };

  type SubmitBorrowRequestResponse = {
    success: boolean;
    requestId: string;
    message: string;
  };

  const handleSubmitBorrowRequest = async () => {
    if (!vehicle || selectedAction !== "borrow") return;

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const submitBorrowRequest = httpsCallable<
        SubmitBorrowRequestPayload,
        SubmitBorrowRequestResponse
      >(functions, "submitBorrowRequest");

      const result = await submitBorrowRequest({
        vehicleId: vehicle.id,
      });

      handleToastSuccess(result.data.message);
      setSelectedAction(null);
    } catch (err: any) {
      // console.error(err);

      const message =
        err?.message || "Không gửi được yêu cầu mượn xe. Vui lòng thử lại.";

      handleToastError(message);
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
    <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="bg-white border shadow-sm"
        style={{ width: 400, minHeight: 560 }}
      >
        <div
          className="d-flex align-items-center px-3 text-white fw-semibold"
          style={{
            backgroundColor: "#1565c0",
            height: 52,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <ChevronLeft size={24} className="me-2" />
          Quét lại
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
                  Người mượn:{" "}
                  <span
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    Nguyễn Văn A
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-top mt-4 pt-4 text-center">
            <div className="fw-bold fs-4 mb-4">Bạn muốn làm gì?</div>

            {/* Mượn xe */}
            <button
              className="btn w-100 text-white fw-bold fs-3 mb-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#dc3545",
                height: 56,
                opacity: vehicle.status === "borrowed" ? 0.3 : 1,
                cursor:
                  vehicle.status === "borrowed" ? "not-allowed" : "pointer",
              }}
              onClick={() => setSelectedAction("borrow")}
              disabled={vehicle.status === "borrowed"}
            >
              <CarFront size={28} className="me-2" />
              Mượn xe
            </button>

            {/* Trả xe */}
            <button
              className="btn w-100 text-white fw-bold fs-3 mb-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#198754",
                height: 56,
                opacity: vehicle.status === "available" ? 0.3 : 1,
                cursor:
                  vehicle.status === "available" ? "not-allowed" : "pointer",
              }}
              onClick={() => navigate(`/vehicleReturnScreen/${vehicle.id}`)}
              disabled={vehicle.status === "available"}
            >
              <RefreshCcw size={28} className="me-2" />
              Trả xe
            </button>

            {/* Đỗ xăng */}
            <button
              className="btn w-100 text-white fw-bold fs-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#f0a500",
                height: 56,
              }}
              onClick={() => navigate(`/vehicleRefueScreen/${vehicle.id}`)}
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
        <>
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.35)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: 0 }}>
                <div
                  className="d-flex align-items-center px-3"
                  style={{ backgroundColor: "#1565c0", height: 52 }}
                >
                  <button
                    className="btn btn-link text-white p-0 border-0"
                    onClick={() => setSelectedAction(null)}
                  >
                    <ChevronLeft size={28} />
                  </button>
                </div>

                <div className="modal-body p-4">
                  <div className="text-center fw-bold fs-2 text-primary mb-4">
                    {getActionTitle()}
                  </div>

                  <div className="border-top pt-4 text-center">
                    <div className="fs-5 mb-4">{getActionQuestion()}</div>

                    <div className="fw-bold fs-4 text-primary">
                      XE: {vehicle.name.toUpperCase()}
                    </div>

                    <div className="fs-5 mt-3">
                      Biển số: <b>{vehicle.plate}</b>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top-0 px-4 pb-4">
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setSelectedAction(null)}
                    disabled={submitting}
                  >
                    Hủy
                  </button>

                  <button
                    className="btn btn-primary px-4"
                    onClick={handleSubmitBorrowRequest}
                    disabled={submitting}
                  >
                    {submitting ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
