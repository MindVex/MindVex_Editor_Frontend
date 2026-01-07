import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { workbenchStore } from '~/lib/stores/workbench';
import React from 'react';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Link } from '@remix-run/react';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { ProjectAwareLayout } from '~/components/ui/ProjectAwareLayout';
import DirectGitCloneButton from '~/components/chat/DirectGitCloneButton';
import { DirectImportFolderButton } from '~/components/chat/DirectImportFolderButton';

export const meta: MetaFunction = () => {
  return [{ title: 'MindVex' }, { name: 'description', content: 'Talk with MindVex, an AI development platform' }];
};

export const loader = () => json({});

/**
 * Landing page component for MindVex
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-mindvex-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <div className="flex flex-col lg:flex-row h-full">
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <ClientOnly>
          {() => {
            const [showWorkbench, setShowWorkbench] = React.useState(false);
            
            React.useEffect(() => {
              // Listen to workbench store to show/hide content
              const unsubscribe = workbenchStore.showWorkbench.subscribe((value: boolean) => {
                setShowWorkbench(value);
              });
              
              return unsubscribe;
            }, []);
            
            return (
              <div className="flex-1 flex flex-col h-full">
                {showWorkbench ? (
                  <div className="flex-1 h-full">
                    <Workbench chatStarted={true} isStreaming={false} />
                  </div>
                ) : (
                  <ProjectAwareLayout>
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <div className="max-w-2xl w-full text-center">
                        <h1 className="text-4xl font-bold text-mindvex-elements-textPrimary mb-2">Welcome to MindVex</h1>
                        <p className="text-lg text-mindvex-elements-textSecondary mb-8">Your comprehensive development platform</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                          <div 
                            onClick={() => workbenchStore.toggleRightChat(true)}
                            className="bg-mindvex-elements-background-depth-2 hover:bg-mindvex-elements-background-depth-3 p-6 rounded-lg border border-mindvex-elements-borderColor transition-theme cursor-pointer"
                          >
                            <div className="text-2xl mb-2">💬</div>
                            <h3 className="text-xl font-semibold text-mindvex-elements-textPrimary mb-2">Chat with Your Code</h3>
                            <p className="text-mindvex-elements-textSecondary">Discuss, analyze, and get help with your codebase</p>
                          </div>
                          <div className="bg-mindvex-elements-background-depth-2 hover:bg-mindvex-elements-background-depth-3 p-6 rounded-lg border border-mindvex-elements-borderColor transition-theme">
                            <div className="text-2xl mb-2">📁</div>
                            <h3 className="text-xl font-semibold text-mindvex-elements-textPrimary mb-2">Import Folder</h3>
                            <p className="text-mindvex-elements-textSecondary mb-4">Import a folder to work with</p>
                            <DirectImportFolderButton />
                          </div>
                          <div className="bg-mindvex-elements-background-depth-2 hover:bg-mindvex-elements-background-depth-3 p-6 rounded-lg border border-mindvex-elements-borderColor transition-theme">
                            <div className="text-2xl mb-2">🐙</div>
                            <h3 className="text-xl font-semibold text-mindvex-elements-textPrimary mb-2">Clone Repository</h3>
                            <p className="text-mindvex-elements-textSecondary mb-4">Clone a repo from GitHub</p>
                            <DirectGitCloneButton />
                          </div>

                        </div>
                        
                        <div className="flex flex-col items-center gap-4 max-w-2xl text-center mb-8">
                          <div className="flex gap-2">
                            <DirectImportFolderButton />
                          </div>
                        </div>
                        
                        <Link to="/editor" className="inline-block bg-mindvex-elements-background-depth-2 hover:bg-mindvex-elements-background-depth-3 px-6 py-3 rounded-lg border border-mindvex-elements-borderColor transition-theme">
                          <div className="text-xl mb-1">💻</div>
                          <h3 className="text-lg font-semibold text-mindvex-elements-textPrimary">Open Code Editor</h3>
                        </Link>
                      </div>
                    </div>
                  </ProjectAwareLayout>
                )}
              </div>
            );
          }}
        </ClientOnly>
      </div>
    </div>
  );
}
