import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a farmer
  const farmer = await prisma.user.create({
    data: {
      email: "fermier@example.com",
      password: await bcrypt.hash("password123", 12),
      name: "Jean Dupont",
      role: "FARMER",
      phone: "06 12 34 56 78",
      address: "12 Chemin de la Ferme, 31000 Toulouse",
      farmName: "La Ferme du Soleil",
      farmDescription: "Ferme familiale bio depuis 3 générations. Légumes, fruits et produits laitiers de qualité.",
    },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Panier de légumes de saison",
        description: "Un assortiment de légumes frais de saison : tomates, courgettes, aubergines, poivrons, salades",
        price: 25.0,
        unit: "panier",
        stock: 20,
        category: "paniers",
        farmerId: farmer.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Panier de fruits",
        description: "Pommes, poires et fruits de saison cueillis à maturité",
        price: 18.5,
        unit: "panier",
        stock: 15,
        category: "fruits",
        farmerId: farmer.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Oeufs fermiers plein air",
        description: "Oeufs de poules élevées en plein air, nourries aux grains bio",
        price: 4.5,
        unit: "douzaine",
        stock: 30,
        category: "oeufs",
        farmerId: farmer.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Fromage de chèvre frais",
        description: "Fromage artisanal au lait cru de nos chèvres",
        price: 6.0,
        unit: "pièce",
        stock: 12,
        category: "produits-laitiers",
        farmerId: farmer.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Miel de fleurs",
        description: "Miel toutes fleurs récolté dans nos ruches",
        price: 12.0,
        unit: "pot",
        stock: 25,
        category: "miel",
        farmerId: farmer.id,
      },
    }),
  ]);

  // Create a consumer
  const consumer = await prisma.user.create({
    data: {
      email: "client@example.com",
      password: await bcrypt.hash("password123", 12),
      name: "Marie Martin",
      role: "CONSUMER",
      phone: "06 98 76 54 32",
      address: "45 Rue de la République, 31000 Toulouse",
    },
  });

  // Create a sample order
  await prisma.order.create({
    data: {
      consumerId: consumer.id,
      totalAmount: 43.5,
      status: "PENDING",
      items: {
        create: [
          { productId: products[0].id, quantity: 1, unitPrice: 25.0 },
          { productId: products[1].id, quantity: 1, unitPrice: 18.5 },
        ],
      },
    },
  });

  console.log("Base de données peuplée avec succès !");
  console.log("Agriculteur: fermier@example.com / password123");
  console.log("Consommateur: client@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
