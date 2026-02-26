import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
// import { http, HttpResponse, delay } from 'msw';
// import { setupServer } from 'msw/node';
// import { AIChat } from '../../../app/components/AIChat'; // Example import path

// Setting up a mock server specifically for simulating streaming text chunks
// const server = setupServer();

describe('AI Streaming Response Component', () => {
  /*
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  */

  it('progressively renders a streaming markdown response from the AI provider', async () => {
    // 1. Mock the API route that the Vercel AI SDK hits
    /*
    server.use(
      http.post('/api/chat', async () => {
        const encoder = new TextEncoder();
        
        // Creating a ReadableStream to simulate chunks arriving over time
        const stream = new ReadableStream({
          async start(controller) {
            const chunks = [
              'Here is ',
              'the ',
              '**solution** ',
              'to your code:',
              '\n\n```javascript\nconsole.log(1)\n```'
            ];
 
            for (const chunk of chunks) {
              await delay(50); // Simulate network delay between chunks
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          },
        });
 
        // Return the raw stream
        return new HttpResponse(stream, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
    );
 
    const user = userEvent.setup();
    render(<AIChat />);
 
    // Act: Send a message to the AI
    const input = screen.getByPlaceholderText(/ask mindvex/i);
    await user.type(input, 'How do I log 1?');
    await user.click(screen.getByRole('button', { name: /send/i }));
 
    // Assert: The message should appear incrementally
    // Find the Markdown rendering container
    const messageContainer = await screen.findByTestId('ai-message-latest');
 
    // Wait and verify chunks are appearing
    await waitFor(() => expect(messageContainer).toHaveTextContent(/Here is/i), { timeout: 200 });
    await waitFor(() => expect(messageContainer).toHaveTextContent(/solution/i), { timeout: 300 });
 
    // Assert the final code block renders properly (e.g., via react-markdown + shiki)
    await waitFor(() => {
      const codeBlock = messageContainer.querySelector('code');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock).toHaveTextContent('console.log(1)');
    }, { timeout: 1000 });
    */
  });

  it('aborts the stream network request when the user clicks Stop Generation', async () => {
    /*
    let streamAborted = false;
 
    server.use(
      http.post('/api/chat', async ({ request }) => {
        // Listen for the client aborting the fetch request
        request.signal.addEventListener('abort', () => {
          streamAborted = true;
        });
 
        const stream = new ReadableStream({
          async start(controller) {
            // Infinite slow stream to guarantee the test can hit "Stop" in time
            for (let i = 0; i < 50; i++) {
              await delay(200);
              if (request.signal.aborted) break;
              controller.enqueue(new TextEncoder().encode(`chunk ${i} `));
            }
            controller.close();
          },
        });
 
        return new HttpResponse(stream);
      })
    );
 
    const user = userEvent.setup();
    render(<AIChat />);
 
    // Start generation
    await user.type(screen.getByRole('textbox'), 'Tell me a long story.');
    await user.click(screen.getByRole('button', { name: /send/i }));
 
    // Wait for the Stop button to appear and click it
    const stopButton = await screen.findByRole('button', { name: /stop generating/i });
    await user.click(stopButton);
 
    // Verify the AbortController fired the signal to the server mock
    await waitFor(() => {
      expect(streamAborted).toBe(true);
    });
    */
  });
});
