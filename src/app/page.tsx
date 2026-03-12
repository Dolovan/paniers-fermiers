import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Des paniers frais,<br />directement de la ferme
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Découvrez les meilleurs produits locaux en achetant directement aux agriculteurs de votre région.
            Frais, de saison et sans intermédiaire.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/marketplace"
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-50 transition"
            >
              Découvrir les paniers
            </Link>
            <Link
              href="/inscription?role=FARMER"
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition"
            >
              Je suis agriculteur
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Comment ça marche ?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "🔍", title: "Parcourez", desc: "Explorez les produits frais proposés par les agriculteurs de votre région" },
            { icon: "🛒", title: "Commandez", desc: "Ajoutez vos produits préférés au panier et passez commande en quelques clics" },
            { icon: "📦", title: "Récupérez", desc: "L'agriculteur prépare votre colis et vous le récupérez frais du jour" },
          ].map((step, i) => (
            <div key={i} className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Farmers */}
      <section className="bg-amber-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Vous êtes agriculteur ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Vendez vos produits directement aux consommateurs. Gérez vos paniers, suivez vos commandes
            et préparez vos colis depuis votre espace dédié.
          </p>
          <Link
            href="/inscription?role=FARMER"
            className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-800 transition"
          >
            Créer mon espace agriculteur
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>Paniers Fermiers - Du producteur au consommateur</p>
        </div>
      </footer>
    </div>
  );
}
