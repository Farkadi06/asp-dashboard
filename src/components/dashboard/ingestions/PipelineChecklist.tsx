"use client";

import { CheckCircle2, Circle, Info } from "lucide-react";
import { PipelineStage } from "@/lib/types/ingestion-detail";
import { cn } from "@/lib/utils";

interface PipelineChecklistProps {
  stages: PipelineStage[];
}

export function PipelineChecklist({ stages }: PipelineChecklistProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Pipeline Stages
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        All stages run automatically. No manual intervention required.
      </p>

      <div className="space-y-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex items-start gap-3 group relative"
          >
            <div className="flex-shrink-0 mt-0.5">
              {stage.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {stage.name}
                </h3>
                <div className="group/tooltip relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                    {stage.description}
                  </div>
                </div>
              </div>
              {stage.completedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Completed at {new Date(stage.completedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

