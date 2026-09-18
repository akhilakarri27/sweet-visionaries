import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-stone-200/80 rounded-md ${className}`}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#FFFDF9] rounded-2xl p-4 border border-brand-border shadow-soft flex flex-col gap-3">
      <Skeleton className="w-full h-48 rounded-xl" />
      <div className="flex justify-between items-center mt-1">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-full h-8" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  );
};
