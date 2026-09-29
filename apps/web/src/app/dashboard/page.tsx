export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Your dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your workspace for the next step with Defied.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold">Welcome to Defied</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your profile is ready. This space will grow with the projects, goals,
          and collaborations you bring into the open beta.
        </p>
      </div>
    </div>
  );
}
