"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Trash2 } from "lucide-react";
import { requireProfile } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";

type ReportRow = {
  id: string;
  target_type: "discussion_post" | "discussion_comment" | "knowledge_post" | "profile";
  target_id: string;
  reason: string;
  created_at: string;
  reporter: { name: string; username: string } | null;
};

// Every report is filed with target_type "discussion_post" (post-actions.tsx), and a
// discussion post lives at /discussion/<id>. Sending it to /post/<id> - the knowledge-post
// route - showed the moderator "We could not find this knowledge note" for effectively
// every row in the queue, so nobody could see what they were being asked to moderate.
function targetHref(report: ReportRow) {
  if (report.target_type === "discussion_post") return `/discussion/${report.target_id}`;
  if (report.target_type === "knowledge_post") return `/post/${report.target_id}`;
  return null;
}

const targetLabels: Record<ReportRow["target_type"], string> = {
  discussion_post: "Discussion post",
  discussion_comment: "Comment",
  knowledge_post: "Knowledge post",
  profile: "Profile"
};

export default function AdminReportsPage() {
  const [state, setState] = useState<"loading" | "signed-out" | "not-moderator" | "unavailable" | "ready">("loading");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) {
        setState("unavailable");
        return;
      }
      const auth = await requireProfile();
      if (cancelled) return;
      if (!auth.ok) {
        setState("signed-out");
        return;
      }
      const { data: me } = await supabase.from("profiles").select("is_moderator").eq("id", auth.profileId).maybeSingle();
      if (cancelled) return;
      if (!me?.is_moderator) {
        setState("not-moderator");
        return;
      }
      const { data, error: reportsError } = await supabase
        .from("reports")
        .select("id,target_type,target_id,reason,created_at,reporter:profiles(name,username)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (reportsError) {
        setError("Reports could not be loaded. Check that the moderator migration has been applied.");
        setState("ready");
        return;
      }
      setReports((data || []) as unknown as ReportRow[]);
      setState("ready");
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function dismissReport(id: string) {
    if (!supabase) return;
    if (!window.confirm("Dismiss this report? This removes it from the queue.")) return;
    const previous = reports;
    setReports((current) => current.filter((report) => report.id !== id));
    // A DELETE filtered to zero rows by the moderator policy also returns error: null, so
    // without reading the row back the queue would look cleared while the report survived.
    const { data, error: deleteError } = await supabase.from("reports").delete().eq("id", id).select("id");
    if (deleteError || !data?.length) {
      setReports(previous);
      setError(deleteError
        ? "The report could not be dismissed. Please try again."
        : "That report was not dismissed. Your account may not have moderator permission.");
    }
  }

  return (
    <div className="container-page py-10 md:py-14">
      <p className="caption">Moderation</p>
      <h1 className="title-1 mt-2">Reported content</h1>
      <p className="subheadline mt-3">
        <Link className="font-medium underline underline-offset-4" href="/admin/analytics">View analytics</Link>
      </p>

      {state === "loading" && <p className="body-copy mt-6">Checking access...</p>}

      {state === "unavailable" && (
        <p className="body-copy mt-6">Moderation requires the production database connection.</p>
      )}

      {state === "signed-out" && (
        <p className="body-copy mt-6">
          Log in with a moderator account to review reports. <Link className="font-medium underline underline-offset-4" href="/login?next=%2Fadmin%2Freports">Log in</Link>
        </p>
      )}

      {state === "not-moderator" && (
        <p className="body-copy mt-6">This area is only available to moderators.</p>
      )}

      {state === "ready" && (
        <>
          {error && <p role="alert" className="mt-6 rounded-[16px] bg-[color:var(--color-rose)]/10 px-4 py-3 text-sm font-medium text-[color:var(--color-rose)]">{error}</p>}
          {reports.length === 0 && !error ? (
            <div className="mt-8 flex items-center gap-3 rounded-[24px] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
              <ShieldCheck size={20} className="text-[color:var(--color-green)]" />
              <p className="body-copy">No open reports. The queue is clear.</p>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4">
              {reports.map((report) => {
                const href = targetHref(report);
                return (
                  <li key={report.id} className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-black/[0.035]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="caption">{targetLabels[report.target_type]} · {new Date(report.created_at).toLocaleString()}</p>
                        <p className="body-copy mt-2 font-medium text-[color:var(--color-text-primary)]">{report.reason}</p>
                        <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                          Reported by {report.reporter ? `${report.reporter.name} (@${report.reporter.username})` : "an unknown account"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {href && (
                          <Link href={href} className="inline-flex min-h-10 items-center rounded-full bg-black/[0.04] px-4 text-sm font-medium transition hover:bg-black/[0.07]">
                            View target
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => dismissReport(report.id)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-[color:var(--color-rose)] transition hover:bg-[color:var(--color-rose)]/10"
                        >
                          <Trash2 size={15} /> Dismiss
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
