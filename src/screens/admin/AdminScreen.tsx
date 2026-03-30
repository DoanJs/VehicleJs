import { signOut } from "firebase/auth";
import { Logout, TickSquare } from "iconsax-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpinnerComponent } from "../../components";
import { colors } from "../../constants/colors";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { auth } from "../../firebase.config";
import { CheckCircle } from "lucide-react";

export default function AdminScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const stats = [
    {
      title: "Tổng Số Xe",
      value: 12,
      icon: "bi bi-car-front-fill",
      bg: "primary",
    },
    { title: "Xe Đang Dùng", value: 5, icon: "bi bi-car-front", bg: "warning" },
    {
      title: "Xe Đang Bảo Trì",
      value: 2,
      icon: "bi bi-wrench-adjustable-circle-fill",
      bg: "danger",
    },
  ];

  const vehicles = [
    {
      id: "V001",
      name: "Xe Sirius 29A1",
      plate: "567.89",
      status: "Đang Sử Dụng",
      currentUser: "Nguyễn Văn A",
      pendingRequest: {
        type: "return",
        label: "Yêu cầu trả xe",
        requestedBy: "Nguyễn Văn A",
        time: "08/04/2024 10:30",
      },
    },
    {
      id: "V002",
      name: "Xe Honda City",
      plate: "30H-45678",
      status: "Đang Rảnh",
      currentUser: "Trống",
      pendingRequest: {
        type: "borrow",
        label: "Yêu cầu mượn xe",
        requestedBy: "Trần Thị Bích",
        time: "08/04/2024 09:00",
      },
    },
    {
      id: "V003",
      name: "Xe Vision",
      plate: "51F2-12345",
      status: "Đang Sử Dụng",
      currentUser: "Trống",
      pendingRequest: {
        type: "fuel",
        label: "Yêu cầu đổ xăng",
        requestedBy: "Lê Văn Cường",
        time: "08/04/2024 11:15",
      },
    },
    {
      id: "V004",
      name: "Xe Wave Alpha",
      plate: "59K1-67890",
      status: "Đang Bảo Trì",
      currentUser: "Trống",
      pendingRequest: null,
    },
    {
      id: "V005",
      name: "Xe tải Ford Ranger",
      plate: "51D-11223",
      status: "Đang Bảo Trì",
      currentUser: "Trống",
      pendingRequest: null,
    },
  ];

  const histories = [
    {
      employee: "Nguyễn Văn A",
      vehicle: "Xe Honda City",
      plate: "30H-45678",
      time: "08/04/2024 8:00 - 08/04/2024 12:00",
    },
    {
      employee: "Trần Thị Bích",
      vehicle: "Xe Sirius 29A1",
      plate: "29A1",
      time: "07/04/2024 10:30 - 07/04/2024 13:00",
    },
    {
      employee: "Lê Văn Cường",
      vehicle: "Xe Vision",
      plate: "51F2-12345",
      time: "06/04/2024 9:00 - 06/04/2024 11:00",
    },
  ];

  const fuelLogs = [
    {
      vehicle: "Xe Honda City",
      employee: "Nguyễn Văn A",
      liters: "20 L",
      cost: "500,000 đ",
      date: "08/04/2024",
    },
    {
      vehicle: "Xe Wave Alpha",
      employee: "Trần Thị Bích",
      liters: "5 L",
      cost: "100,000 đ",
      date: "07/04/2024",
    },
    {
      vehicle: "Xe Tải Ranger",
      employee: "Lê Văn Cường",
      liters: "30 L",
      cost: "900,000 đ",
      date: "06/04/2024",
    },
  ];

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "Đang Sử Dụng":
        return "bg-success-subtle text-success border border-success-subtle";
      case "Đang Rảnh":
        return "bg-warning-subtle text-warning border border-warning-subtle";
      case "Đang Bảo Trì":
        return "bg-danger-subtle text-danger border border-danger-subtle";
      default:
        return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    }
  };

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
  const handleApprove = (item: any) => {
    console.log("DUYỆT", item);
  };

  const handleReject = (item: any) => {
    console.log("TỪ CHỐI", item);
  };
  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid" style={{ maxWidth: "1400px" }}>
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-primary bg-gradient text-white border-0 py-3 px-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <h1 className="h2 mb-0 fw-bold">Quản Lý Xe &amp; Xăng</h1>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle border-0"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Admin Dashboard
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item">Tổng quan</button>
                    </li>
                    <li>
                      <button className="dropdown-item">Danh sách xe</button>
                    </li>
                    <li>
                      <button className="dropdown-item">Yêu cầu mượn</button>
                    </li>
                  </ul>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <img
                    src="https://via.placeholder.com/40x40.png?text=A"
                    alt="Admin"
                    className="rounded-circle border"
                    width="40"
                    height="40"
                  />
                  <span className="fw-semibold">Xin chào, Admin!</span>
                </div>

                <button className="btn btn-outline-light">
                  <div
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 16,
                      padding: 6,
                      borderRadius: 10,
                      background: colors.bacground,
                      cursor: "pointer",
                    }}
                    onClick={handleLogout}
                  >
                    {isLoading ? (
                      <SpinnerComponent />
                    ) : (
                      <Logout size={32} color="coral" variant="Bold" />
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
              <div className="col-12 col-xl-12">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h2 className="h4 mb-0 fw-bold">Danh Sách Xe</h2>
                    <span className="badge text-bg-warning">
                      {vehicles.filter((v) => v.pendingRequest).length} yêu cầu
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Xe</th>
                          <th>Biển Số</th>
                          <th>Trạng Thái</th>
                          <th>Người Đang Dùng</th>
                          <th>Mục đích</th>
                          <th>Yêu Cầu</th>
                          <th className="text-center">Thao Tác</th>
                        </tr>
                      </thead>

                      <tbody>
                        {vehicles.map((item) => (
                          <tr key={`${item.name}-${item.plate}`}>
                            <td className="fw-semibold">{item.name}</td>
                            <td>{item.plate}</td>

                            {/* trạng thái xe */}
                            <td>
                              <span
                                className={`badge rounded-pill px-3 py-2 ${getBadgeClass(item.status)}`}
                              >
                                {item.status}
                              </span>
                            </td>

                            <td>{`item.user`}</td>
                            <td>{`Yêu cầu K5`}</td>

                            {/* yêu cầu */}
                            <td>
                              {item.pendingRequest ? (
                                <div>
                                  <span
                                    className={`badge mb-1 ${
                                      item.pendingRequest.type === "borrow"
                                        ? "text-bg-primary"
                                        : item.pendingRequest.type === "return"
                                          ? "text-bg-success"
                                          : "text-bg-danger"
                                    }`}
                                  >
                                    {item.pendingRequest.label}
                                  </span>

                                  <div className="small text-muted">
                                    {item.pendingRequest.requestedBy}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">Không có</span>
                              )}
                            </td>

                            {/* thao tác */}
                            <td className="text-center">
                              {item.pendingRequest ? (
                                <div className="d-flex justify-content-center gap-2">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleApprove(item)}
                                  >
                                    <i className="bi bi-check-circle"></i>
                                  </button>

                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleReject(item)}
                                  >
                                    <i className="bi bi-x-circle"></i>
                                  </button>

                                  <button className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-eye"></i>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted small">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-12">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white py-3">
                    <h2 className="h4 mb-0 fw-bold">Lịch Sử Mượn Xe</h2>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Nhân Viên</th>
                          <th>Xe</th>
                          <th>Thời Gian</th>
                          <th>Hành Động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {histories.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{item.employee}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-car-front-fill text-primary"></i>
                                <div>
                                  <div>{item.vehicle}</div>
                                  <small className="text-muted">
                                    {item.plate}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>{item.time}</td>
                            <td>
                              <button className="btn btn-primary btn-sm px-3">
                                Chi Tiết{" "}
                                <i className="bi bi-chevron-right ms-1"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
