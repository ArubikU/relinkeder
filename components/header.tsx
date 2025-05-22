"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import CustomUserButton from "./custom-user-button"
import Logo from "./logo"

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={34} height={34} />
            <span className="text-xl font-bold text-primary">ReLinkeder</span>
          </Link>
          <nav className="hidden md:flex">
            <ul className="flex gap-6">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-600 hover:text-primary">
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="hidden items-center gap-4 md:flex">
            <SignedOut>
              <>
                <SignInButton mode="redirect">
                  <button className="text-gray-700 hover:text-[#FF7A00] px-3 py-2 rounded-md text-sm font-medium">
                    Iniciar Sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <button className="btn-primary">Registrarse</button>
                </SignUpButton>
              </>
            </SignedOut>
            <SignedIn>
              <CustomUserButton showName/>
            </SignedIn>
        </div>
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="relinkeder-card">
            <div className="flex flex-col gap-8 py-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <Logo width={34} height={34} />
                <span className="text-xl font-bold text-primary">ReLinkeder</span>
              </Link>
              <nav>
                <ul className="flex flex-col gap-4">
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-gray-600 hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings"
                      className="text-gray-600 hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
            <SignedOut>
                    <div className="space-y-2">
                      <SignInButton mode="redirect">
                        <button
                          onClick={()=>setIsMenuOpen(false)}
                          className="w-full text-left text-gray-700 hover:text-[#FF7A00] px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Iniciar Sesión
                        </button>
                      </SignInButton>
                      <SignUpButton mode="redirect">
                        <button 
                          onClick={()=>setIsMenuOpen(false)} className="w-full btn-primary">
                          Registrarse
                        </button>
                      </SignUpButton>
                    </div>
            </SignedOut>
            <SignedIn>
              <CustomUserButton showName/>
            </SignedIn>
                  </li>
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
