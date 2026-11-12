import { MapAnnotations } from "@/components/MapAnnotations";
import { PricingPlans } from "@/components/PricingPlans";
import { Button } from "@/components/ui/button";
import { AUDIENCES, STEPS, SURFACES } from "@/constants/landing";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
    return (
        <div className="flex flex-1 flex-col">
            <section className="topo-bg px-6 pt-10 pb-24 md:px-10 md:pt-16">
                <MapAnnotations />
                <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
                    <SectionLabel>Early Access</SectionLabel>

                    <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                        An <span className="text-primary">OutPost</span> For
                        Whatever You&apos;re Building
                    </h1>

                    <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                        Chat With An AI Agent That Draws On Your Canvas And
                        Writes Your Docs, While Your Whole Team Works Alongside
                        It In Real Time.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild size="lg" className="gap-2 text-base">
                            <Link href="/sign-up">
                                Start Building Free{" "}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="text-base"
                        >
                            <Link href="#how-it-works">See How It Works</Link>
                        </Button>
                    </div>
                </div>
                <div className="survey-frame scroll-tilt mx-auto mt-16 max-w-5xl">
                    <div className="aspect-16/9.25 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl shadow-black/40">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster="/videos/hero-poster.jpg"
                            aria-label="Outpost walkthrough: the agent draws an architecture diagram and writes the spec"
                            className="size-full object-cover"
                        >
                            <source src="/videos/hero.webm" type="video/webm" />
                            <source src="/videos/hero.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>
            </section>
            <section className="border-t border-white/10 px-6 py-10 md:px-10">
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center sm:flex-row sm:justify-between sm:text-left">
                    <p className="text-sm text-muted-foreground">
                        Built For Teams Who Sketch First And Write Specs Second
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground/70">
                        {AUDIENCES.map((audience) => (
                            <span key={audience}>{audience}</span>
                        ))}
                    </div>
                </div>
            </section>
            <section
                id="product"
                className="border-t border-white/10 px-6 py-24 md:px-10"
            >
                <div className="mx-auto max-w-5xl">
                    <div className="max-w-xl">
                        <SectionLabel>01 · Surfaces</SectionLabel>
                        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                            One Agent, One Workspace, Your Whole Team.
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            OutPost Isn't Another AI Diagram Generator. The Same
                            Agent Reasons Across Your Canvas And Your Docs,
                            Turning A Rough Sketch Into A Written Spec Without
                            You Copying Anything By Hand. And Your Team Is Right
                            There With You.
                        </p>
                    </div>

                    <div className="mt-16 flex flex-col gap-20">
                        {SURFACES.map(
                            ({ icon: Icon, visual: Visual, ...surface }, i) => (
                                <SurfaceRow
                                    key={surface.title}
                                    reverse={i % 2 === 1}
                                    icon={<Icon className="size-5" />}
                                    visual={<Visual />}
                                    {...surface}
                                />
                            ),
                        )}
                    </div>
                </div>
            </section>
            <section
                id="how-it-works"
                className="border-t border-white/10 px-6 py-24 md:px-10"
            >
                <div className="mx-auto max-w-5xl">
                    <SectionLabel>02 · The Route</SectionLabel>
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Watch It Think, Not Just The Result
                    </h2>
                    <div className="mt-12 grid gap-10 md:grid-cols-3">
                        {STEPS.map((step, i) => (
                            <Step
                                key={step.title}
                                number={String(i + 1).padStart(2, "0")}
                                title={step.title}
                            >
                                {step.body}
                            </Step>
                        ))}
                    </div>
                </div>
            </section>
            <section
                id="pricing"
                className="border-t border-white/10 px-6 py-24 md:px-10"
            >
                <div className="mx-auto mb-12 max-w-5xl text-center">
                    <SectionLabel>03 · Pricing</SectionLabel>
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Start Free, Upgrade When It Clicks
                    </h2>
                    <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                        Upgrade Just Yourself, Or Your Whole Team, Billed Per
                        Member.
                    </p>
                </div>
                <PricingPlans />
            </section>
            <section className="topo-bg border-t border-white/10 px-6 py-28 md:px-10">
                <MapAnnotations />
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                    <Image
                        src="/brand/mascot-dark.png"
                        alt=""
                        width={40}
                        height={40}
                        className="opacity-80"
                    />
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Give Your Workspace a Collaborator
                    </h2>
                    <Button asChild size="lg" className="gap-2 text-base">
                        <Link href="/sign-up">
                            Get Started Free <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            <footer className="relative overflow-hidden border-t border-white/10 bg-background px-6 pt-16 pb-8 md:px-10">
                {/* Subtle background glow */}
                <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

                <div className="relative mx-auto max-w-5xl">
                    <div className="grid gap-12 pb-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
                        {/* Brand */}
                        <div className="max-w-xs">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2"
                            >
                                <Image
                                    src="/brand/mascot-dark.png"
                                    alt="OutPost"
                                    width={32}
                                    height={32}
                                    className="opacity-90"
                                />
                                <span className="text-lg font-semibold tracking-tight">
                                    Out
                                    <span className="text-primary">Post</span>
                                </span>
                            </Link>

                            <p className="mt-5 text-sm leading-6 text-muted-foreground">
                                Your Team's AI-Powered Workspace. Think On The
                                Canvas, Write In Your Docs, And Build Together
                                In Real Time.
                            </p>

                            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-primary/80">
                                    Early Access
                                </span>
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                                Product
                            </h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href="#product"
                                        className="transition-colors hover:text-primary"
                                    >
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#how-it-works"
                                        className="transition-colors hover:text-primary"
                                    >
                                        How It Works
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#pricing"
                                        className="transition-colors hover:text-primary"
                                    >
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/sign-up"
                                        className="transition-colors hover:text-primary"
                                    >
                                        Get Started
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Explore */}
                        <div>
                            <h4 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                                Explore
                            </h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href="#product"
                                        className="transition-colors hover:text-primary"
                                    >
                                        The Canvas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#product"
                                        className="transition-colors hover:text-primary"
                                    >
                                        AI Agent
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#product"
                                        className="transition-colors hover:text-primary"
                                    >
                                        Team Collaboration
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* CTA */}
                        <div>
                            <h4 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                                Start Building
                            </h4>
                            <p className="text-sm leading-6 text-muted-foreground">
                                Got An Idea? Give It a Canvas, a Collaborator,
                                And a Place To Grow.
                            </p>

                            <Button asChild className="mt-5 gap-2">
                                <Link href="/sign-up">
                                    Join OutPost
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} OutPost.
                        </p>

                        <div className="flex items-center gap-5 text-xs text-muted-foreground">
                            <span className="transition-colors hover:text-foreground">
                                Built For Builders.
                            </span>
                            <Link
                                href="/"
                                className="transition-colors hover:text-primary"
                            >
                                Back To Top ↑
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function SurfaceRow({
    icon,
    title,
    description,
    bullets,
    reverse,
    visual,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    bullets: string[];
    reverse?: boolean;
    visual: React.ReactNode;
}) {
    return (
        <div
            className={`flex flex-col gap-10 md:flex-row md:items-center ${
                reverse ? "md:flex-row-reverse" : ""
            }`}
        >
            <div className="flex-1">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    {icon}
                </div>
                <h3 className="mt-4 text-xl font-medium">{title}</h3>
                <p className="mt-2 text-muted-foreground">{description}</p>
                <ul className="mt-5 space-y-2.5">
                    {bullets.map((bullet) => (
                        <li
                            key={bullet}
                            className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            {bullet}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1">{visual}</div>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80">
            <span className="size-1.5 rotate-45 border border-primary/70" />
            {children}
        </p>
    );
}

function Step({
    number,
    title,
    children,
}: {
    number: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/60 font-mono text-[10px] text-primary">
                    {number}
                </span>
                <span className="h-px flex-1 border-t border-dashed border-white/15" />
            </div>
            <h3 className="mt-4 font-medium">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{children}</p>
        </div>
    );
}
