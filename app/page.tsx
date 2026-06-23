export default function Home() {
  return (
    <main className="min-h-screen bg-canvas p-12">
      <h1 className="text-3xl font-semibold text-ink">Token smoke test</h1>
      <p className="mt-2 text-ink-muted">Muted ink on the canvas.</p>
      <div className="mt-6 rounded border border-hairline bg-surface-1 p-6">
        <p className="text-ink-subtle">Surface 1 with a hairline border.</p>
        <p className="mt-2 text-accent">Restrained signature accent.</p>
        <p className="mt-2 font-mono text-sm text-ink-muted">font-mono / technical label</p>
      </div>
    </main>
  );
}
