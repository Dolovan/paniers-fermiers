"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; unit: string };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  consumer: { name: string; email: string; phone: string | null; address: string | null };
  items: OrderItem[];
}

const statusFlow: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "DELIVERED",
};

export default function FarmerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((auth) => {
        if (!auth.user || auth.user.role !== "FARMER") {
          router.push("/connexion");
          return;
        }
        return fetch("/api/orders").then((r) => r.json());
      })
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      fetchOrders();
    }
    setUpdating(null);
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const actionLabel: Record<string, string> = {
    PENDING: "Confirmer",
    CONFIRMED: "Commencer la préparation",
    PREPARING: "Marquer comme prêt",
    READY: "Marquer comme livré",
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Commandes à préparer</h1>
      <p className="text-gray-600 mb-8">Gérez les commandes de vos clients et préparez les colis</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: "ALL", label: "Toutes" },
          { value: "PENDING", label: "En attente" },
          { value: "CONFIRMED", label: "Confirmées" },
          { value: "PREPARING", label: "En préparation" },
          { value: "READY", label: "Prêtes" },
          { value: "DELIVERED", label: "Livrées" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === f.value ? "bg-green-700 text-white" : "bg-white text-gray-600 border hover:bg-green-50"
            }`}
          >
            {f.label}
            {f.value !== "ALL" && (
              <span className="ml-1.5 opacity-75">
                ({orders.filter((o) => o.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <p className="text-gray-500">Aucune commande{filter !== "ALL" ? " avec ce statut" : ""}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Order header */}
              <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span className="font-bold text-green-700">{order.totalAmount.toFixed(2)}€</span>
              </div>

              {/* Customer info */}
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                <p className="font-medium text-gray-800">{order.consumer.name}</p>
                <p className="text-sm text-gray-500">{order.consumer.email}</p>
                {order.consumer.phone && <p className="text-sm text-gray-500">Tel: {order.consumer.phone}</p>}
                {order.consumer.address && <p className="text-sm text-gray-500">Adresse: {order.consumer.address}</p>}
              </div>

              {/* Items */}
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Articles à préparer</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <span className="text-gray-800">{item.product.name}</span>
                        <span className="text-sm text-gray-400">({item.product.unit})</span>
                      </div>
                      <span className="text-gray-600">{(item.unitPrice * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {statusFlow[order.status] && (
                <div className="p-4 flex justify-end gap-2">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => updateStatus(order.id, "CANCELLED")}
                      disabled={updating === order.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Refuser
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(order.id, statusFlow[order.status])}
                    disabled={updating === order.id}
                    className="px-6 py-2 rounded-lg text-sm font-medium bg-green-700 text-white hover:bg-green-800 transition disabled:opacity-50"
                  >
                    {updating === order.id ? "..." : actionLabel[order.status]}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
