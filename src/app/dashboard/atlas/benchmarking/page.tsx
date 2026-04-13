import { BenchmarkingWorkspace } from "@/components/benchmarking/BenchmarkingWorkspace";
import { Card } from "@/components/ui/Card";
import { getBenchmarkWorkspace } from "@/lib/benchmarking/workspace";

export const dynamic = "force-dynamic";

export default async function BenchmarkingPage() {
  const workspace = await getBenchmarkWorkspace();

  if (!workspace) {
    return (
      <Card variant="glass" padding="lg">
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <h2 className="font-playfair text-2xl font-semibold text-cream">
            Benchmark dataset unavailable
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-muted">
            Seed the benchmark dataset to render the redesigned benchmarking stage and its
            evidence-backed comparison views.
          </p>
        </div>
      </Card>
    );
  }

  return <BenchmarkingWorkspace workspace={workspace} />;
}
