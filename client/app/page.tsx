"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, FileCode2, FolderGit2, MessageSquareCode, Sparkles } from "lucide-react";

import { DevPilotIcon } from "@/components/icons/devpilot-icon";
import { BrandMark } from "@/components/layout/app-shell";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGithubLoginUrl } from "@/lib/api";

const Q = "Where do we validate the JWT on incoming requests?";
const A = "Tokens are verified in the auth middleware before any route handler runs. Invalid tokens return a 401.";
const SOURCES = ["middleware/auth.ts:42", "lib/jwt.ts:18"];

const FEATURES = [
  { title: "Connect GitHub", body: "OAuth with repo scope for public and private repositories.", icon: FolderGit2 },
  { title: "Index with RAG", body: "Chunk and embed your code into Postgres + pgvector.", icon: Sparkles },
  { title: "Ask anything", body: "Get grounded answers with clickable source citations.", icon: MessageSquareCode },
];

function Up({ d = 0, className, children }: { d?: number; className?: string; children: ReactNode }) {
  return (
    <div className={cn("animate-[dp-up_0.7s_ease-out_both]", className)} style={{ animationDelay: `${d}ms` }}>
      {children}
    </div>
  );
}

function ChatDemo() {
  const [n, setN] = useState(0);
  const end = Q.length + A.length + 20;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(end);
    const id = setInterval(() => setN((v) => (v >= end + 120 ? 0 : v + 1)), 30);
    return () => clearInterval(id);
  }, [end]);

  const q = Math.min(n, Q.length);
  const a = Math.max(0, Math.min(n - Q.length - 15, A.length));

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-4 rounded-[2rem] bg-primary/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border bg-card/90 text-left shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-yellow-400/80" />
          <span className="size-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">acme/backend · main</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-green-500" /> Indexed
          </span>
        </div>
        <div className="min-h-72 space-y-4 p-4 text-sm sm:p-6">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
              {Q.slice(0, q)}
            </div>
          </div>
          {q === Q.length && (
            <div className="flex gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Sparkles className="size-4" />
              </div>
              <div className="space-y-3">
                <p className="leading-relaxed text-foreground/90">
                  {a === 0
                    ? [0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="mr-1 inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: `${i * 120}ms` }}
                        />
                      ))
                    : A.slice(0, a)}
                </p>
                <div className={cn("flex flex-wrap gap-2 transition-all duration-500", a === A.length ? "opacity-100" : "translate-y-2 opacity-0")}>
                  {SOURCES.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 rounded-md border bg-muted/60 px-2 py-1 font-mono text-xs text-muted-foreground">
                      <FileCode2 className="size-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <style>{`
        @keyframes dp-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
        @keyframes dp-blob { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(60px,40px) scale(1.2) } }
        @keyframes dp-shimmer { from { transform: translateX(-150%) skewX(-12deg) } to { transform: translateX(450%) skewX(-12deg) } }
        @keyframes dp-gradient { to { background-position: 200% 50% } }
        @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation: none !important } }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, #000 30%, transparent 100%)",
          }}
        />
        <div className="absolute -top-32 left-[10%] size-[26rem] animate-[dp-blob_16s_ease-in-out_infinite] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute -top-20 right-[8%] size-[22rem] animate-[dp-blob_20s_ease-in-out_infinite_reverse] rounded-full bg-fuchsia-500/15 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-30 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <BrandMark />
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>Sign in</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pb-24 pt-12 md:pt-20">
        <section className="space-y-12 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <Up><DevPilotIcon className="mx-auto size-16 rounded-2xl shadow-lg ring-1 ring-border" /></Up>
            <Up d={100}>
              <h1 className="font-heading text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
                Your codebase,{" "}
                <span
                  className="animate-[dp-gradient_6s_linear_infinite] bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, var(--primary), oklch(0.75 0.18 320), oklch(0.78 0.14 220), var(--primary))",
                    backgroundSize: "200% auto",
                  }}
                >
                  answering back.
                </span>
              </h1>
            </Up>
            <Up d={200}>
              <p className="mx-auto max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
                Connect GitHub, index any repository, and chat with your codebase using retrieval-augmented answers and citations.
              </p>
            </Up>
            <Up d={300} className="flex flex-col justify-center gap-3 sm:flex-row">
              <a href={getGithubLoginUrl()} className={cn(buttonVariants({ size: "lg" }), "group relative inline-flex items-center justify-center gap-2 overflow-hidden")}>
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-[dp-shimmer_3.2s_ease-in-out_infinite] bg-white/25" />
                <FolderGit2 className="relative size-4" />
                <span className="relative">Continue with GitHub</span>
                <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "backdrop-blur")}>See how it works</Link>
            </Up>
          </div>
          <Up d={400}><ChatDemo /></Up>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Up key={f.title} d={i * 120}>
              <div
                onMouseMove={onMove}
                className="group relative h-full overflow-hidden rounded-2xl border bg-card/70 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), oklch(from var(--primary) l c h / 0.14), transparent 70%)" }}
                />
                <div className="relative">
                  <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <f.icon className="size-5" />
                  </div>
                  <h2 className="font-medium">{f.title}</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </div>
            </Up>
          ))}
        </section>
      </main>
    </div>
  );
}