import { signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { Logout } from "iconsax-react";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingOverlay, SpinnerComponent } from "../../components";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { auth, functions } from "../../firebase.config";
import {
  useBorrowReqStore,
  useRefuelReqStore,
  useReturnReqStore,
  useVehicleStore,
} from "../../zustand";
import VehicleItem from "../vehicle/VehicleItem";

export default function AdminScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  const { vehicles } = useVehicleStore();
  const { borrowReqs } = useBorrowReqStore();
  const { returnReqs } = useReturnReqStore();
  const { refuelReqs } = useRefuelReqStore();

  const rejectFunctionMap: Record<string, string> = {
    borrow: "rejectBorrowRequest",
    return: "rejectReturnRequest",
    refuel: "rejectRefuelRequest",
  };
  const stats = [
    {
      title: "Tổng Số Xe",
      value: vehicles.length,
      icon: "bi bi-car-front-fill",
      bg: "primary",
    },
    {
      title: "Xe Đang Dùng",
      value: vehicles.filter((v) => v.status === "borrowed").length,
      icon: "bi bi-car-front",
      bg: "warning",
    },
    {
      title: "Xe Đang Bảo Trì",
      value: vehicles.filter((v) => v.status === "maintenance").length,
      icon: "bi bi-wrench-adjustable-circle-fill",
      bg: "danger",
    },
  ];
  const requests = [...borrowReqs, ...returnReqs, ...refuelReqs];

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await signOut(auth);
      handleToastSuccess("Đăng xuất tài khoản thành công !");
      setIsLoading(false);
      navigate("/login", { replace: true }); // <-- chuyển hướng rõ ràng
    } catch (error) {
      handleToastError("Đăng xuất tài khoản thất bại !");
      console.error("Error signing out:", error);
    }
  };
  const handleApprove = async (item: any) => {
    setLoadingOverlay(true);

    try {
      let functionName = "";

      switch (item.type) {
        case "borrow":
          functionName = "approveBorrowRequest";
          break;
        case "return":
          functionName = "approveReturnRequest";
          break;
        case "refuel":
          functionName = "approveRefuelRequest";
          break;
        default:
          throw new Error("Loại yêu cầu không hợp lệ.");
      }

      const callable = httpsCallable(functions, functionName);
      const res: any = await callable({ requestId: item.id });

      handleToastSuccess(res.data.message);
      console.log("approve success:", res.data);
    } catch (error: any) {
      console.error("approve error:", error);
      const message = error?.message || "Có lỗi xảy ra";
      handleToastError(message);
    } finally {
      setLoadingOverlay(false);
    }
  };
  const handleReject = async (item: any) => {
    setLoadingOverlay(true);

    try {
      const functionName = rejectFunctionMap[item.type];

      if (!functionName) {
        throw new Error("Loại yêu cầu không hợp lệ.");
      }

      const callable = httpsCallable(functions, functionName);

      const res: any = await callable({
        requestId: item.id,
      });

      // KHÔNG cần update Zustand ở đây
      // onSnapshot sẽ tự cập nhật lại state

      handleToastSuccess(res.data.message);
      console.log("reject success:", res.data);
    } catch (error: any) {
      console.error("reject error:", error);
      const message = error?.message || "Có lỗi xảy ra";
      handleToastError(message);
    } finally {
      setLoadingOverlay(false);
    }
  };


  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid" style={{ maxWidth: "1400px" }}>
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* QUẢN LÝ XE & XĂNG */}
          <div className="card-header bg-primary bg-gradient text-white border-0 py-3 px-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div
                className="d-flex align-items-center px-3 text-white fw-semibold"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => navigate(-1)}
              >
                <ChevronLeft size={22} className="me-2" />
                Quay lại
              </div>
              <h1 className="h2 mb-0 fw-bold">Quản Lý Xe &amp; Xăng</h1>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src="https://media.daidoanket.vn/uploaded/images/2025/09/08/58aec47a-3cce-46a5-94e0-afe7814f298c.jpg"
                    alt="Admin"
                    className="rounded-circle border"
                    width="40"
                    height="40"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                  <span className="fw-semibold">Xin chào, Admin!</span>
                </div>

                <button className="btn">
                  <div
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 16,
                      padding: 6,
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                    onClick={handleLogout}
                  >
                    {isLoading ? (
                      <SpinnerComponent />
                    ) : (
                      <Logout size={32} color="#FFFFFF" variant="Bold" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="card-body p-4 bg-body-tertiary">
            <div className="row g-4 mb-4">
              {stats.map((item) => (
                <div className="col-12 col-md-6 col-xl-4" key={item.title}>
                  <div
                    className={`card border-0 shadow-sm text-white bg-${item.bg} h-100`}
                  >
                    <div className="card-body d-flex align-items-center gap-3 p-4">
                      <i className={`${item.icon} display-4`}></i>
                      <div>
                        <div className="fs-4 fw-semibold">{item.title}</div>
                        <div className="display-5 fw-bold lh-1">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4 mb-4">
              {/* BÊN TRÁI: DANH SÁCH XE */}
              <div className="col-12 col-xl-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h2 className="h4 mb-0 fw-bold">Danh Sách Xe</h2>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Xe</th>
                          <th>Biển Số</th>
                          <th>Số Km</th>
                          <th>Xăng</th>
                          <th>Trạng Thái</th>
                          <th>Người Dùng</th>
                          <th>Mục Đích</th>
                        </tr>
                      </thead>

                      <tbody>
                        {vehicles.map((item, ind) => (
                          <VehicleItem item={item} key={ind} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* BÊN PHẢI: DANH SÁCH YÊU CẦU */}
              <div className="col-12 col-xl-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h2 className="h4 mb-0 fw-bold">Yêu cầu cần xử lý</h2>
                    <span className="badge text-bg-primary">
                      {requests.filter((v) => v.status === "pending").length}
                    </span>
                  </div>
                  <div
                    className="card-body p-0"
                    style={{ overflowY: "scroll", height: "50%" }}
                  >
                    {requests.filter((v) => v.status === "pending").length >
                    0 ? (
                      <div className="list-group list-group-flush">
                        {requests
                          .filter((v) => v.status === "pending")
                          .map((item) => (
                            <div
                              key={`request-${item.vehicleName}-${item.plate}`}
                              className="list-group-item px-3 py-3"
                            >
                              {/* ROW TRÊN: chia trái - phải */}
                              <div className="d-flex justify-content-between align-items-start gap-3">
                                {/* BÊN TRÁI: THÔNG TIN XE */}
                                <div>
                                  <div className="fw-bold">
                                    Xe {item.vehicleName}
                                  </div>
                                  <div className="small text-muted">
                                    {item.plate}
                                  </div>
                                </div>

                                {/* BÊN PHẢI: YÊU CẦU */}
                                <div className="small text-muted">
                                  {item.requestedByName}
                                </div>
                                <div className="text-end">
                                  <span
                                    className={`badge mb-1 ${
                                      item.type === "borrow"
                                        ? "text-bg-primary"
                                        : item.type === "return"
                                          ? "text-bg-success"
                                          : "text-bg-warning"
                                    }`}
                                  >
                                    {item.type === "borrow"
                                      ? "Mượn xe"
                                      : item.type === "return"
                                        ? "Trả xe"
                                        : "Đổ xăng"}
                                  </span>
                                </div>
                              </div>

                              {/* BUTTON BÊN DƯỚI */}
                              <div className="d-flex gap-2 mt-3">
                                <button
                                  className="btn btn-success btn-sm flex-fill"
                                  onClick={() => handleApprove(item)}
                                >
                                  Duyệt
                                </button>

                                <button
                                  className="btn btn-danger btn-sm flex-fill"
                                  onClick={() => handleReject(item)}
                                >
                                  Từ chối
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted">
                        Không có yêu cầu nào
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="row g-4">
              <div className="col-12 col-xl-12">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white py-3">
                    <h2 className="h4 mb-0 fw-bold">Nhật Ký Đổ Xăng</h2>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Xe</th>
                          <th>Nhân Viên</th>
                          <th>Lít Xăng</th>
                          <th>Chi Phí</th>
                          <th>Ngày</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fuelLogs.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{item.vehicle}</td>
                            <td>{item.employee}</td>
                            <td>{item.liters}</td>
                            <td>{item.cost}</td>
                            <td>{item.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <LoadingOverlay show={loadingOverlay} />
    </div>
  );
}
