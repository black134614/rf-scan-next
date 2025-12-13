"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPendingCartons } from "./services/api";

export default function Dashboard() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getPendingCartons().then(res => setTotal(res.total || 0));
  }, []);

  return (
    <main style={{ padding: 40, textAlign: "center" }}>
      <h1>📦 RF Scan Dashboard</h1>
      <h2>Tổng carton cần scan</h2>
      <p style={{ fontSize: 48, fontWeight: "bold" }}>{total}</p>

      <Link href="/scan">
        <button
          style={{
            fontSize: 20,
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          ➤ Vào màn hình scan
        </button>
      </Link>
    </main>
  );
}
