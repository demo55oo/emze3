import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

// Store image in firebase
export const storeImage = async (userId, image) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage()
    const fileName = `${userId}-${image.name}-${uuidv4()}`

    const storageRef = ref(storage, 'images/' + fileName)

    const uploadTask = uploadBytesResumable(storageRef, image)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log('Upload is ' + progress + '% done')
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused')
            break
          case 'running':
            console.log('Upload is running')
            break
          default:
            break
        }
      },
      (error) => {
        reject(error)
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL)
        })
      }
    )
  })
}
