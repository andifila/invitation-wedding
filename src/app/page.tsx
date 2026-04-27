export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center">
        <p
          className="mb-3 text-sm uppercase tracking-widest"
          style={{ color: "var(--primary)", fontFamily: "var(--font-inter)" }}
        >
          Coming soon
        </p>
        <h1
          className="text-5xl font-bold mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          WeddingInvite
        </h1>
        <p
          className="text-lg max-w-md mx-auto"
          style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
        >
          Beautiful digital wedding invitations — step by step.
        </p>
      </div>
    </main>
  );
}
