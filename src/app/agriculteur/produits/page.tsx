"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  available: boolean;
}

const categories = [
  { value: "legumes", label: "Légumes" },
  { value: "fruits", label: "Fruits" },
  { value: "produits-laitiers", label: "Produits Laitiers" },
  { value: "viandes", label: "Viandes" },
  { value: "oeufs", label: "Oeufs" },
  { value: "miel", label: "Miel" },
  { value: "paniers", label: "Paniers Composés" },
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  unit: "panier",
  stock: "",
  category: "paniers",
};

export default function FarmerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  const fetchProducts = async () => {
    const auth = await fetch("/api/auth/me").then((r) => r.json());
    if (!auth.user || auth.user.role !== "FARMER") {
      router.push("/connexion");
      return;
    }
    setUserId(auth.user.userId);
    const prods = await fetch(`/api/products?farmerId=${auth.user.userId}`).then((r) => r.json());
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [router]);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const url = editing ? `/api/products/${editing}` : "/api/products";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    fetchProducts();
  };

  const startEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      unit: product.unit,
      stock: product.stock.toString(),
      category: product.category,
    });
    setEditing(product.id);
    setShowForm(true);
  };

  const toggleAvailability = async (product: Product) => {
    await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !product.available }),
    });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mes Produits</h1>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditing(null);
            setShowForm(!showForm);
          }}
          className="bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 transition"
        >
          {showForm ? "Annuler" : "+ Nouveau Produit"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editing ? "Modifier le produit" : "Ajouter un produit"}
          </h2>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                placeholder="ex: Panier de légumes de saison"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
                rows={3}
                placeholder="Décrivez votre produit..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <select
                value={form.unit}
                onChange={(e) => update("unit", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              >
                <option value="panier">Panier</option>
                <option value="kg">Kilogramme</option>
                <option value="pièce">Pièce</option>
                <option value="douzaine">Douzaine</option>
                <option value="litre">Litre</option>
                <option value="pot">Pot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock disponible</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-green-700 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : editing ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products list */}
      {products.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-gray-500">Commencez par ajouter votre premier produit</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {product.available ? "Dispo" : "Indispo"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {product.price.toFixed(2)}€/{product.unit} — Stock: {product.stock}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAvailability(product)}
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 text-gray-700"
                >
                  {product.available ? "Désactiver" : "Activer"}
                </button>
                <button
                  onClick={() => startEdit(product)}
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 text-gray-700"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
