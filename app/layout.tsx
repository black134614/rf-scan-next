import "./globals.css";

export const metadata = {
  title: "RF Scan App",
  description: "Mini app scan carton bằng RF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="app-container">
          <header className="app-header">
            <h1>📦 RF SCAN SYSTEM</h1>
          </header>

          <main className="app-main">
            {children}
          </main>

          <footer className="app-footer">
            <span>© 2025 Warehouse Ops</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
