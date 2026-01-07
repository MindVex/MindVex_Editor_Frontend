import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';

export async function loader(args: LoaderFunctionArgs) {
  // Redirect to the main chat page, preserving the chat ID if needed
  return redirect(`/chat`);
}

export default function ChatIdRedirect() {
  return null; // This component won't be rendered due to the redirect
}
