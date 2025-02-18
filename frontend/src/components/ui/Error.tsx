import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({
  title = 'Error',
  message = 'Something went wrong',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-500 mb-2">{title}</h3>
        <p className="text-text/70 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}; 