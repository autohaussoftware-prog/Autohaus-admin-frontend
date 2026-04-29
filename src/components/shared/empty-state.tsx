import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-400">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-lg text-sm text-zinc-500">{description}</p>
      </CardContent>
    </Card>
  );
}
