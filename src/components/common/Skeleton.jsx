const SkeletonCard = () => {
    return (
        <div className="min-w-[180px] space-y-3 animate-pulse">
            <div className="aspect-[2/3] bg-gray-200 rounded-lg" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
    );
};

export const MovieRowSkeleton = () => (
    <div className="px-6 my-8">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
    </div>
);

