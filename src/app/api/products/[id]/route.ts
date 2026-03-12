import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "FARMER") {
    return NextResponse.json({ error: "Accès réservé aux agriculteurs" }, { status: 403 });
  }

  const { id } = params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || product.farmerId !== session.userId) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }

  const body = await request.json();
  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      price: body.price != null ? parseFloat(body.price) : undefined,
      unit: body.unit,
      stock: body.stock != null ? parseInt(body.stock) : undefined,
      category: body.category,
      imageUrl: body.imageUrl,
      available: body.available,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "FARMER") {
    return NextResponse.json({ error: "Accès réservé aux agriculteurs" }, { status: 403 });
  }

  const { id } = params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || product.farmerId !== session.userId) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
