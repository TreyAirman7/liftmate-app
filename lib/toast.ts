// Add a new toast utility file for theme-consistent notifications

/**
 * Toast notification utility
 * Creates toast notifications that match the current theme
 */

type ToastType = "info" | "success" | "error" | "warning"

interface ToastOptions {
  duration?: number
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
}

/**
 * Show a toast notification
 * @param message The message to display
 * @param type The type of toast (info, success, error, warning)
 * @param options Additional options
 */
export function showToast(message: string, type: ToastType = "info", options: ToastOptions = {}) {
  // Default options
  const { duration = 3000, position = "top-right" } = options

  // Create toast container if it doesn't exist
  let container = document.querySelector(".toast-container")
  if (!container) {
    container = document.createElement("div")
    container.className = "toast-container"

    // Position the container
    if (position === "top-left") {
      container.style.left = "1rem"
      container.style.right = "auto"
    } else if (position === "bottom-right") {
      container.style.top = "auto"
      container.style.bottom = "1rem"
    } else if (position === "bottom-left") {
      container.style.top = "auto"
      container.style.bottom = "1rem"
      container.style.left = "1rem"
      container.style.right = "auto"
    }

    document.body.appendChild(container)
  }

  // Create toast element
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  // Add to container
  container.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.classList.add("show")
  }, 10)

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      container.removeChild(toast)

      // Remove container if empty
      if (container.children.length === 0) {
        document.body.removeChild(container)
      }
    }, 300)
  }, duration)
}

/**
 * Show a success toast
 */
export function showSuccessToast(message: string, options?: ToastOptions) {
  showToast(message, "success", options)
}

/**
 * Show an error toast
 */
export function showErrorToast(message: string, options?: ToastOptions) {
  showToast(message, "error", options)
}

/**
 * Show a warning toast
 */
export function showWarningToast(message: string, options?: ToastOptions) {
  showToast(message, "warning", options)
}

/**
 * Show an info toast
 */
export function showInfoToast(message: string, options?: ToastOptions) {
  showToast(message, "info", options)
}

