const TrailerModal = ({ isOpen, onClose, youtubeKey }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
                >
                    ✕
                </button>
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1`}
                    title="Trailer"
                    className="w-full h-full"
                    allowFullScreen
                />
            </div>
        </div>
    );
};

export default TrailerModal;
