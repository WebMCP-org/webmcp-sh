import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-charcoal-800 group-[.toaster]:text-gray-900 group-[.toaster]:dark:text-white group-[.toaster]:border-divide group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-600 group-[.toast]:dark:text-gray-400',
          actionButton: 'group-[.toast]:bg-brand group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:dark:bg-charcoal-700 group-[.toast]:text-gray-900 group-[.toast]:dark:text-white',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
