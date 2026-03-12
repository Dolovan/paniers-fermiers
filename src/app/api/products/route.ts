import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const farmerId = searchParams.get("farmerId");

  const where: Record<string, unknown> = { available: true };
  if (category) where.category = category;
  if (farmerId) where.farmerId = farmerId;

  const products = await prisma.product.findMany({
    where,
    include: { farmer: { select: { name: true, farmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "FARMER") {
    return NextResponse.json({ error: "Accès réservé aux agriculteurs" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, price, unit, stock, category, imageUrl } = body;

  if (!name || !description || price == null || !category) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      unit: unit || "panier",
      stock: parseInt(stock) || 0,
      category,
      imageUrl,
      farmerId: session.userId,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
