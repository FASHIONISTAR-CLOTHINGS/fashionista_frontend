"use client";

import { ArrowRight, ShoppingBag, Store } from "lucide-react";

function RoleCard({
  id,
  title,
  description,
  href,
  Icon,
}: {
  id: string;
  title: string;
  description: string;
  href: string;
  Icon: typeof Store;
}) {
  return (
    <a
      href={href}
      id={id}
      className="
        group flex w-full items-center gap-5 rounded-2xl border-2 border-border
        bg-muted/20 p-5 text-left transition-all duration-200
        hover:border-primary hover:bg-primary/5 hover:shadow-md active:scale-[0.99]
      "
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </a>
  );
}

export function ChooseRoleOptions() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-cream via-white to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="animate-in fade-in-0 rounded-2xl bg-white p-8 shadow-card duration-300">
          <div className="mb-8 text-center">
            <h1 className="mb-1 font-bon-foyage text-2xl font-bold tracking-wide text-primary">
              FASHIONISTAR
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign Up — choose your account type to get started
            </p>
          </div>

          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            I am a…
          </p>

          <div className="space-y-4">
            <RoleCard
              id="choose-role-vendor"
              title="Vendor"
              description="Upload your work and fashion collections"
              href="/auth/sign-up?role=vendor"
              Icon={Store}
            />
            <RoleCard
              id="choose-role-client"
              title="Client"
              description="Get your designed and tailored dress"
              href="/auth/sign-up?role=client"
              Icon={ShoppingBag}
            />
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/auth/sign-in"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
