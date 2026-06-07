import { useState, useCallback } from 'react'

interface UseImageLoaderReturn {
  imageDataUrl: string | null
  isLoading: boolean
  error: string | null
  loadImage: (file: File) => void
  reset: () => void
}

export function useImageLoader(): UseImageLoaderReturn {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadImage = useCallback((file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Use PNG, JPEG, WebP, or SVG.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setIsLoading(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = () => {
      setImageDataUrl(reader.result as string)
      setIsLoading(false)
    }
    reader.onerror = () => {
      setError('Failed to read file')
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }, [])

  const reset = useCallback(() => {
    setImageDataUrl(null)
    setIsLoading(false)
    setError(null)
  }, [])

  return { imageDataUrl, isLoading, error, loadImage, reset }
}
