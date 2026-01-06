import { useBatchOperations } from '@/contexts/BatchOperationsContext';
import { Progress } from '@/components/ui/progress';
import { Loader2, Minimize2, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BatchProgressIndicator() {
  const { batchProgress, toggleMinimized } = useBatchOperations();

  if (!batchProgress) return null;

  const percentage = (batchProgress.current / batchProgress.total) * 100;

  // Minimized floating indicator
  if (batchProgress.isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
        <button
          onClick={toggleMinimized}
          className="flex items-center gap-3 bg-card border border-border shadow-lg rounded-full px-4 py-3 hover:bg-accent transition-colors"
        >
          <div className="relative">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <svg className="absolute inset-0 w-5 h-5 -rotate-90">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${percentage * 0.5} 50`}
                className="text-primary transition-all duration-300"
              />
            </svg>
          </div>
          <span className="text-sm font-medium">
            {batchProgress.current}/{batchProgress.total}
          </span>
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  // Full progress indicator
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 animate-fade-in">
      <div className="bg-card border border-border shadow-xl rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-secondary/50 border-b border-border">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Operação em andamento</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={toggleMinimized}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-2">{batchProgress.label}</p>
          <Progress value={percentage} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{batchProgress.current} de {batchProgress.total}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}