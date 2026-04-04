import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ChevronLeft, RotateCcw, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, functions } from "../../firebase.config";
import { httpsCallable } from "firebase/functions";
import { handleToastError, handleToastSuccess } from "../../constants/handleToast";

type Vehicle = {
  id: string;
  name: string;
  plate: string;
  status: "available" | "borrowed" | "rejected";
  currentKm?: number;
  imageUrl?: string;
};
type FuelLevel = "full" | "three_quarters" | "half" | "empty" | "quarter";

export default function VehicleRefueScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [previousFuelLevel, setPreviousFuelLevel] = useState<FuelLevel>("full");
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>("full");
  const [liters, setLiters] = useState("");
  const [note, setNote] = useState("");

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
          setLoading(false);
          return;
        }

        const data = vehicleSnap.data();

        const nextVehicle: Vehicle = {
          id: vehicleSnap.id,
          name: data.name || "",
          plate: data.plate || "",
          status: data.status || "available",
          imageUrl: data.imageUrl || "",
        };

        setVehicle(nextVehicle);
        setPreviousFuelLevel(data.fuelLevel);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu xe.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const validateForm = () => {
    if (!vehicle) return "Không có dữ liệu xe.";

    if (!liters.trim()) return "Vui lòng nhập số lít xăng.";
    if (Number.isNaN(Number(liters)) || Number(liters) <= 0) {
      return "Số lít xăng không hợp lệ.";
    }

    if (note.length > 200) return "Ghi chú tối đa 200 ký tự.";

    return "";
  };

  const handleSubmitRefuelRequest = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!vehicle) return;

    try {
      setSubmitting(true);
      setError("");

      const submitRefuelRequest = httpsCallable(
        functions,
        "submitRefuelRequest",
      );

      const res: any = await submitRefuelRequest({
        vehicleId: vehicle.id,
        fuelLevel,
        liters: Number(liters),
        note: note.trim(),
      });

      handleToastSuccess(res.data.message);

      navigate(`/vehicleScan/${vehicle.id}`);
    } catch (err: any) {
      console.error(err);

      const message =
        err?.message || "Không gửi được yêu cầu đổ xăng. Vui lòng thử lại.";

      handleToastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptionButton = (
    active: boolean,
    label: string,
    onClick: () => void,
  ) => (
    <button
      type="button"
      className="btn fw-semibold w-100"
      onClick={onClick}
      style={{
        minHeight: 48,
        border: "1px solid #d7dce2",
        backgroundColor: active ? "#fff3d6" : "#fff",
        color: active ? "#b77900" : "#1f2937",
        boxShadow: active ? "inset 0 0 0 1px #f0a500" : "none",
      }}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center">
        <div
          className="bg-white w-100 shadow-sm"
          style={{ maxWidth: 430, minHeight: "100vh" }}
        >
          <div className="p-4 text-center">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center">
        <div
          className="bg-white w-100 shadow-sm"
          style={{ maxWidth: 430, minHeight: "100vh" }}
        >
          <div
            className="d-flex align-items-center px-3 text-white fw-semibold"
            style={{
              backgroundColor: "#123f78",
              height: 56,
              cursor: "pointer",
            }}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={22} className="me-2" />
            Quay lại
          </div>

          <div className="p-3">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="min-vh-100 bg-light d-flex justify-content-center">
      <div
        className="bg-white w-100 shadow-sm"
        style={{ maxWidth: 430, minHeight: "100vh" }}
      >
        <div
          className="d-flex align-items-center px-3 text-white fw-bold"
          style={{ backgroundColor: "#123f78", height: 56, cursor: "pointer" }}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={22} className="me-2" />
          ĐỔ XĂNG
        </div>

        <div className="p-3">
          <div className="border rounded p-3 mb-4">
            <div className="row g-3 align-items-center">
              <div className="col-4">
                <div
                  className="w-100 bg-light rounded border overflow-hidden d-flex align-items-center justify-content-center"
                  style={{ height: 90 }}
                >
                  {vehicle.imageUrl ? (
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      className="w-100 h-100"
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <span className="text-muted small">Chưa có ảnh</span>
                  )}
                </div>
              </div>

              <div className="col-8">
                <div className="fw-bold fs-3 text-primary">
                  {vehicle.name.toUpperCase()}
                </div>
                <div className="fs-5">Biển số: {vehicle.plate}</div>

                <div className="mt-2">
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: "#fff3d6",
                      color: "#b77900",
                      fontSize: 14,
                      padding: "8px 12px",
                    }}
                  >
                    Ghi nhận đổ xăng
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="fw-bold mb-3" style={{ fontSize: 28 }}>
            THÔNG TIN ĐỔ XĂNG
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mức xăng trước đổ</label>
            <div className="row g-2">
              <div className="col-2">
                {renderOptionButton(previousFuelLevel === "full", "Đầy", () =>
                  setPreviousFuelLevel("full"),
                )}
              </div>
              <div className="col-2">
                {renderOptionButton(
                  previousFuelLevel === "three_quarters",
                  "3/4",
                  () => setPreviousFuelLevel("three_quarters"),
                )}
              </div>
              <div className="col-2">
                {renderOptionButton(previousFuelLevel === "half", "1/2", () =>
                  setPreviousFuelLevel("half"),
                )}
              </div>
              <div className="col-2">
                {renderOptionButton(
                  previousFuelLevel === "quarter",
                  "1/4",
                  () => setPreviousFuelLevel("quarter"),
                )}
              </div>
              <div className="col-2">
                {renderOptionButton(previousFuelLevel === "empty", "Hết", () =>
                  setPreviousFuelLevel("empty"),
                )}
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Mức xăng sau đổ</label>
            <div className="row g-2">
              <div className="col-2">
                {renderOptionButton(fuelLevel === "full", "Đầy", () =>
                  setFuelLevel("full"),
                )}
              </div>
              <div className="col-2">
                {renderOptionButton(fuelLevel === "three_quarters", "3/4", () =>
                  setFuelLevel("three_quarters"),
                )}
              </div>
              <div className="col-2">
                {renderOptionButton(fuelLevel === "half", "1/2", () =>
                  setFuelLevel("half"),
                )}
              </div>
              <div className="col-2">
                {renderOptionButton(fuelLevel === "quarter", "1/4", () =>
                  setFuelLevel("quarter"),
                )}
              </div>
              <div className="col-2">
                {renderOptionButton(fuelLevel === "empty", "Hết", () =>
                  setFuelLevel("empty"),
                )}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Số lít đổ</label>
            <div className="input-group">
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                placeholder="Ví dụ: 2.5"
              />
              <span className="input-group-text">lít</span>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Ghi chú</label>
            <textarea
              className="form-control"
              rows={4}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú nếu có..."
            />
            <div className="text-end form-text">{note.length}/200</div>
          </div>

          <div
            className="rounded p-3 mb-3"
            style={{ backgroundColor: "#fff8e8", border: "1px solid #fde7a2" }}
          >
            <div className="fw-bold mb-2" style={{ color: "#b77900" }}>
              XÁC NHẬN THÔNG TIN
            </div>
            <div>• Tôi xác nhận thông tin đổ xăng là đúng.</div>
            <div>• Số lít được nhập theo hóa đơn thực tế.</div>
            <div>• Admin có thể kiểm tra lại khi cần.</div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button
            className="btn w-100 text-white fw-bold mb-2"
            style={{ backgroundColor: "#f0a500", height: 52 }}
            onClick={handleSubmitRefuelRequest}
            disabled={submitting}
          >
            <Send size={18} className="me-2" />
            {submitting ? "Đang gửi..." : "Gửi yêu cầu đổ xăng"}
          </button>

          <button
            className="btn btn-outline-secondary w-100 fw-semibold"
            style={{ height: 52 }}
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            <RotateCcw size={18} className="me-2" />
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}
