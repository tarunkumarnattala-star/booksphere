export default function Loading() {
  return (
    <div className="editorial-page max-w-[1180px]" aria-label="Loading page" role="status">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded-full bg-black/[0.06]" />
        <div className="mt-5 h-12 max-w-2xl rounded-[18px] bg-black/[0.06]" />
        <div className="mt-4 h-5 max-w-xl rounded-full bg-black/[0.045]" />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="h-64 rounded-[28px] bg-white shadow-[var(--shadow-soft)]" />
          <div className="h-64 rounded-[28px] bg-white shadow-[var(--shadow-soft)]" />
        </div>
      </div>
      <span className="sr-only">Loading BookSphere</span>
    </div>
  );
}
