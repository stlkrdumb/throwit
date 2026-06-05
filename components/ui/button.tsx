import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--neo-radius-sm)] border-2 border-black text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-100 outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--neo-blue)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default: "bg-white text-black shadow-[3px_3px_0_var(--neo-black)] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_var(--neo-black)]",
        outline:
          "bg-transparent border-2 border-slate-800 hover:bg-slate-100 text-[var(--neo-text-muted)] shadow-none hover:border-black",
        secondary:
          "bg-[var(--neo-pink)] text-white shadow-[3px_3px_0_var(--neo-black)] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_var(--neo-black)]",
        ghost:
          "bg-transparent border-none shadow-none hover:bg-slate-100 text-[var(--neo-text-muted)]",
        destructive:
          "bg-[var(--neo-red)] text-white shadow-[3px_3px_0_var(--neo-black)] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_var(--neo-black)]",
        link: "text-[var(--neo-blue)] underline-offset-4 hover:underline border-none shadow-none bg-transparent rounded-none px-0",
      },
      size: {
        default: "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[var(--neo-radius-xs)] px-2 text-[10px] in-data-[slot=button-group]:rounded-[var(--neo-radius-sm)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[var(--neo-radius-xs)] px-2 text-[10px] in-data-[slot=button-group]:rounded-[var(--neo-radius-sm)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 text-sm",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[var(--neo-radius-xs)] in-data-[slot=button-group]:rounded-[var(--neo-radius-sm)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[var(--neo-radius-xs)] in-data-[slot=button-group]:rounded-[var(--neo-radius-sm)]",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
