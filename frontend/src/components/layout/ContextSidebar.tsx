import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ContextSidebarProps {
  children: React.ReactNode;
  title?: string;
  isOpen: boolean;
  onClose?: () => void;
  width?: string;
}

/**
 * ContextSidebar provides a standardized right-hand panel for contextual details.
 * Used for Employee details, Camera metadata, Ticket history, etc.
 */
export function ContextSidebar({ 
  children, 
  title = "Details", 
  isOpen, 
  onClose,
  width = "w-96"
}: ContextSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className={cn(
      "relative h-full border-l bg-background shadow-xl transition-all duration-300 animate-in slide-in-from-right",
      width
    )}>
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <h3 className="font-bold tracking-tight text-foreground">{title}</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[calc(100vh-64px)] p-6">
        {children}
      </ScrollArea>
    </div>
  )
}
