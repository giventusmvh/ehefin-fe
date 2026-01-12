/**
 * Build the full URL for an uploaded image
 * @param path - The image path from backend (e.g., "uuid.png" or "/uploads/uuid.png")
 * @returns Full URL path for the image
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return path;
  if (path.startsWith('/')) return `/uploads${path}`;
  return `/uploads/${path}`;
}

/**
 * Open an image URL in a new browser tab
 * @param url - The URL to open
 */
export function openImageInNewTab(url: string): void {
  if (url) {
    window.open(url, '_blank');
  }
}
