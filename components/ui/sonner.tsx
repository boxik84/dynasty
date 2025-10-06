"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"

const toastIcons = {
  success: (
    <span className="mt-0.5 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg w-7 h-7 flex-shrink-0">
      <CheckCircle2 className="w-5 h-5 text-white" />
    </span>
  ),
  error: (
    <span className="mt-0.5 flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-lg w-7 h-7 flex-shrink-0">
      <XCircle className="w-5 h-5 text-white" />
    </span>
  ),
  info: (
    <span className="mt-0.5 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-800 shadow-lg w-7 h-7 flex-shrink-0">
      <Info className="w-5 h-5 text-white" />
    </span>
  ),
  warning: (
    <span className="mt-0.5 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg w-7 h-7 flex-shrink-0">
      <AlertTriangle className="w-5 h-5 text-white" />
    </span>
  ),
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      duration={4000}
      closeButton={false}
      icons={toastIcons}
      toastOptions={{
        classNames: {
          toast:
            "relative grid grid-cols-[auto_1fr] items-center min-w-[300px] max-w-[520px] px-4 py-3 rounded-xl border border-white/10 shadow-xl bg-gradient-to-br from-[#14171a]/95 via-[#171c20]/95 to-[#14171a]/95 backdrop-blur text-white gap-3 mb-3",
          title: "font-semibold text-white text-[15px] leading-5 break-words",
          description: "text-gray-300 text-[13px] leading-5 break-words",
          icon: "flex-shrink-0 mt-0.5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
