// IndexedDB storage for photos
const DB_NAME = "liftmate-db"
const STORE_NAME = "progress-photos"
const DB_VERSION = 1

export interface ProgressPhoto {
  id: string
  date: string
  category: string
  thumbnail: string
  fullImage: string
  notes?: string
}

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject("Error opening database")
    }

    request.onsuccess = (event) => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("category", "category", { unique: false })
        store.createIndex("date", "date", { unique: false })
      }
    }
  })
}

// Get all photos
export const getAllPhotos = async (): Promise<ProgressPhoto[]> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject("Error fetching photos")
      }
    })
  } catch (error) {
    console.error("Failed to get photos:", error)
    return []
  }
}

// Add a new photo
export const addPhoto = async (photo: ProgressPhoto): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(photo)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject("Error adding photo")
      }
    })
  } catch (error) {
    console.error("Failed to add photo:", error)
    throw error
  }
}

// Delete a photo
export const deletePhoto = async (id: string): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject("Error deleting photo")
      }
    })
  } catch (error) {
    console.error("Failed to delete photo:", error)
    throw error
  }
}

// Get photos by category
export const getPhotosByCategory = async (category: string): Promise<ProgressPhoto[]> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index("category")
      const request = index.getAll(category)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject("Error fetching photos by category")
      }
    })
  } catch (error) {
    console.error("Failed to get photos by category:", error)
    return []
  }
}

// Convert a file to base64 string for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

const PhotoStorage = {
  getAllPhotos,
  addPhoto,
  deletePhoto,
  getPhotosByCategory,
  fileToBase64,
}

export default PhotoStorage

