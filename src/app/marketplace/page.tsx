"use client";

import { useEffect, useState } from "react";
import { addToCart } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  imageUrl: string | null;
  farmer: { name: string; farmName: string | null };
}

const categories = [
  { value: "", label: "Tous" },
  { value: "legumes", label: "Légumes" },
  { value: "fruits", label: "Fruits" },
  { value: "produits-laitiers", label: "Produits Laitiers" },
  { value: "viandes", label: "Viandes" },
  { value: "oeufs", label: "Oeufs" },
  { value: "miel", label: "Miel" },
  { value: "paniers", label: "Paniers Composés" },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = category ? `/api/products?category=${category}` : "/api/products";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, [category]);

  const handleAdd = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      farmerName: product.farmer.farmName || product.farmer.name,
      unit: product.unit,
    });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Marketplace</h1>
      <p className="text-gray-600 mb-8">Découvrez les produits frais de nos agriculteurs</p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat.value
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 hover:bg-green-50 border"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun produit disponible pour le moment</p>
          <p className="text-gray-400 mt-2">Revenez bientôt, nos agriculteurs préparent leurs paniers !</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-6xl">
                  {product.category === "legumes" ? "🥬" :
                   product.category === "fruits" ? "🍎" :
                   product.category === "produits-laitiers" ? "🧀" :
                   product.category === "viandes" ? "🥩" :
                   product.category === "oeufs" ? "🥚" :
                   product.category === "miel" ? "🍯" : "🧺"}
                </span>
              </div>
              <div className="p-4">
                <div className="text-xs text-green-600 font-medium mb-1">
                  {product.farmer.farmName || product.farmer.name}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-green-700">{product.price.toFixed(2)}€</span>
                    <span className="text-sm text-gray-400 ml-1">/ {product.unit}</span>
                  </div>
                  {product.stock > 0 ? (
                    <button
                      onClick={() => handleAdd(product)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        added === product.id
                          ? "bg-green-100 text-green-700"
                          : "bg-green-700 text-white hover:bg-green-800"
                      }`}
                    >
                      {added === product.id ? "Ajouté !" : "Ajouter"}
                    </button>
                  ) : (
                    <span className="text-sm text-red-500 font-medium">Épuisé</span>
                  )}
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-xs text-orange-500 mt-2">Plus que {product.stock} en stock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
