/** Prices are shown in Maloti, e.g. M35.00 or M1,250.00 */
export function formatMoney(value) {
  const n = Number(value) || 0;
  return `M${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return formatDateTime(iso);
}

/** Resize a chosen photo in the browser so it stays small enough to store in the database. */
export function fileToDataUrl(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      reject(new Error('Please choose a PNG, JPEG or WebP image.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        let quality = 0.82;
        let url = canvas.toDataURL('image/jpeg', quality);
        while (url.length > 550000 && quality > 0.4) {
          quality -= 0.1;
          url = canvas.toDataURL('image/jpeg', quality);
        }
        url.length > 580000 ? reject(new Error('That image is too large. Please choose a smaller one.')) : resolve(url);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
