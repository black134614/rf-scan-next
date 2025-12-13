"use client";

import { useEffect, useState } from "react";
import { getPendingCartons, scanCarton } from "../services/api";


export default function ScanPage() {
  const [input, setInput] = useState("");
  const [scanned, setScanned] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getPendingCartons().then(res => setTotal(res.total));
  }, []);

  const handleScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input) {
      const res = await scanCarton(input, "OPS01");
      if (res.success) {
        setScanned(s => s + 1);
        setInput("");
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <main>
      <h1>Scan Carton</h1>
      <h2>{scanned} / {total}</h2>

      <input
        autoFocus
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleScan}
      />
    </main>
  );
}
