"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}        className={cn(
          // Glass effect with enhanced transparency and blur
          "bg-black/20 backdrop-blur-3xl backdrop-saturate-150 text-white",
          // Glass borders with subtle gradients
          "border border-white/10 ring-1 ring-white/5",
          // Enhanced shadows with red glow effect and depth
          "shadow-2xl drop-shadow-lg shadow-[#8a0101]/20",
          // Modern rounded corners like sidebar
          "rounded-xl",
          // Glass inner glow effect
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
          // Padding and spacing
          "p-2 min-w-[12rem] max-w-[20rem] relative",
          // Z-index for layering
          "z-50",
          // Overflow handling
          "max-h-(--radix-dropdown-menu-content-available-height) overflow-x-hidden overflow-y-auto",
          // Transform origin
          "origin-(--radix-dropdown-menu-content-transform-origin)",
          // Enhanced animations matching sidebar spring
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-98 data-[state=open]:zoom-in-100",
          "data-[state=closed]:duration-200 data-[state=open]:duration-200",
          // Directional slide animations
          "data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3",
          "data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3",
          className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        // Base styles matching sidebar
        "group relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border",
        "outline-none select-none cursor-default",
        // Default state - similar to sidebar inactive items
        "text-gray-300 hover:text-white bg-transparent border-transparent",
        // Hover state with sidebar-like styling
        "hover:bg-[#8a0101]/20 hover:border-[#8a0101]/40 hover:shadow-lg hover:shadow-[#8a0101]/10",
        // Focus state
        "focus:bg-[#8a0101]/20 focus:border-[#8a0101]/40 focus:text-white",
        "focus-visible:ring-2 focus-visible:ring-[#8a0101]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        // Destructive variant with red glow
        "data-[variant=destructive]:text-red-400",
        "data-[variant=destructive]:hover:bg-red-500/20 data-[variant=destructive]:focus:bg-red-500/20",
        "data-[variant=destructive]:hover:border-red-500/40 data-[variant=destructive]:focus:border-red-500/40",
        "data-[variant=destructive]:hover:text-red-300 data-[variant=destructive]:focus:text-red-300",
        "data-[variant=destructive]:hover:shadow-lg data-[variant=destructive]:hover:shadow-red-500/10",
        "data-[variant=destructive]:*:[svg]:!text-red-400",
        // Inset padding
        "data-[inset]:pl-10",
        // Icon styles with glow on hover like sidebar
        "[&_svg:not([class*='text-'])]:text-gray-400 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-5 [&_svg]:transition-all [&_svg]:duration-200",
        "hover:[&_svg]:text-gray-300 hover:[&_svg]:drop-shadow-[0_0_5px_#8a0101]",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        // Base styles matching sidebar design
        "group relative flex items-center gap-3 px-4 py-3 pl-12 text-sm font-medium rounded-xl transition-all duration-200 border",
        "outline-none select-none cursor-default",
        // Default state
        "text-gray-300 hover:text-white bg-transparent border-transparent",
        // Hover state with sidebar-like glow
        "hover:bg-[#8a0101]/20 hover:border-[#8a0101]/40 hover:shadow-lg hover:shadow-[#8a0101]/10",
        // Focus state
        "focus:bg-[#8a0101]/20 focus:border-[#8a0101]/40 focus:text-white",
        "focus-visible:ring-2 focus-visible:ring-[#8a0101]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        // Icon styles
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-4 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="size-4 text-[#8a0101] drop-shadow-[0_0_5px_#8a0101]" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        // Base styles matching sidebar design
        "group relative flex items-center gap-3 px-4 py-3 pl-12 text-sm font-medium rounded-xl transition-all duration-200 border",
        "outline-none select-none cursor-default",
        // Default state
        "text-gray-300 hover:text-white bg-transparent border-transparent",
        // Hover state with sidebar-like glow
        "hover:bg-[#8a0101]/20 hover:border-[#8a0101]/40 hover:shadow-lg hover:shadow-[#8a0101]/10",
        // Focus state
        "focus:bg-[#8a0101]/20 focus:border-[#8a0101]/40 focus:text-white",
        "focus-visible:ring-2 focus-visible:ring-[#8a0101]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        // Icon styles
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-4 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="size-2.5 fill-current text-[#8a0101] drop-shadow-[0_0_5px_#8a0101]" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        // Styling like sidebar header
        "px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider",
        "data-[inset]:pl-12",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(
        "bg-white/10 -mx-1 my-2 h-px",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs text-gray-400 tracking-wider font-mono",
        "bg-gray-800/60 border border-gray-600/40 px-2 py-1 rounded-md",
        "shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        // Base styles matching sidebar design
        "group relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border",
        "outline-none select-none cursor-default",
        // Default state
        "text-gray-300 hover:text-white bg-transparent border-transparent",
        // Hover state with sidebar-like glow
        "hover:bg-[#8a0101]/20 hover:border-[#8a0101]/40 hover:shadow-lg hover:shadow-[#8a0101]/10",
        // Focus state
        "focus:bg-[#8a0101]/20 focus:border-[#8a0101]/40 focus:text-white",
        // Open state (active)
        "data-[state=open]:bg-[#8a0101]/20 data-[state=open]:border-[#8a0101]/40 data-[state=open]:text-white",
        "data-[state=open]:shadow-lg data-[state=open]:shadow-[#8a0101]/10",
        // Enhanced focus ring
        "focus-visible:ring-2 focus-visible:ring-[#8a0101]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        // Inset padding
        "data-[inset]:pl-12",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-4 text-gray-400 transition-all duration-200 group-hover:text-gray-300 group-hover:drop-shadow-[0_0_3px_#8a0101]" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"        className={cn(
          // Glass effect with transparency and blur
          "bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 text-white",        // Glass borders with subtle gradients  
        "border border-white/10",
        // Glass glow rings
        "ring-1 ring-[#8a0101]/20 ring-offset-1 ring-offset-transparent",
        // Enhanced shadows with glass effect
        "shadow-2xl shadow-black/50 drop-shadow-lg drop-shadow-[#8a0101]/30",
          // Modern rounded corners like sidebar
          "rounded-xl",
          // Glass inner glow effect
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
          // Padding and spacing
          "p-2 min-w-[12rem] max-w-[20rem] relative",
        // Z-index for layering
        "z-50",
        // Overflow handling
        "overflow-hidden",
        // Transform origin
        "origin-(--radix-dropdown-menu-content-transform-origin)",
        // Enhanced animations matching sidebar spring
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-98 data-[state=open]:zoom-in-100",
        "data-[state=closed]:duration-200 data-[state=open]:duration-200",
        // Directional slide animations
        "data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3",
        "data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3",
        // Subtle glow ring like sidebar
        "ring-1 ring-[#8a0101]/20",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}