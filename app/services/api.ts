export const getPendingCartons = async () => {
  const res = await fetch("/api/carton?action=list");
  return res.json();
};

export const scanCarton = async (cartonID: string, operator: string) => {
  const res = await fetch(
    `/api/carton?action=scan&cartonID=${encodeURIComponent(cartonID)}&operator=${encodeURIComponent(operator)}`
  );
  return res.json();
};
