"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion" // Import framer-motion

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({ children, ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props}>
    {/* Wrap portal children in AnimatePresence */}
    <AnimatePresence>{children}</AnimatePresence>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogClose = DialogPrimitive.Close

// Reverted DialogOverlay to standard Radix component
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  // Wrap with motion.div for animation
  <motion.div
    className="fixed inset-0 z-50" // Container for overlay
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "absolute inset-0 bg-black/80", // Original overlay styles, removed animation classes
        className
      )}
      {...props}
    />
  </motion.div>
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Reverted DialogContent to standard Radix component
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay key="dialogOverlay" /> {/* Added key */}
    {/* Wrap Content with motion.div for animation */}
    <motion.div key="dialogContent" // Added key
      className="fixed left-[50%] top-[50%] z-50" // Positioning container for motion
      initial={{ opacity: 0, scale: 0.95, y: "-48%", x: "-50%" }}
      animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
      exit={{ opacity: 0, scale: 0.95, y: "-48%", x: "-50%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }} // Changed to spring physics
    >
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // Apply original layout/styling classes here, removed animation classes and positioning
          "grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </motion.div>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
