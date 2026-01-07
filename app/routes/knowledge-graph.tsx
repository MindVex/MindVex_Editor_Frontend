import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { KnowledgeGraph } from '~/components/knowledge-graph/KnowledgeGraph.client';
import { BaseKnowledgeGraph } from '~/components/knowledge-graph/BaseKnowledgeGraph';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';

export const meta: MetaFunction = () => {
  return [{ title: 'MindVex - Knowledge Graph' }, { name: 'description', content: 'Visualize knowledge relationships' }];
};

export const loader = () => json({});

export default function KnowledgeGraphPage() {
  return (
    <div className="flex flex-col h-full w-full bg-mindvex-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <div className="flex flex-col lg:flex-row h-full">
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <ClientOnly fallback={<BaseKnowledgeGraph />}>{() => <KnowledgeGraph />}</ClientOnly>
        <ClientOnly>{() => <Workbench chatStarted={true} isStreaming={false} />}</ClientOnly>
      </div>
    </div>
  );
}