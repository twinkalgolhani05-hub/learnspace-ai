/**
 * LearnSpace YouTube Video Utility
 * Robust parsing, validation, and multi-format link generation for YouTube educational videos.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Raw 11-character video IDs
 */

/**
 * Extracts a valid 11-character YouTube video ID from various URL formats or raw strings.
 * @param {string} input - YouTube URL or ID
 * @returns {string|null} - 11-char ID or null
 */
export const extractYouTubeId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // If already an 11-character alphanumeric/dash/underscore ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex capturing standard watch?v=, embed/, youtu.be/, shorts/
  const regex =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  // Generic fallback query parameter check
  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (urlObj.hostname.includes('youtube.com')) {
      const v = urlObj.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    }
  } catch {
    // Ignore URL parse failures
  }

  return null;
};

/**
 * Validates whether an input can be parsed into a valid YouTube video.
 * @param {string} input
 * @returns {boolean}
 */
export const isValidYouTubeUrl = (input) => {
  return Boolean(extractYouTubeId(input));
};

/**
 * Returns formatted YouTube URLs and metadata.
 * @param {string|object} videoInput - Either URL/ID string, or video object { youtubeId, url, ... }
 * @param {object} meta - Additional title, channel, duration metadata
 */
export const getYouTubeDetails = (videoInput, meta = {}) => {
  let rawSource = '';
  let title = meta.title || 'Video Lecture';
  let channel = meta.channel || 'University Lecture';
  let duration = meta.duration || '15:00';
  let description = meta.description || '';

  if (typeof videoInput === 'string') {
    rawSource = videoInput;
  } else if (videoInput && typeof videoInput === 'object') {
    rawSource =
      videoInput.youtubeId ||
      videoInput.url ||
      videoInput.link ||
      videoInput.videoId ||
      videoInput.id ||
      '';
    title = videoInput.title || title;
    channel = videoInput.channel || channel;
    duration = videoInput.duration || duration;
    description = videoInput.description || description;
  }

  const videoId = extractYouTubeId(rawSource);

  if (!videoId) {
    return {
      isValid: false,
      videoId: null,
      watchUrl: null,
      shortUrl: null,
      embedUrl: null,
      title,
      channel,
      duration,
      description,
      rawSource,
    };
  }

  return {
    isValid: true,
    videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    shortUrl: `https://youtu.be/${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
    title,
    channel,
    duration,
    description,
    rawSource,
  };
};

/**
 * Safely opens a YouTube video in a new browser tab.
 * @param {string|object} videoInput
 * @returns {boolean} - true if opened, false if invalid
 */
export const openYouTubeVideo = (videoInput) => {
  const details = getYouTubeDetails(videoInput);
  if (details.isValid && details.watchUrl) {
    if (typeof window !== 'undefined' && window.open) {
      window.open(details.watchUrl, '_blank', 'noopener,noreferrer');
      return true;
    }
  }
  return false;
};

export default {
  extractYouTubeId,
  isValidYouTubeUrl,
  getYouTubeDetails,
  openYouTubeVideo,
};

