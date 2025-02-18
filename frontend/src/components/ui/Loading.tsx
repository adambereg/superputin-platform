import React from 'react';
import { Spinner } from './Spinner';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <Spinner size="lg" className="text-primary" />
      <p className="text-text/70">{message}</p>
    </div>
  );
}; 