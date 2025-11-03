import Link from "next/link"
import { ArrowLeft, Compass, ShieldCheck, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[15%] size-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[10%] top-[35%] size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-1/2 size-80 -translate-x-1/2 rounded-full bg-muted/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col gap-12 px-6 py-24 sm:px-10 lg:px-16">
        <section className="grid gap-12 text-center lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:text-left">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="mx-auto lg:mx-0">
              <Sparkles className="size-3.5 text-primary" /> Lost in the archives
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              We could not find that dynasty chapter.
            </h1>
            <p className="text-balance text-muted-foreground text-base sm:text-lg">
              The page you were looking for may have moved, been renamed, or never existed. Let&apos;s get you back on a safe path with a few curated options below.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="shadow-md">
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  Go back home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="backdrop-blur">
                <Link href="/auth">
                  <ShieldCheck className="size-4" />
                  Access your account
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start">
              <ShieldCheck className="size-4 text-primary" />
              <span>The guardrails stayed active — no private data was exposed.</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 -skew-y-3 rounded-3xl bg-linear-to-br from-primary/20 via-primary/5 to-transparent blur-xl" />
            <div className="relative rounded-3xl border border-border/60 bg-background/70 p-10 shadow-xl backdrop-blur">
              <div className="flex flex-col items-center gap-6">
                <span className="text-7xl font-black tracking-tight text-primary sm:text-8xl">
                  404
                </span>
                <p className="text-center text-muted-foreground">
                  A missing relic in the Dynasty knowledge base. While we scout for it, choose a new destination below.
                </p>
                <div className="flex items-center gap-3 rounded-full border border-dashed border-primary/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary">
                  <Compass className="size-3" />
                  Adaptive navigation active
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
