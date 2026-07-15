"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getLocalProfile } from "@/lib/local-session";

export function ProfileOwnerCard({ profileId }: { profileId: string }) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const syncOwner = () => {
      const localProfile = getLocalProfile();
      setIsOwner(Boolean(localProfile && localProfile.id === profileId));
    };

    syncOwner();
    window.addEventListener("booksphere-auth-change", syncOwner);
    return () => window.removeEventListener("booksphere-auth-change", syncOwner);
  }, [profileId]);

  if (!isOwner) return null;

  return (
    <section className="mt-5 rounded-[28px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="caption">Your knowledge profile</p>
          <h2 className="title-3 mt-2">Make your thinking easier to understand.</h2>
          <p className="body-copy mt-2 max-w-2xl text-[15px]">
            Add shaped books, save your best insights, and start one useful discussion so visitors can quickly see what kind of reader they are following.
          </p>
        </div>
        <div className="grid gap-2 text-sm font-medium text-[color:var(--color-text-secondary)] sm:grid-cols-3 md:min-w-[420px]">
          {["Add 3 shaped books", "Save one insight", "Start one discussion"].map((item) => (
            <span key={item} className="inline-flex items-center gap-2 rounded-full bg-black/[0.025] px-3 py-2">
              <CheckCircle2 size={16} className="text-[color:var(--color-accent)]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
