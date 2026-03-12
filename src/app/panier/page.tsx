"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, updateCartQuantity, clearCart, getCartTotal, CartItem } from "@/lib/cart";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  const handleQuantity = (productId: string, quantity: number) => {
    const updated = updateCartQuantity(productId, quantity);
    setCart(updated);
  };

  const handleOrder = async () => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/connexion");
        return;
      }
      setError(data.error);
      return;
    }

    clearCart();
    setCart([]);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Commande confirmée !</h1>
        <p className="text-gray-600 mb-8">
          Votre commande a été envoyée aux agriculteurs. Ils vont préparer vos paniers.
        </p>
        <button
          onClick={() => router.push("/marketplace")}
          className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
        >
          Retour au marketplace
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Votre panier est vide</h1>
        <button
          onClick={() => router.push("/marketplace")}
          className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
        >
          Découvrir les produits
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mon Panier</h1>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div key={item.productId} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.farmerName}</p>
              <p className="text-green-700 font-medium">
                {item.price.toFixed(2)}€ / {item.unit}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
              >
                -
              </button>
              <span className="w-8 text-center font-medium text-gray-800">{item.quantity}</span>
              <button
                onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
              >
                +
              </button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-gray-800">{(item.price * item.quantity).toFixed(2)}€</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg text-gray-600">Total</span>
          <span className="text-2xl font-bold text-green-700">{getCartTotal(cart).toFixed(2)}€</span>
        </div>
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading ? "Validation..." : "Valider la commande"}
        </button>
        <button
          onClick={() => {
            clearCart();
            setCart([]);
          }}
          className="w-full text-red-500 py-2 mt-2 text-sm hover:text-red-700"
        >
          Vider le panier
        </button>
      </div>
    </div>
  );
}
