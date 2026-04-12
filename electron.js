const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

let mainWindow;
let updateState = {
  checking: false,
  available: false,
  downloaded: false,
  downloading: false,
  progress: 0,
  version: null,
  error: null
};

function sendUpdateState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updater:state", updateState);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
}

function setupAutoUpdater() {
  log.transports.file.level = "info";
  autoUpdater.logger = log;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on("checking-for-update", () => {
    updateState = {
      ...updateState,
      checking: true,
      error: null
    };
    log.info("Đang kiểm tra cập nhật...");
    sendUpdateState();
  });

  autoUpdater.on("update-available", (info) => {
    updateState = {
      ...updateState,
      checking: false,
      available: true,
      downloaded: false,
      downloading: false,
      progress: 0,
      version: info.version,
      error: null
    };
    log.info("Có bản cập nhật:", info.version);
    sendUpdateState();
  });

  autoUpdater.on("update-not-available", () => {
    updateState = {
      ...updateState,
      checking: false,
      available: false,
      downloaded: false,
      downloading: false,
      progress: 0,
      version: null,
      error: null
    };
    log.info("Không có bản cập nhật.");
    sendUpdateState();
  });

  autoUpdater.on("download-progress", (progressObj) => {
    updateState = {
      ...updateState,
      downloading: true,
      progress: Number(progressObj.percent || 0)
    };
    log.info(`Đang tải cập nhật: ${updateState.progress.toFixed(2)}%`);
    sendUpdateState();
  });

  autoUpdater.on("update-downloaded", (info) => {
    updateState = {
      ...updateState,
      downloading: false,
      downloaded: true,
      available: true,
      progress: 100,
      version: info.version,
      error: null
    };
    log.info("Đã tải xong bản cập nhật:", info.version);
    sendUpdateState();
  });

  autoUpdater.on("error", (err) => {
    updateState = {
      ...updateState,
      checking: false,
      downloading: false,
      error: err?.message || "Lỗi không xác định"
    };
    log.error("Lỗi cập nhật:", err);
    sendUpdateState();
  });

  ipcMain.handle("updater:get-state", async () => updateState);

  ipcMain.handle("updater:check", async () => {
    await autoUpdater.checkForUpdates();
    return updateState;
  });

  ipcMain.handle("updater:download", async () => {
    await autoUpdater.downloadUpdate();
    return { ok: true };
  });

  ipcMain.handle("updater:install", async () => {
    setImmediate(() => {
      autoUpdater.quitAndInstall();
    });
    return { ok: true };
  });
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  autoUpdater.checkForUpdates();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});