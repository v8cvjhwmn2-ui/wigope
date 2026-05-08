import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-red-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="font-extrabold">Unable to load</p>
          <p className="mt-1 text-sm font600 text-red-700">{message}</p>
          {onRetry ? (
            <Button className="mt-4 h-10 rounded-xl" variant="secondary" onClick={onRetry}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
