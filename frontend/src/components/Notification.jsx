"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

const Notification = ({
  message,
  type = "success",
  isVisible = false,
  onClose,
  autoClose = true,
  duration = 4000,
  position = "top-right",
}) => {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, autoClose, duration])

  const handleClose = () => {
    setShow(false)
    if (onClose) {
      setTimeout(onClose, 300) // Wait for animation to complete
    }
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />
      case "error":
        return <AlertCircle className="w-5 h-5" />
      case "warning":
        return <AlertTriangle className="w-5 h-5" />
      case "info":
        return <Info className="w-5 h-5" />
      default:
        return <CheckCircle className="w-5 h-5" />
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
      case "error":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
      default:
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
    }
  }

  const getPositionStyles = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4"
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2"
      case "top-right":
        return "top-4 right-4"
      case "bottom-left":
        return "bottom-4 left-4"
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2"
      case "bottom-right":
        return "bottom-4 right-4"
      default:
        return "top-4 right-4"
    }
  }

  if (!show) return null

  return (
    <div
      className={classNames(
        "fixed z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out max-w-md",
        getTypeStyles(),
        getPositionStyles(),
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      )}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Notification
