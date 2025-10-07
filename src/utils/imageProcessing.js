/**
 * Crop white margins from an image and optionally add rounded corners
 * @param {string} imageDataUrl - Base64 data URL of the image
 * @param {number} cornerRadius - Radius for rounded corners (0 = no rounding)
 * @returns {Promise<string>} - Processed image as data URL
 */
export async function cropAndRoundImage(imageDataUrl, cornerRadius = 12) {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      try {
        // Create canvas for detection
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Detect content bounds (non-background pixels)
        let minX = canvas.width
        let minY = canvas.height
        let maxX = 0
        let maxY = 0

        // Sample the outer edge to determine the background colour. This helps
        // us reliably crop away subtle white (or near-white) borders that the
        // model often leaves on one side of the canvas.
        const sampleCoords = [
          [0, 0],
          [canvas.width - 1, 0],
          [0, canvas.height - 1],
          [canvas.width - 1, canvas.height - 1],
          [Math.floor(canvas.width / 2), 0],
          [Math.floor(canvas.width / 2), canvas.height - 1],
          [0, Math.floor(canvas.height / 2)],
          [canvas.width - 1, Math.floor(canvas.height / 2)]
        ]

        const background = sampleCoords.reduce(
          (acc, [x, y]) => {
            const i = (y * canvas.width + x) * 4
            acc.r += data[i]
            acc.g += data[i + 1]
            acc.b += data[i + 2]
            acc.a += data[i + 3]
            return acc
          },
          { r: 0, g: 0, b: 0, a: 0 }
        )

        const totalSamples = sampleCoords.length
        background.r /= totalSamples
        background.g /= totalSamples
        background.b /= totalSamples
        background.a /= totalSamples

        const colorTolerance = 18
        const alphaThreshold = 16

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]

            const colorDistance = Math.sqrt(
              Math.pow(r - background.r, 2) +
                Math.pow(g - background.g, 2) +
                Math.pow(b - background.b, 2)
            )

            const isBackground =
              a <= alphaThreshold || colorDistance <= colorTolerance

            if (!isBackground) {
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
            }
          }
        }

        // Add small padding
        const padding = 2
        minX = Math.max(0, minX - padding)
        minY = Math.max(0, minY - padding)
        maxX = Math.min(canvas.width - 1, maxX + padding)
        maxY = Math.min(canvas.height - 1, maxY + padding)

        const cropWidth = maxX - minX + 1
        const cropHeight = maxY - minY + 1

        // If no content was detected, return the original image
        if (cropWidth <= 0 || cropHeight <= 0) {
          resolve(imageDataUrl)
          return
        }

        // Create new canvas with cropped dimensions
        const croppedCanvas = document.createElement('canvas')
        const croppedCtx = croppedCanvas.getContext('2d')

        croppedCanvas.width = cropWidth
        croppedCanvas.height = cropHeight

        // If rounded corners requested
        if (cornerRadius > 0) {
          // Draw rounded rectangle clip
          croppedCtx.beginPath()
          croppedCtx.moveTo(cornerRadius, 0)
          croppedCtx.lineTo(cropWidth - cornerRadius, 0)
          croppedCtx.quadraticCurveTo(cropWidth, 0, cropWidth, cornerRadius)
          croppedCtx.lineTo(cropWidth, cropHeight - cornerRadius)
          croppedCtx.quadraticCurveTo(cropWidth, cropHeight, cropWidth - cornerRadius, cropHeight)
          croppedCtx.lineTo(cornerRadius, cropHeight)
          croppedCtx.quadraticCurveTo(0, cropHeight, 0, cropHeight - cornerRadius)
          croppedCtx.lineTo(0, cornerRadius)
          croppedCtx.quadraticCurveTo(0, 0, cornerRadius, 0)
          croppedCtx.closePath()
          croppedCtx.clip()
        }

        // Draw cropped image
        croppedCtx.drawImage(
          img,
          minX, minY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        )

        // Convert to data URL
        const processedDataUrl = croppedCanvas.toDataURL('image/png')
        resolve(processedDataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for processing'))
    }

    img.src = imageDataUrl
  })
}
