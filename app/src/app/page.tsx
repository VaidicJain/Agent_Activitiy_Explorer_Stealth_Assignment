import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Dashboard } from "@/features/events/components/dashboard";
import { ExplorerSkeleton } from "@/features/events/components/explorer-skeleton";

export default function Page() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        {/* The dashboard reads the URL (search params), so it must sit in a Suspense boundary. */}
        <Suspense fallback={<ExplorerSkeleton />}>
          <Dashboard />
        </Suspense>
      </main>
    </>
  );
}
