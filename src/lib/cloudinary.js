const DIRECT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzquOsnzDkC8hP-EL2ARuuIPgjADUvByaji4mNcAYCFrvt9bUVkQ6n6vyUHUGRLZfni3A/exec'

function getApiUrl() {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/apps-script'
  }
  return DIRECT_URL
}

/**
 * Convert a File object to base64 string
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Result is data:<mime>;base64,<data>
      const result = reader.result
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

/**
 * Upload a file to Google Drive via Google Apps Script (remplace Cloudinary)
 * @param {File} file - The file to upload
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadToCloudinary(file) {
  const baseUrl = getApiUrl()
  const isProxy = baseUrl.startsWith('/api')

  const base64Data = await fileToBase64(file)

  const payload = {
    action: 'upload_image',
    fileName: file.name,
    mimeType: file.type,
    base64: base64Data,
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': isProxy ? 'application/json' : 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`Erreur lors de l'envoi de l'image (statut: ${response.status})`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Erreur lors de l’upload sur Google Drive')
  }

  return {
    url: data.url,
    public_id: data.public_id,
  }
}

/**
 * Get optimized URL for images
 * Gère les URLs directes Google Drive (lh3.googleusercontent.com) ainsi que les anciens liens Cloudinary
 * @param {string} url - Image URL
 * @param {object} opts - Transformation options
 * @returns {string} URL optimisée
 */
export function getOptimizedUrl(url, opts = {}) {
  if (!url) return ''

  // Si c'est une image hébergée sur Google Drive via lh3.googleusercontent.com
  if (url.includes('googleusercontent.com/d/')) {
    const { width } = opts
    if (width) {
      return `${url}=w${width}`
    }
    return url
  }

  // Si c'est une ancienne URL Cloudinary
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const { width = 600, height, quality = 'auto', format = 'auto' } = opts
    const parts = url.split('/upload/')
    if (parts.length === 2) {
      let transforms = `f_${format},q_${quality},w_${width}`
      if (height) transforms += `,h_${height}`
      transforms += ',c_fill'
      return `${parts[0]}/upload/${transforms}/${parts[1]}`
    }
  }

  return url
}
