export default function DataLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {children}
    </div>
  );
}
