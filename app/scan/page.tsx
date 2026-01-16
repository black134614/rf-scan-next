/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPendingCartons, scanCarton } from "../services/api";

export default function ScanPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [input, setInput] = useState("");
  const [scanned, setScanned] = useState(0);
  const [total, setTotal] = useState(0);

  // panel danh sách
  const [showList, setShowList] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [cartons, setCartons] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // thông báo scan (thay vì alert)
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

  const remaining = useMemo(() => Math.max(total - scanned, 0), [total, scanned]);

  const focusInput = () => {
    // RF thường “bắn” vào ô đang focus
    inputRef.current?.focus();
  };

  const loadPending = async () => {
    try {
      setError("");
      setLoadingList(true);
      const res = await getPendingCartons();
      setTotal(res.total || 0);
      setCartons(res.cartons || []);
    } catch (e: any) {
      setError(e?.message || "Không load được danh sách");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadPending().finally(() => focusInput());
  }, []);

  const showToast = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 1200);
  };

  const handleScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const cartonID = input.trim();
    if (!cartonID) return;

    const res = await scanCarton(cartonID, "OPS01");

    if (res.success) {
      setScanned((s) => s + 1);
      setInput("");
      showToast("ok", `OK: ${cartonID}`);
      // cập nhật list/tổng để carton vừa scan biến mất khỏi list
      loadPending();
      // đảm bảo focus lại
      requestAnimationFrame(focusInput);
    } else {
      showToast("err", res.error || "Lỗi scan");
      // chọn lại để bắn lại nhanh
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  };

  return (
    <main
      onClick={focusInput}
      style={{
        minHeight: "100vh",
        padding: 12,
        background: "#0b1220",
        color: "#e8eefc",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12,
          borderRadius: 14,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 18, opacity: 0.9 }}>RF SCAN</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Scan Carton</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              setShowList((v) => !v);
              loadPending();
              requestAnimationFrame(focusInput);
            }}
            style={btnBig(showList ? "#2563eb" : "#111827")}
          >
            📋 {showList ? "Ẩn DS" : "DS chưa scan"}
          </button>

          <button
            onClick={() => {
              loadPending();
              requestAnimationFrame(focusInput);
            }}
            disabled={loadingList}
            style={btnBig("#111827", loadingList)}
          >
            {loadingList ? "Đang tải..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: showList ? "1fr 1fr" : "1fr",
          gap: 12,
        }}
      >
        {/* Scan block */}
        <section
          style={{
            padding: 14,
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Stat label="Đã scan" value={scanned} />
            <Stat label="Tổng" value={total} />
            <Stat label="Còn lại" value={remaining} highlight />
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 6 }}>
              Quét carton (Enter tự gửi)
            </div>

            <input
              ref={inputRef}
              autoFocus
              inputMode="none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleScan}
              placeholder="Bắn mã carton..."
              style={{
                width: "100%",
                padding: "18px 16px",
                fontSize: 26,
                fontWeight: 800,
                borderRadius: 14,
                border: "2px solid rgba(255,255,255,0.18)",
                outline: "none",
                background: "#020617",
                color: "#e8eefc",
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                onClick={() => {
                  setInput("");
                  requestAnimationFrame(focusInput);
                }}
                style={btnBig("#374151")}
              >
                🧹 Xóa
              </button>

              <button
                onClick={() => {
                  // thao tác cho trường hợp RF không gửi Enter
                  if (!input.trim()) return;
                  // giả lập Enter
                  const fake = { key: "Enter" } as any;
                  handleScan(fake);
                }}
                style={btnBig("#16a34a")}
              >
                ✅ Gửi
              </button>
            </div>

            <div style={{ marginTop: 10, opacity: 0.85, fontSize: 14 }}>
              Tip: chạm màn hình bất kỳ để focus lại ô scan.
            </div>
          </div>
        </section>

        {/* List panel */}
        {showList && (
          <section
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "calc(100vh - 170px)",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  Danh sách chưa scan
                </div>
                <div style={{ opacity: 0.85, marginTop: 2 }}>
                  {cartons.length} carton
                </div>
              </div>

              <button
                onClick={() => {
                  setShowList(false);
                  requestAnimationFrame(focusInput);
                }}
                style={btnSmall("#111827")}
              >
                ✖
              </button>
            </div>

            {error && (
              <div style={{ marginTop: 12, color: "#fecaca" }}>{error}</div>
            )}

            {!error && loadingList && (
              <div style={{ marginTop: 12 }}>Đang tải danh sách...</div>
            )}

            {!error && !loadingList && cartons.length === 0 && (
              <div style={{ marginTop: 12 }}>Không còn carton nào 🎉</div>
            )}

            {!error && !loadingList && cartons.length > 0 && (
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {cartons.map((id) => (
                  <div
                    key={id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "#020617",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                    }}
                  >
                    {id}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: 12,
            padding: "14px 16px",
            borderRadius: 14,
            fontSize: 18,
            fontWeight: 800,
            background: toast.type === "ok" ? "rgba(22,163,74,0.95)" : "rgba(220,38,38,0.95)",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          {toast.msg}
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        flex: "1 1 110px",
        padding: 12,
        borderRadius: 14,
        background: highlight ? "rgba(37,99,235,0.22)" : "rgba(0,0,0,0.18)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 900, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function btnBig(bg: string, disabled?: boolean): React.CSSProperties {
  return {
    background: bg,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: "14px 14px",
    fontSize: 18,
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    minWidth: 130,
  };
}

function btnSmall(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  };
}
