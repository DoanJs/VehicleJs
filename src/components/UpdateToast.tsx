import { useEffect, useRef, useState } from "react";
import { toast, Id } from "react-toastify";

type UpdateState = {
  checking: boolean;
  available: boolean;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
  version: string | null;
  error: string | null;
};

type ToastMode = "idle" | "available" | "downloading" | "downloaded" | "error";

const buttonBase: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const primaryButton: React.CSSProperties = {
  ...buttonBase,
  background: "#2563eb",
  color: "#fff",
};

const secondaryButton: React.CSSProperties = {
  ...buttonBase,
  background: "#eef2ff",
  color: "#1e3a8a",
};

const ghostButton: React.CSSProperties = {
  ...buttonBase,
  background: "#f3f4f6",
  color: "#374151",
};

function ToastShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: 320,
        maxWidth: 320,
        wordWrap: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "normal",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
        {title}
      </div>
      {description ? (
        <div
          style={{
            fontSize: 14,
            color: "#4b5563",
            marginBottom: 12,
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {description}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div
        style={{
          width: "100%",
          height: 10,
          background: "#e5e7eb",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${safe}%`,
            height: "100%",
            background: "linear-gradient(90deg, #2563eb, #60a5fa)",
            transition: "width 180ms ease",
          }}
        />
      </div>
      <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>
        {safe.toFixed(0)}%
      </div>
    </div>
  );
}

export default function UpdateToast() {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    available: false,
    downloaded: false,
    downloading: false,
    progress: 0,
    version: null,
    error: null,
  });

  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);
  const toastIdRef = useRef<Id | null>(null);
  const modeRef = useRef<ToastMode>("idle");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // const init = async () => {
    //   const current = await window.updater.getState();
    //   setState(current);

    //   unsubscribe = window.updater.onStateChange((next) => {
    //     setState(next);
    //   });
    // };
    const init = async () => {
      if (!window.updater) return;

      const current = await window.updater.getState();
      setState(current);

      unsubscribe = window.updater.onStateChange((next) => {
        setState(next);
      });
    };

    init();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const currentVersion = state.version ?? null;

    if (state.error) {
      showErrorToast(state.error);
      return;
    }

    if (
      state.available &&
      !state.downloading &&
      !state.downloaded &&
      currentVersion &&
      dismissedVersion !== currentVersion
    ) {
      showAvailableToast(currentVersion);
      return;
    }

    if (state.downloading) {
      showDownloadingToast(state.progress);
      return;
    }

    if (state.downloaded) {
      showDownloadedToast(currentVersion);
    }
  }, [state, dismissedVersion]);

  const closeToast = () => {
    if (toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
      modeRef.current = "idle";
    }
  };

  const ensureToast = (
    content: React.ReactNode,
    type: "info" | "success" | "error" = "info",
  ) => {
    if (toastIdRef.current === null) {
      toastIdRef.current = toast(content, {
        type,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
      });
    } else {
      toast.update(toastIdRef.current, {
        render: content,
        type,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
      });
    }
  };

  const showAvailableToast = (version: string) => {
    if (modeRef.current === "available") return;
    modeRef.current = "available";

    ensureToast(
      <ToastShell
        title="Có bản cập nhật mới"
        description={`Phiên bản ${version} đã sẵn sàng. Bạn muốn tải về ngay bây giờ chứ?`}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={primaryButton}
            onClick={async () => {
              modeRef.current = "downloading";
              await window.updater?.download();
            }}
          >
            Tải ngay
          </button>

          <button
            style={ghostButton}
            onClick={() => {
              setDismissedVersion(version);
              closeToast();
            }}
          >
            Để sau
          </button>
        </div>
      </ToastShell>,
      "info",
    );
  };

  const showDownloadingToast = (progress: number) => {
    modeRef.current = "downloading";

    ensureToast(
      <ToastShell
        title="Đang tải bản cập nhật"
        description="Ứng dụng đang tải bản mới. Bạn có thể tiếp tục sử dụng bình thường."
      >
        <ProgressBar value={progress} />
      </ToastShell>,
      "info",
    );
  };

  const showDownloadedToast = (version: string | null) => {
    if (modeRef.current === "downloaded") return;
    modeRef.current = "downloaded";

    ensureToast(
      <ToastShell
        title="Đã tải xong bản cập nhật"
        description={
          version
            ? `Phiên bản ${version} đã tải xong. Bạn muốn cài đặt và khởi động lại ngay không?`
            : "Bản cập nhật đã tải xong. Bạn muốn cài đặt và khởi động lại ngay không?"
        }
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={primaryButton}
            onClick={async () => {
              await window.updater?.install();
            }}
          >
            Cài đặt ngay
          </button>

          <button
            style={secondaryButton}
            onClick={() => {
              closeToast();
            }}
          >
            Để sau
          </button>
        </div>
      </ToastShell>,
      "success",
    );
  };

  const showErrorToast = (message: string) => {
    modeRef.current = "error";

    ensureToast(
      <ToastShell title="Không thể cập nhật" description={message}>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={ghostButton} onClick={() => closeToast()}>
            Đóng
          </button>
        </div>
      </ToastShell>,
      "error",
    );
  };

  return null;
}
