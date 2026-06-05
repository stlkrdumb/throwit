"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4.5 text-black shrink-0 stroke-[2.5]" />
        ),
        info: (
          <InfoIcon className="size-4.5 text-black shrink-0 stroke-[2.5]" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4.5 text-black shrink-0 stroke-[2.5]" />
        ),
        error: (
          <OctagonXIcon className="size-4.5 text-white shrink-0 stroke-[2.5]" />
        ),
        loading: (
          <Loader2Icon className="size-4.5 animate-spin text-foreground shrink-0 stroke-[2.5]" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--color-card)",
          "--normal-text": "var(--color-card-foreground)",
          "--normal-border": "#000000",
          "--border-radius": "4px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast border-[3px] border-black rounded-[4px] p-4 text-xs font-mono font-bold flex gap-3 items-center shadow-[4px_4px_0_#000]! transition-all duration-150 " +
            "data-[type=success]:bg-[#4CAF50]! data-[type=success]:text-black! data-[type=success]:border-black! " +
            "data-[type=error]:bg-[#FF5252]! data-[type=error]:text-white! data-[type=error]:border-black! " +
            "data-[type=warning]:bg-[#FFEB3B]! data-[type=warning]:text-black! data-[type=warning]:border-black! " +
            "data-[type=info]:bg-[#C6FF00]! data-[type=info]:text-black! data-[type=info]:border-black! " +
            "bg-card text-foreground border-black",
          title: "text-xs font-black uppercase font-body tracking-wide",
          description: "text-[10px] font-mono text-muted-foreground",
          actionButton: "bg-black text-white border-2 border-black font-bold uppercase text-[10px] rounded-[2px] cursor-pointer",
          cancelButton: "bg-muted text-foreground border-2 border-black font-bold uppercase text-[10px] rounded-[2px] cursor-pointer",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
