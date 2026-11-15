import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; size?: number }> = ({
  message = 'Loading...',
  size = 28,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        color: '#64748b',
        gap: '12px',
      }}
    >
      <Loader2 size={size} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      {message && <p style={{ fontSize: '14px', margin: 0 }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

