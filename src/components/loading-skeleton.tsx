export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-[18px] bg-black/[0.05]" />
      <div className="mt-4 h-4 w-3/4 rounded-full bg-black/[0.05]" />
      <div className="mt-2 h-3 w-1/2 rounded-full bg-black/[0.04]" />
    </div>
  );
}
