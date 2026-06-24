export const extractYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsedUrl = new URL(url.trim());

    if (parsedUrl.hostname === 'youtu.be') {
      return parsedUrl.pathname.slice(1) || null;
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v');

      if (videoId) {
        return videoId;
      }

      const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);

      if (embedMatch) {
        return embedMatch[1];
      }

      const shortsMatch = parsedUrl.pathname.match(/\/shorts\/([^/?]+)/);

      if (shortsMatch) {
        return shortsMatch[1];
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}`;
};
