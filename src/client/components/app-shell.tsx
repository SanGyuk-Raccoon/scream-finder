import { cn } from "@/client/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <main className={cn("relative isolate flex-1 overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top,rgba(99,245,210,0.16),transparent_48%)]" />
      <div className="pointer-events-none absolute right-[-10%] top-24 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </div>
    </main>
  );
}
