import { Inbox } from 'lucide-react';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-wigope-line bg-white p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-wigope-orange">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-black text-navy-900">{title}</h3>
      <p className="mt-1 text-sm font600 text-slate-500">{body}</p>
    </div>
  );
}
