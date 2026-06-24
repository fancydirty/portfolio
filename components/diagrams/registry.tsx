import type * as React from "react";
import { FlowDiagram } from "@/components/diagrams/flow-diagram";
import { DIAGRAMS } from "@/components/diagrams/diagrams-data";

/** Map a stable diagram id to its rendered FlowDiagram, or null if unknown. */
export function diagramFor(id: string): React.ReactNode | null {
  const spec = DIAGRAMS[id];
  return spec ? <FlowDiagram spec={spec} /> : null;
}
