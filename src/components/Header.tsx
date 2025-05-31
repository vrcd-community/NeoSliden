import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import VRCD from '@/assets/VRCD'
import { Separator } from './ui/separator'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: "PDF转图片", href: "/pdf2img" },
    { name: "VRCD", href: "https://vrcd.org.cn" }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[56px] border-b border-border/40">
      <div className="absolute inset-0 bg-[#000] backdrop-blur-[12px]" />
      <div className="relative h-full mx-auto px-4 max-w-screen-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 h-[24px]">
          <VRCD />
          <Separator orientation="vertical" className='bg-white/40'/>
          <Link
            to="/"
            className="shrink-0 text-md font-medium tracking-wide text-foreground/90 hover:text-foreground transition-colors duration-200"
          >
            Neo Sliden
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "px-4 py-2 text-sm rounded-md",
                "text-foreground hover:text-foreground",
                "transition-colors duration-200",
                "hover:bg-primary/10"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  "hover:bg-primary/10",
                  "transition-colors duration-120"
                )}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-l border-border/40 bg-background/80 backdrop-blur-[12px] p-0"
            >
              <nav className="flex flex-col py-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "px-6 py-2 text-sm",
                      "text-foreground/60 hover:text-foreground",
                      "transition-colors duration-200",
                      "hover:bg-primary/10"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
