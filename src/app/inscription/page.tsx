"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Chargement...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "CONSUMER";

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: defaultRole,
    phone: "",
    address: "",
    farmName: "",
    farmDescription: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    if (data.user.role === "FARMER") {
      router.push("/agriculteur");
    } else {
      router.push("/marketplace");
    }
    router.refresh();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Inscription</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="flex gap-2 mb-2">
            {[
              { value: "CONSUMER", label: "Consommateur" },
              { value: "FARMER", label: "Agriculteur" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => update("role", r.value)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  form.role === r.value
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>

          {form.role === "FARMER" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la ferme</label>
                <input
                  type="text"
                  value={form.farmName}
                  onChange={(e) => update("farmName", e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description de la ferme</label>
                <textarea
                  value={form.farmDescription}
                  onChange={(e) => update("farmDescription", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-2.5 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-50"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-green-700 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
