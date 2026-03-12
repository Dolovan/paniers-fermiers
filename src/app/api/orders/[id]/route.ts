import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = ["CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }

  // Farmers can only update orders containing their products
  if (session.role === "FARMER") {
    const hasFarmerProducts = order.items.some((item) => item.product.farmerId === session.userId);
    if (!hasFarmerProducts) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      consumer: { select: { name: true, email: true, phone: true, address: true } },
      items: { include: { product: { select: { name: true, unit: true } } } },
    },
  });

  return NextResponse.json(updated);
}
