import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Paniers Fermiers - Du producteur au consommateur",
  description: "Achetez vos paniers de la ferme directement aux agriculteurs locaux",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
