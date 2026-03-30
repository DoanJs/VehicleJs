import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Send, RotateCcw } from "lucide-react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase.config";

type FuelLevel = "full" | "almost_full" | "low" | "empty";
type CleanStatus = "clean" | "dirty";

type Vehicle = {
  id: string;
  name: string;
  plate: string;
  status: "available" | "borrowed";
  currentKm?: number;
  borrowedAt?: any;
  borrowedByName?: string;
  borrowedFuelLevel?: FuelLevel;
  imageUrl: string
};

export default function VehicleReturnScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [currentKm, setCurrentKm] = useState("");
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>("full");
  const [cleanStatus, setCleanStatus] = useState<CleanStatus>("clean");
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
          currentKm: data.currentKm || 0,
          borrowedAt: data.borrowedAt || null,
          borrowedByName: data.borrowedByName || "Chưa có thông tin",
          borrowedFuelLevel: data.borrowedFuelLevel || "full",
          imageUrl: data.imageUrl || ''
        };

        setVehicle(nextVehicle);
        setCurrentKm(String(nextVehicle.currentKm || ""));
        setFuelLevel(nextVehicle.borrowedFuelLevel || "full");
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu xe.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const kmDiff = useMemo(() => {
    const current = Number(currentKm || 0);
    const before = Number(vehicle?.currentKm || 0);
    if (!current || current < before) return 0;
    return current - before;
  }, [currentKm, vehicle?.currentKm]);

  const fuelLabelMap: Record<FuelLevel, string> = {
    full: "Đầy",
    almost_full: "Gần đầy",
    low: "Còn ít",
    empty: "Hết",
  };

  const cleanLabelMap: Record<CleanStatus, string> = {
    clean: "Sạch",
    dirty: "Bẩn",
  };

  const validateForm = () => {
    if (!vehicle) return "Không có dữ liệu xe.";
    if (!currentKm.trim()) return "Vui lòng nhập số km hiện tại.";

    const kmNumber = Number(currentKm);
    if (Number.isNaN(kmNumber)) return "Số km không hợp lệ.";
    if (kmNumber < Number(vehicle.currentKm || 0)) {
      return "Số km hiện tại không được nhỏ hơn số km lúc mượn.";
    }

    if (note.length > 200) return "Ghi chú tối đa 200 ký tự.";
    return "";
  };

  const handleSubmitReturnRequest = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!vehicle) return;

    try {
      setSubmitting(true);
      setError("");

      await addDoc(collection(db, "return_requests"), {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        plate: vehicle.plate,
        currentKm: Number(currentKm),
        kmIncrease: kmDiff,
        fuelLevel,
        cleanStatus,
        note: note.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      navigate(`/returnVehicleSuccess/${vehicle.id}`, {
        state: {
          vehicleName: vehicle.name,
          plate: vehicle.plate,
          currentKm: Number(currentKm),
          kmIncrease: kmDiff,
          fuelLevelLabel: fuelLabelMap[fuelLevel],
          cleanStatusLabel: cleanLabelMap[cleanStatus],
        },
      });
    } catch (err) {
      console.error(err);
      setError("Không gửi được yêu cầu trả xe.");
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
      className="btn fw-semibold"
      onClick={onClick}
      style={{
        minHeight: 48,
        border: "1px solid #d7dce2",
        backgroundColor: active ? "#e9f3ff" : "#fff",
        color: active ? "#1565c0" : "#1f2937",
        boxShadow: active ? "inset 0 0 0 1px #4da3ff" : "none",
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
          TRẢ XE
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
                      backgroundColor: "#dff5e8",
                      color: "#1a8f52",
                      fontSize: 14,
                      padding: "8px 12px",
                    }}
                  >
                    Đang được sử dụng
                  </span>
                </div>

                <div className="text-muted mt-2" style={{ fontSize: 14 }}>
                  Người mượn: {vehicle.borrowedByName}
                </div>
              </div>
            </div>
          </div>

          <div className="fw-bold mb-3" style={{ fontSize: 28 }}>
            THÔNG TIN TRẢ XE
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Số km hiện tại</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={currentKm}
                onChange={(e) => setCurrentKm(e.target.value)}
                placeholder="Nhập số km hiện tại"
              />
              <span className="input-group-text">km</span>
            </div>
            <div className="form-text">
              {kmDiff > 0
                ? `(Tăng ${kmDiff.toLocaleString("vi-VN")} km so với lúc mượn)`
                : "Nhập số km hiện tại của xe."}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mức xăng hiện tại</label>
            <div className="row g-2">
              <div className="col-6 col-md-3">
                {renderOptionButton(fuelLevel === "full", "Đầy", () =>
                  setFuelLevel("full"),
                )}
              </div>
              <div className="col-6 col-md-3">
                {renderOptionButton(
                  fuelLevel === "almost_full",
                  "Gần đầy",
                  () => setFuelLevel("almost_full"),
                )}
              </div>
              <div className="col-6 col-md-3">
                {renderOptionButton(fuelLevel === "low", "Còn ít", () =>
                  setFuelLevel("low"),
                )}
              </div>
              <div className="col-6 col-md-3">
                {renderOptionButton(fuelLevel === "empty", "Hết", () =>
                  setFuelLevel("empty"),
                )}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Tình trạng xe</label>
            <div className="row g-2">
              <div className="col-6">
                {renderOptionButton(cleanStatus === "clean", "Sạch", () =>
                  setCleanStatus("clean"),
                )}
              </div>
              <div className="col-6">
                {renderOptionButton(cleanStatus === "dirty", "Bẩn", () =>
                  setCleanStatus("dirty"),
                )}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Ghi chú (nếu có vấn đề)
            </label>
            <textarea
              className="form-control"
              rows={4}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lý do nếu xe bẩn hoặc xăng chưa đầy..."
            />
            <div className="text-end form-text">{note.length}/200</div>
          </div>

          <div
            className="rounded p-3 mb-3"
            style={{ backgroundColor: "#eaf4ff", border: "1px solid #d4e7ff" }}
          >
            <div className="fw-bold text-primary mb-2">
              XÁC NHẬN TRÁCH NHIỆM
            </div>
            <div>• Tôi xác nhận đã đổ xăng đầy bình trước khi trả xe.</div>
            <div>• Tôi xác nhận đã rửa xe sạch sẽ.</div>
            <div>• Nếu chưa thực hiện, admin sẽ liên hệ để xử lý.</div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button
            className="btn w-100 text-white fw-bold mb-2"
            style={{ backgroundColor: "#123f78", height: 52 }}
            onClick={handleSubmitReturnRequest}
            disabled={submitting}
          >
            <Send size={18} className="me-2" />
            {submitting ? "Đang gửi..." : "Gửi yêu cầu trả xe"}
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
