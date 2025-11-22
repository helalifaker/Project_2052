// Runs 30-year calculation off main thread
self.onmessage = (e: MessageEvent) => {
  // Placeholder for calculation logic
  // const result = calculateFinancials(e.data);
  // self.postMessage(result);
  console.log("Worker received:", e.data);
  self.postMessage({ status: "done", result: null });
};
