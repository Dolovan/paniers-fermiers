import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const where =
    session.role === "FARMER"
      ? { items: { some: { product: { farmerId: session.userId } } } }
      : { consumerId: session.userId };

  const orders = await prisma.order.findMany({
    where,
    include: {
      consumer: { select: { name: true, email: true, phone: true, address: true } },
      items: {
        include: {
          product: {
            select: { name: true, unit: true, farmerId: true, farmer: { select: { name: true, farmName: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // For farmers, filter items to only show their products
  if (session.role === "FARMER") {
    const filtered = orders.map((order) => ({
      ...order,
      items: order.items.filter((item) => item.product.farmerId === session.userId),
    }));
    return NextResponse.json(filtered);
  }

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { items } = await request.json();

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Le panier est vide" }, { status: 400 });
  }

  // Verify products and calculate total
  let totalAmount = 0;
  const orderItems: { productId: string; quantity: number; unitPrice: number }[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || !product.available) {
      return NextResponse.json({ error: `Produit ${item.productId} non disponible` }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stock insuffisant pour ${product.name}` }, { status: 400 });
    }
    totalAmount += product.price * item.quantity;
    orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
  }

  const order = await prisma.order.create({
    data: {
      consumerId: session.userId,
      totalAmount,
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
  });

  // Decrease stock
  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  return NextResponse.json(order, { status: 201 });
}
