"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "../../lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
    React.ElementRef<typeof HoverCardPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "start", sideOffset = 8, ...props }, ref) => (
    <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
                // Base styles
                "z-50 w-52 rounded-lg border bg-popover/95 backdrop-blur-sm p-1.5 text-popover-foreground shadow-lg outline-none",
                // Entry animation (matching ShadCN nav menu)
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                // Exit animation
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                // Directional slide animations
                "data-[side=right]:slide-in-from-left-3",
                "data-[side=left]:slide-in-from-right-3",
                "data-[side=bottom]:slide-in-from-top-3",
                "data-[side=top]:slide-in-from-bottom-3",
                // Smooth timing
                "duration-200 ease-out",
                // Transform origin for natural scaling
                "origin-[var(--radix-hover-card-content-transform-origin)]",
                className
            )}
            {...props}
        />
    </HoverCardPrimitive.Portal>
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }

