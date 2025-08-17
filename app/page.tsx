
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DynamicEmbeddedWidget from "@/components/dynamic/dynamic-embedded-widget";
import { Calendar, Shield, Coins } from "lucide-react";

export default function Main() {
  return (
    <div className="min-h-svh w-full cyber-grid relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-orange-400/5 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <main className="relative flex min-h-svh flex-col items-center justify-center gap-12 p-4 pt-24">
        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl float">
          <div className="space-y-6">
            <Badge className="neon-border bg-transparent text-cyan-400 hover:bg-cyan-400/10 px-4 py-2 text-sm font-semibold tracking-wide uppercase">
              🚀 Powered by Flow & Flare Networks
            </Badge>
            
            <h1 className="cyber-heading text-5xl md:text-8xl font-black tracking-wider mb-6">
              SHOW<span className="text-orange-400 mx-2">⚡</span>UP
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-bold cyber-text tracking-wide">
              STAKE • ATTEND • EARN
            </h2>
            
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 mx-auto neon-glow"></div>
          </div>
          
          <p className="cyber-text text-lg md:text-xl leading-relaxed max-w-3xl opacity-90">
            The first multi-chain event platform where commitment meets innovation. 
            Stake FLOW or FLR tokens to secure your spot, show up to earn rewards, 
            and join the future of accountable communities.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          <div className="holo-card rounded-xl p-8 text-center space-y-6 float" style={{animationDelay: '0.5s'}}>
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl neon-glow opacity-20"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h3 className="cyber-heading text-lg">DISCOVER EVENTS</h3>
            <p className="cyber-text text-sm opacity-80 leading-relaxed">
              Explore cutting-edge Web3 events, crypto meetups, and blockchain workshops across the metaverse
            </p>
          </div>

          <div className="holo-card rounded-xl p-8 text-center space-y-6 float" style={{animationDelay: '1s'}}>
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl neon-glow opacity-20"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Coins className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h3 className="cyber-heading text-lg">STAKE TO ATTEND</h3>
            <p className="cyber-text text-sm opacity-80 leading-relaxed">
              Lock FLOW or FLR tokens to guarantee your commitment - revolutionizing event attendance
            </p>
          </div>

          <div className="holo-card rounded-xl p-8 text-center space-y-6 float" style={{animationDelay: '1.5s'}}>
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl neon-glow opacity-20"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h3 className="cyber-heading text-lg">EARN REWARDS</h3>
            <p className="cyber-text text-sm opacity-80 leading-relaxed">
              Prove attendance through smart contracts and reclaim your stake plus potential bonuses
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="holo-card rounded-2xl p-10 text-center space-y-8 max-w-lg w-full pulse-glow">
          <div className="space-y-4">
            <h3 className="cyber-heading text-2xl">ENTER THE GRID</h3>
            <p className="cyber-text opacity-90 leading-relaxed">
              Connect your multi-chain wallet to access the future of event engagement
            </p>
          </div>
          
          <div className="space-y-6">
            <DynamicEmbeddedWidget />
            
            <div className="w-full space-y-4 pt-6 border-t border-cyan-400/20">
              <Button asChild className="cyber-button w-full py-3 text-sm tracking-wider">
                <Link href="/events">
                  ⚡ EXPLORE EVENTS
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full py-3 text-sm tracking-wider neon-border bg-transparent hover:bg-cyan-400/10 transition-all duration-300">
                <Link href="/methods">
                  🚀 LAUNCH PLATFORM
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}