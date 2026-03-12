"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user));
  }, []);

  useEffect(() => {
    const updateCart = () => setCartCount(getCart().reduce((s, i) => s + i.quantity, 0));
    updateCart();
    window.addEventListener("cart-updated", updateCart);
    return () => window.removeEventListener("cart-updated", updateCart);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🌾</span> Paniers Fermiers
          </Link>

          <button className="sm:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden sm:flex items-center gap-6">
            <Link href="/marketplace" className="hover:text-green-200 transition">
              Marketplace
            </Link>

            {user ? (
              <>
                {user.role === "FARMER" && (
                  <>
                    <Link href="/agriculteur" className="hover:text-green-200 transition">
                      Mon Tableau de Bord
                    </Link>
                    <Link href="/agriculteur/commandes" className="hover:text-green-200 transition">
                      Commandes
                    </Link>
                  </>
                )}
                <Link href="/panier" className="hover:text-green-200 transition relative">
                  Panier
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <span className="text-green-200 text-sm">Bonjour, {user.name}</span>
                <button onClick={logout} className="bg-green-800 px-3 py-1 rounded hover:bg-green-900 transition">
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/connexion" className="bg-white text-green-700 px-4 py-1.5 rounded font-medium hover:bg-green-50 transition">
                  Connexion
                </Link>
                <Link href="/inscription" className="bg-green-800 px-4 py-1.5 rounded hover:bg-green-900 transition">
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden pb-4 flex flex-col gap-3">
            <Link href="/marketplace" className="hover:text-green-200">Marketplace</Link>
            {user ? (
              <>
                {user.role === "FARMER" && (
                  <>
                    <Link href="/agriculteur" className="hover:text-green-200">Tableau de Bord</Link>
                    <Link href="/agriculteur/commandes" className="hover:text-green-200">Commandes</Link>
                  </>
                )}
                <Link href="/panier" className="hover:text-green-200">Panier ({cartCount})</Link>
                <button onClick={logout} className="text-left hover:text-green-200">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/connexion" className="hover:text-green-200">Connexion</Link>
                <Link href="/inscription" className="hover:text-green-200">Inscription</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
