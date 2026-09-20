export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full mt-40 min-h-screen">
      {children}
    </div>
  );
}
