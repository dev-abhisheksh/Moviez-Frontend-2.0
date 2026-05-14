import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const STORAGE_PREFIX = 'watch_progress_';

/**
 * VidKing Embed Player with localStorage progress tracking.
 *
 * Props:
 *  - tmdbId        (string|number) — TMDB ID
 *  - type          ('movie'|'tv')
 *  - season        (number, default 1)
 *  - episode       (number, default 1)
 *  - onEnded       (fn) — called when playback finishes
 *  - onClose       (fn) — called when user dismisses the player
 */
const VideoPlayer = ({
    tmdbId,
    type = 'movie',
    season = 1,
    episode = 1,
    onEnded,
    onClose,
}) => {
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const iframeRef = useRef(null);

    // ── Build the embed URL ────────────────────────────────────────────
    const embedUrl = useMemo(() => {
        // Try to resume from saved progress
        const storageKey = `${STORAGE_PREFIX}${tmdbId}`;
        let startTime = 0;
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey));
            if (saved?.currentTime) startTime = Math.floor(saved.currentTime);
        } catch { /* ignore corrupt data */ }

        const base = 'https://www.vidking.net/embed';

        if (type === 'tv') {
            const params = new URLSearchParams({
                color: 'e50914',
                autoPlay: 'true',
                nextEpisode: 'true',
                episodeSelector: 'true',
                ...(startTime > 0 && { startTime: String(startTime) }),
            });
            return `${base}/tv/${tmdbId}/${season}/${episode}?${params}`;
        }

        // movie
        const params = new URLSearchParams({
            color: 'e50914',
            autoPlay: 'true',
            ...(startTime > 0 && { startTime: String(startTime) }),
        });
        return `${base}/movie/${tmdbId}?${params}`;
    }, [tmdbId, type, season, episode]);

    // ── Progress tracking via postMessage ──────────────────────────────
    const handleMessage = useCallback(
        (event) => {
            // Only process messages that look like player events
            let data = event.data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch { return; }
            }
            if (!data || typeof data !== 'object') return;

            const storageKey = `${STORAGE_PREFIX}${tmdbId}`;

            // timeupdate → save progress
            if (data.event === 'timeupdate' || data.type === 'timeupdate') {
                const progress = {
                    currentTime: data.currentTime ?? data.time ?? 0,
                    progress: data.progress ?? data.percentage ?? 0,
                    updatedAt: Date.now(),
                    type,
                    season,
                    episode,
                };
                try {
                    localStorage.setItem(storageKey, JSON.stringify(progress));
                } catch { /* quota exceeded — silently ignore */ }
            }

            // pause → persist timestamp for cross-device resume
            if (data.event === 'pause' || data.type === 'pause') {
                const progress = {
                    currentTime: data.currentTime ?? data.time ?? 0,
                    progress: data.progress ?? data.percentage ?? 0,
                    updatedAt: Date.now(),
                    paused: true,
                    type,
                    season,
                    episode,
                };
                try {
                    localStorage.setItem(storageKey, JSON.stringify(progress));
                } catch { /* ignore */ }
            }

            // ended → mark as watched
            if (data.event === 'ended' || data.type === 'ended') {
                try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
                onEnded?.();
            }
        },
        [tmdbId, type, season, episode, onEnded],
    );

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    return (
        <div className="relative w-full bg-black">
            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors backdrop-blur-sm"
                    aria-label="Close player"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* Skeleton loader */}
            {!iframeLoaded && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950">
                    <div className="flex flex-col items-center gap-4">
                        {/* Spinner */}
                        <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
                        <span className="text-gray-400 text-sm font-medium tracking-wide">Loading player…</span>
                    </div>
                </div>
            )}

            {/* 16:9 aspect container */}
            <div className="aspect-video w-full">
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    title="VidKing Player"
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    onLoad={() => setIframeLoaded(true)}
                />
            </div>
        </div>
    );
};

export default VideoPlayer;
