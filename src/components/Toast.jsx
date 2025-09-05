import * as Toast from '@radix-ui/react-toast'
import { CheckCircle, XCircle } from 'lucide-react'

export function ToastBubble({ open, onOpenChange, type = 'success', message }) {
  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        className={`rounded-2xl p-4 shadow-lg backdrop-blur-lg text-white ${
          type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'
        }`}
        open={open}
        onOpenChange={onOpenChange}
      >
        <div className="flex items-center space-x-2">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{message}</span>
        </div>
      </Toast.Root>
      <Toast.Viewport className="fixed top-5 right-5 w-80 max-w-full" />
    </Toast.Provider>
  )
}
