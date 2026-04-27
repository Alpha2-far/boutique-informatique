const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload a file to Cloudinary using unsigned preset.
 * @param {File} file - The file to upload
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadToCloudinary(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Missing Cloudinary environment variables. Check your .env file.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'gco-store/products')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Cloudinary upload failed')
  }

  const data = await response.json()

  return {
    url: data.secure_url,
    public_id: data.public_id,
  }
}

/**
 * Get optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} opts - Transformation options
 * @returns {string} Optimized URL
 */
export function getOptimizedUrl(url, opts = {}) {
  if (!url) return ''
  const { width = 600, height, quality = 'auto', format = 'auto' } = opts
  
  // Insert transformations before /upload/
  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  let transforms = `f_${format},q_${quality},w_${width}`
  if (height) transforms += `,h_${height}`
  transforms += ',c_fill'

  return `${parts[0]}/upload/${transforms}/${parts[1]}`
}
