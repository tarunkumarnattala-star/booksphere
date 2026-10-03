import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white p-8 text-center shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
      <h3 className="title-3">{title}</h3>
      <p className="body-copy mx-auto mt-2 max-w-md text-[15px] leading-6">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
