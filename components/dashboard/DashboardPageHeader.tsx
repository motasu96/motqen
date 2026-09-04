export default function DashboardPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-extrabold text-ink sm:text-2xl">{title}</h1>
      <p className="text-sm text-ink-soft">{subtitle}</p>
    </div>
  );
}
