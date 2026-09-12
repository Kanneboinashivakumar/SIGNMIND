import React from 'react';

interface Props {
  videoUrl?: string;
  signName: string;
  startTime?: number;
  endTime?: number;
}

export const VideoReferencePlayer: React.FC<Props> = ({ videoUrl, signName, startTime = 0, endTime }) => {
  const isYouTube = videoUrl?.includes('youtube.com/embed');
  const isLocal = videoUrl?.startsWith('/');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = React.useState(false);
  
  // Extract clean watch URL for YouTube if embed is blocked
  const ytVideoId = isYouTube ? videoUrl?.split('/embed/')[1]?.split('?')[0] : null;
  const externalYtUrl = ytVideoId ? `https://www.youtube.com/watch?v=${ytVideoId}` : null;

  // Handle video looping strictly within [startTime, endTime] bounds
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLocal) return;

    let rafId: number;

    const checkTime = () => {
      if (endTime && video.currentTime >= endTime) {
        video.currentTime = startTime;
        video.play().catch(() => {});
      } else if (startTime > 0 && video.currentTime < startTime) {
        video.currentTime = startTime;
      }
      rafId = requestAnimationFrame(checkTime);
    };

    const handleLoadedMetadata = () => {
      video.currentTime = startTime;
      video.play().catch(() => {});
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    rafId = requestAnimationFrame(checkTime);

    if (video.readyState >= 1) {
      video.currentTime = startTime;
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      cancelAnimationFrame(rafId);
    };
  }, [startTime, endTime, isLocal, videoUrl]);

  return (
    <div className="bg-surface-container-low rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-xl">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-primary">play_circle</span>
          ASL VIDEO TUTORIAL
        </h3>
        {isLocal && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-500/30">
            LOCAL HD VIDEO
          </span>
        )}
        {externalYtUrl && (
          <a
            href={externalYtUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Watch on YouTube
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>
        )}
      </div>
      
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        {!videoUrl ? (
          <div className="text-center p-4">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant block mb-1">videocam_off</span>
            <p className="text-on-surface-variant text-xs">Video reference not available</p>
          </div>
        ) : isYouTube ? (
          <iframe
            src={videoUrl}
            title={`${signName} ASL Tutorial`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          />
        ) : isLocal ? (
          <>
            <video
              key={videoUrl}
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              muted
              loop
              playsInline
              onError={(e) => {
                console.error('Video playback error:', e);
                setVideoError(true);
              }}
              onLoadedData={() => setVideoError(false)}
              className="w-full h-full object-contain"
            />
            {videoError && (
              <div className="absolute inset-0 bg-surface-container-lowest/90 flex flex-col items-center justify-center p-4 text-center z-10">
                <span className="material-symbols-outlined text-3xl text-amber-400 mb-1">warning</span>
                <p className="text-xs font-semibold text-on-surface mb-1">Video failed to load</p>
                <p className="text-[11px] text-white/50 mb-3 font-mono">{videoUrl}</p>
                <button
                  onClick={() => {
                    setVideoError(false);
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-4">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant block mb-1">videocam_off</span>
            <p className="text-on-surface-variant text-xs">Video unavailable</p>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5 bg-surface-container-lowest/50 border-t border-white/5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Tutorial reference for <span className="text-primary font-bold">{signName}</span>. Observe hand shape, orientation, and motion trajectory.
          </p>
          {isLocal && (
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = startTime;
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="text-[11px] font-mono px-2 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-secondary font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
              title="Restart sign playback"
            >
              <span className="material-symbols-outlined text-[13px]">replay</span>
              <span>Replay</span>
            </button>
          )}
        </div>
        {externalYtUrl && (
          <div className="text-[11px] text-white/50 flex items-center justify-between pt-1 border-t border-white/5">
            <span>If YouTube blocks embedding in your browser:</span>
            <a
              href={externalYtUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              Open video directly →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
