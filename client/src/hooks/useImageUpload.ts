import { uploadToBunny } from "../utilities/bunnyUpload"

export const useImageUpload = () => {

  const upload = async (file: File, folder: string) => {

    const result = await uploadToBunny(file, folder)

    return result.url
  }

  return { upload }
}
