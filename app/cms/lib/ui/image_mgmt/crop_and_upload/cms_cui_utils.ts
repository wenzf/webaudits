import type { Area } from "react-easy-crop"

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // draw rotated image
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')

  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    return null
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // As Base64 string
  // return croppedCanvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((file) => {
      resolve(URL.createObjectURL(file!))
    }, 'image/png')
  })
}

export async function getRotatedImage(imageSrc: string, rotation = 0) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const orientationChanged =
    rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270
  if (orientationChanged) {
    canvas.width = image.height
    canvas.height = image.width
  } else {
    canvas.width = image.width
    canvas.height = image.height
  }

  if (ctx) {
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(image, -image.width / 2, -image.height / 2)
  }



  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file) resolve(URL.createObjectURL(file))
    }, 'image/png')
  })
}


// -----------------------------------------------



//// https://gist.github.com/owencm/ecc4589e67abb22cca29ea2b565db8e6
//export const blobToImage = (blob: Blob) => {
//  return new Promise(resolve => {
//    const url = URL.createObjectURL(blob)
//    let img = new Image()
//    img.onload = () => {
//      URL.revokeObjectURL(url)
//      resolve(img)
//    }
//    img.src = url
//  })
//}
//
//type Dim = {
//  width: number,
//  height: number,
//}



export const scaleImageFromSource = async (
  source: any, dim: Area, scaleToWidth: number, format: string
): Promise<string> => {
  const oheight = dim?.height;
  const owidth = dim?.width;

  const newHeight = (scaleToWidth / owidth) * oheight;
  const canvas = document.createElement('canvas');  // Dynamically Create a Canvas Element
  canvas.width = scaleToWidth;  // Set the width of the Canvas
  canvas.height = newHeight;  // Set the height of the Canvas
  const ctx = canvas.getContext("2d");  // Get the "context" of the canvas 
  if (!ctx) return '';

  const img = await createImage(source) as any;

  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;

  ctx.drawImage(img, 0, 0, scaleToWidth, newHeight);  // Draw your image to the canvas
  const scaled = canvas.toDataURL(format, 0.8);

  return scaled
}

export function readFile(file: File): any {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result), false)
    reader.readAsDataURL(file)
  })
}

export async function urltoFile(url: string, filename: string, mimeType: string) {
  return (fetch(url)
    .then(function (res) { return res.arrayBuffer(); })
    .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
  );
}



//export const constructImageLink = (domain: string, pathToBucket: string, cuid: string, filename: string) => {
//  return `https://${domain}/${pathToBucket}/${filename.substring(0, 7).replace('/', '')}/${filename}`
//}
//
//export const constructFileName = (cuid: string, aspect: number, width: number, src: string) => {
//
//  let suffix = ''
//  if (src.startsWith('data:image/jpeg;')) {
//      suffix = 'jpg'
//  } else if (src.startsWith('data:image/webp;')) {
//      suffix = 'webp'
//  } else if (src.startsWith('data:image/png;')) {
//      suffix = 'png'
//  } else {
//      suffix = 'jpg'
//  }
//  return `${cuid}-${aspect.toFixed(3).toString().replace('.', '_')}-${width.toString()}w.${suffix}`
//}