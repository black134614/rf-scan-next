import { NextResponse } from "next/server";

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwrrpggh2oQH0gE_9syzaM1gIG_fa_7U9eZMKS_Xl1qozlnhpWFHYBqom3kxxAdl56m/exec";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const action = searchParams.get("action");
  const cartonID = searchParams.get("cartonID");
  const operator = searchParams.get("operator");

  if (!action) {
    return NextResponse.json(
      { error: "Missing action" },
      { status: 400 }
    );
  }

  let url = `${GAS_URL}?action=${action}`;
  if (cartonID) url += `&cartonID=${encodeURIComponent(cartonID)}`;
  if (operator) url += `&operator=${encodeURIComponent(operator)}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  return NextResponse.json(data);
}
