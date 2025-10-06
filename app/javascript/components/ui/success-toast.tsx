import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessToastProps {
  message: string;
  description?: string;
  className?: string;
}

export default function SuccessToast({ message, description, className }: SuccessToastProps) {
  return (
    <div className={cn(
      "fixed bottom-20 left-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 slide-up",
      className
    )}>
      <div className="flex items-center space-x-3">
        <Check className="h-6 w-6" />
        <div>
          <p className="font-medium">{message}</p>
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
