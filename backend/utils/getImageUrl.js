const getImageUrl = (val) => {
  if (!val) return val;
  // If it's already an absolute URL (Google OAuth, Cloudinary, etc.) or base64 data, return as-is
  if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:')) {
    return val;
  }
  // Construct absolute URL from BACKEND_URL env var, or fallback to local development URL
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}${val.startsWith('/') ? '' : '/'}${val}`;
};

module.exports = getImageUrl;
