"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  available: boolean;
  unit: string;
}

interface OrderSummary {
  total: number;
  pending: number;
  preparing: number;
  ready: number;
}

export default function FarmerDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderSummary>({ total: 0, pending: 0, preparing: 0, ready: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]).then(([auth, ordersData]) => {
      if (!auth.user || auth.user.role !== "FARMER") {
        router.push("/connexion");
        return;
      }
      // Get farmer's products
      fetch(`/api/products?farmerId=${auth.user.userId}`)
        .then((r) => r.json())
        .then((prods) => {
          setProducts(prods);
          setLoading(false);
        });

      if (Array.isArray(ordersData)) {
        setOrders({
          total: ordersData.length,
          pending: ordersData.filter((o: { status: string }) => o.status === "PENDING").length,
          preparing: ordersData.filter((o: { status: string }) => o.status === "PREPARING").length,
          ready: ordersData.filter((o: { status: string }) => o.status === "READY").length,
        });
      }
    });
  }, [router]);

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
        <Link
          href="/agriculteur/produits"
          className="bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 transition"
        >
          + Nouveau Produit
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Produits", value: products.length, color: "bg-blue-50 text-blue-700" },
          { label: "Commandes en attente", value: orders.pending, color: "bg-yellow-50 text-yellow-700" },
          { label: "En préparation", value: orders.preparing, color: "bg-orange-50 text-orange-700" },
          { label: "Prêts à récupérer", value: orders.ready, color: "bg-green-50 text-green-700" },
        ].map((stat) => (
          <div key={stat.label} className={`p-6 rounded-xl ${stat.color}`}>
            <p className="text-sm font-medium opacity-75">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/agriculteur/commandes"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4"
        >
          <span className="text-4xl">📦</span>
          <div>
            <h3 className="font-semibold text-gray-800">Voir les commandes</h3>
            <p className="text-sm text-gray-500">Gérer et préparer les colis</p>
          </div>
        </Link>
        <Link
          href="/agriculteur/produits"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4"
        >
          <span className="text-4xl">🌽</span>
          <div>
            <h3 className="font-semibold text-gray-800">Gérer mes produits</h3>
            <p className="text-sm text-gray-500">Ajouter, modifier ou retirer des produits</p>
          </div>
        </Link>
      </div>

      {/* Products list */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mes Produits</h2>
      {products.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <p className="text-gray-500">Vous n&apos;avez pas encore de produit</p>
          <Link href="/agriculteur/produits" className="text-green-700 font-medium hover:underline mt-2 inline-block">
            Ajouter mon premier produit
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produit</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Prix</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.price.toFixed(2)}€/{product.unit}</td>
                  <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.available ? "Disponible" : "Indisponible"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
