const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("updater", {
  getState: () => ipcRenderer.invoke("updater:get-state"),
  check: () => ipcRenderer.invoke("updater:check"),
  download: () => ipcRenderer.invoke("updater:download"),
  install: () => ipcRenderer.invoke("updater:install"),
  onStateChange: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("updater:state", listener);

    return () => {
      ipcRenderer.removeListener("updater:state", listener);
    };
  }
});