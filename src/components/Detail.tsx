export function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof import("lucide-react").UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="detail-item">
      <Icon />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export function PrintDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
