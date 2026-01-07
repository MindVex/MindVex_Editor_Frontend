import React from 'react';

const EXAMPLE_PROMPTS: { text: string }[] = [
  { text: 'Explain how this authentication system works' },
  { text: 'Find and fix bugs in this component' },
  { text: 'Suggest improvements to this algorithm' },
  { text: 'Show me all the API endpoints in this project' },
  { text: 'Explain the architecture of this application' },
  { text: 'What does this function do and how can I improve it?' },
  { text: 'Find all usages of this class or function' },
  { text: 'Review this code for security vulnerabilities' },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    EXAMPLE_PROMPTS.length > 0 && (
      <div id="examples" className="relative flex flex-col gap-9 w-full max-w-3xl mx-auto flex justify-center mt-6">
        <div
          className="flex flex-wrap justify-center gap-2"
          style={{
            animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
          }}
        >
          {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => {
            return (
              <button
                key={index}
                onClick={(event) => {
                  sendMessage?.(event, examplePrompt.text);
                }}
                className="border border-mindvex-elements-borderColor rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 text-mindvex-elements-textSecondary hover:text-mindvex-elements-textPrimary px-3 py-1 text-xs transition-theme"
              >
                {examplePrompt.text}
              </button>
            );
          })}
        </div>
      </div>
    )
  );
}
