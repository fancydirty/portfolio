import type * as React from "react";
import { MediaryScoutDiagram } from "@/components/diagrams/mediary-scout-diagram";
import { AdkAgentDiagram } from "@/components/diagrams/adk-agent-diagram";
import { EnterpriseFlowDiagram } from "@/components/diagrams/enterprise-flow-diagram";
import { ContentPipelineDiagram } from "@/components/diagrams/content-pipeline-diagram";

/** Map a stable diagram id to its React component, or null if unknown. */
export function diagramFor(id: string): React.ReactNode | null {
  switch (id) {
    case "mediary-scout":
      return <MediaryScoutDiagram />;
    case "adk-agent":
      return <AdkAgentDiagram />;
    case "enterprise-workflow":
      return <EnterpriseFlowDiagram />;
    case "content-pipeline":
      return <ContentPipelineDiagram />;
    default:
      return null;
  }
}
