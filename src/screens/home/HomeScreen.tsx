import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { SpaceComponent, SpinnerComponent } from "../../components";
import { useUserStore } from "../../zustand";
import { colors } from "../../constants/colors";
import { Logout } from "iconsax-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.config";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [scanning, setScanning] = useState(false);
  // const [scanResult, setScanResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const isStartingRef = useRef(false);

  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;

    const startScanner = async () => {
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode("reader");
        }

        const scanner = scannerRef.current;

        if (isRunningRef.current || isStartingRef.current) return;

        isStartingRef.current = true;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          async (decodedText) => {
            if (cancelled) return;
            if (!isRunningRef.current) return;

            const vehicleId = decodedText.trim();

            try {
              await scanner.stop();
            } catch (error) {
              console.error("Lỗi stop scanner:", error);
            } finally {
              isRunningRef.current = false;
              setScanning(false);

              // 👉 redirect sang trang vehicle details
              navigate(`/vehicleScan/${vehicleId}`);
            }
          },
          () => {},
        );

        if (!cancelled) {
          isRunningRef.current = true;
        }
      } catch (error) {
        console.error("Không mở được camera:", error);
        setScanning(false);
      } finally {
        isStartingRef.current = false;
      }
    };

    startScanner();

    return () => {
      cancelled = true;

      const stopScanner = async () => {
        const scanner = scannerRef.current;
        if (!scanner) return;
        if (!isRunningRef.current) return;

        try {
          await scanner.stop();
        } catch (error) {
          console.error("Lỗi cleanup scanner:", error);
        } finally {
          isRunningRef.current = false;
        }
      };

      stopScanner();
    };
  }, [scanning, navigate]);

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

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="bg-white border" style={{ width: 320 }}>
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

        <div className="text-center py-3 border-bottom">
          <h6 className="fw-bold text-uppercase m-0 text-primary">
            Quản lý xe nội bộ
          </h6>
        </div>

        {scanning ? (
          <div className="p-3">
            <div id="reader" style={{ width: "100%" }} />

            <button
              className="btn btn-secondary w-100 mt-3"
              onClick={async () => {
                const scanner = scannerRef.current;
                if (!scanner || !isRunningRef.current) {
                  setScanning(false);
                  return;
                }

                try {
                  await scanner.stop();
                } catch (error) {
                  console.error("Lỗi khi tắt camera:", error);
                } finally {
                  isRunningRef.current = false;
                  setScanning(false);
                }
              }}
            >
              Tắt camera
            </button>
          </div>
        ) : (
          <div className="text-center px-4 py-5">
            <div
              className="d-flex justify-content-center align-items-center mx-auto mb-4"
              style={{
                width: 140,
                height: 140,
                backgroundColor: "#1976e9",
                borderRadius: "50%",
              }}
            >
              <Camera size={60} color="white" />
            </div>

            <button
              className="btn w-100 fw-bold text-uppercase"
              style={{
                backgroundColor: "#1976e9",
                color: "white",
                height: 46,
              }}
              onClick={() => setScanning(true)}
            >
              Quét QR xe
            </button>

            <div className="mt-5 pt-3 border-top text-muted small">
              Vui lòng quét mã QR trên xe của bạn.
            </div>
            <SpaceComponent height={20} />

            {user && user.role === "admin" && (
              <h6
                className="fw-bold text-uppercase m-0 text-primary"
                onClick={() => navigate(`/admin`)}
                style={{
                  cursor: "pointer",
                }}
              >
                Trang quản trị
              </h6>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
