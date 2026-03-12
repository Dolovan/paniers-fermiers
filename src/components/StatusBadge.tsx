const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmée", color: "bg-blue-100 text-blue-800" },
  PREPARING: { label: "En préparation", color: "bg-orange-100 text-orange-800" },
  READY: { label: "Prêt", color: "bg-green-100 text-green-800" },
  DELIVERED: { label: "Livré", color: "bg-gray-100 text-gray-800" },
  CANCELLED: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
