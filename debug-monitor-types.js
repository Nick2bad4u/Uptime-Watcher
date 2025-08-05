// Debug script to test monitor types IPC
(async () => {
    console.log("Testing monitor types IPC...");

    try {
        const response = await window.electronAPI.monitorTypes.getMonitorTypes();
        console.log("Raw IPC response:", response);
        console.log("Response type:", typeof response);
        console.log("Response keys:", Object.keys(response || {}));

        if (response && typeof response === "object") {
            console.log("Has success property:", "success" in response);
            console.log("Has isValid property:", "isValid" in response);
            console.log("success value:", response.success);
            console.log("isValid value:", response.isValid);
            console.log("data value:", response.data);
        }

        // Try the safeExtractIpcData function
        const { safeExtractIpcData } = await import("./src/types/ipc.js");
        const extractedData = safeExtractIpcData(response, []);
        console.log("Extracted data:", extractedData);
    } catch (error) {
        console.error("Error testing monitor types:", error);
    }
})();
