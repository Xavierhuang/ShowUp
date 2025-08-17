import Link from "next/link";

import ShowUpLogo from "./showup-logo";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { HamburgerMenu } from "./hamburger-menu";

export default function Header() {
  const navItems = (
    <>
      <Button variant="link" asChild className="cyber-text hover:neon-glow transition-all duration-300">
        <Link href="/events" className="font-semibold tracking-wide uppercase text-sm">Events</Link>
      </Button>
      <Button variant="link" asChild className="cyber-text hover:neon-glow transition-all duration-300">
        <Link href="/methods" className="font-semibold tracking-wide uppercase text-sm">Platform</Link>
      </Button>
    </>
  );

  return (
    <div className="absolute top-0 flex items-center justify-between w-full py-3 px-6 z-50">
      {/* Background with cyberpunk styling */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-gray-900/60 to-black/80 backdrop-blur-md border-b border-cyan-400/20"></div>
      
      <div className="relative h-[40px] flex items-center">
        <Link href="/" className="transform hover:scale-105 transition-transform duration-300">
          <ShowUpLogo />
        </Link>
      </div>
      
      <div className="relative hidden md:flex gap-4 items-center">
        {navItems}
        <div className="h-6 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent mx-2"></div>
        <ModeToggle />
      </div>
      
      <div className="relative md:hidden">
        <HamburgerMenu>{navItems}</HamburgerMenu>
      </div>
    </div>
  );
}