import type { WebContainer } from '@webcontainer/api';
import { useCallback, useEffect, useState } from 'react';
import { webcontainer as webcontainerPromise } from '~/lib/webcontainer';
import { toast } from 'react-toastify';

export function useGit() {
  const [ready, setReady] = useState(false);
  const [webcontainer, setWebcontainer] = useState<WebContainer>();

  useEffect(() => {
    webcontainerPromise.then((container) => {
      setWebcontainer(container);
      setReady(true);
    });
  }, []);

<<<<<<< HEAD
=======
  // Fetch GitHub token if user is authenticated
  useEffect(() => {
    const fetchGitHubToken = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';
        const token = localStorage.getItem('auth_token');

        if (!token) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/me/github-connection`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = (await response.json()) as { connected?: boolean; accessToken?: string };
          if (data.connected && data.accessToken) {
            setGithubToken(data.accessToken);
          }
        }
      } catch (error) {
        console.log('GitHub token not available:', error);
      }
    };

    fetchGitHubToken();
  }, []);

>>>>>>> a02f44f7d8eb51f7d0a2dc93a91079abd816b609
  const gitClone = useCallback(
    async (url: string, retryCount = 0) => {
      if (!webcontainer || !ready) {
        throw new Error('Webcontainer not initialized. Please try again later.');
      }

<<<<<<< HEAD
      // Remove branch reference if present (we'll use default branch)
      const baseUrl = url.split('#')[0];
=======
      fileData.current = {};

      let branch: string | undefined;
      let baseUrl = url;

      if (url.includes('#')) {
        [baseUrl, branch] = url.split('#');
      }

      /*
       * Skip Git initialization for now - let isomorphic-git handle it
       * This avoids potential issues with our manual initialization
       */

      const headers: {
        [x: string]: string;
      } = {
        'User-Agent': 'mindvex',
      };

      // Try to use GitHub token first, fallback to saved credentials
      const auth = lookupSavedPassword(url);

      if (githubToken) {
        // GitHub's git HTTP protocol requires Basic auth with x-access-token as username
        headers.Authorization = `Basic ${btoa(`x-access-token:${githubToken}`)}`;
      } else if (auth) {
        headers.Authorization = `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`;
      }
>>>>>>> a02f44f7d8eb51f7d0a2dc93a91079abd816b609

      try {
        // Add a small delay before retrying
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
          console.log(`Retrying clone (attempt ${retryCount + 1})...`);
        }

<<<<<<< HEAD
        console.log('[Clone] Using backend to clone repository:', baseUrl);

        // Use the backend endpoint to clone the repository
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';
        const token = localStorage.getItem('auth_token');

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/repositories/clone`, {
          method: 'POST',
=======
        await git.clone({
          fs,
          http,
          dir: webcontainer.workdir,
          url: baseUrl,
          depth: 1,
          singleBranch: true,
          ref: branch,
          corsProxy: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api'}/git-proxy`,
>>>>>>> a02f44f7d8eb51f7d0a2dc93a91079abd816b609
          headers,
          body: JSON.stringify({ url: baseUrl }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to clone repository');
        }

        console.log(`[Clone] Backend cloned ${Object.keys(result.files || {}).length} files`);

        // Write files to WebContainer
        const data: Record<string, { data: any; encoding?: string }> = {};

<<<<<<< HEAD
        for (const [relativePath, fileData] of Object.entries(result.files || {})) {
          const fileInfo = fileData as { content: string; encoding: string; binary: boolean };
          const fullPath = `${webcontainer.workdir}/${relativePath}`;

          try {
            // Ensure parent directory exists
            const pathParts = relativePath.split('/');
            if (pathParts.length > 1) {
              const dirPath = pathParts.slice(0, -1).join('/');
              await webcontainer.fs.mkdir(dirPath, { recursive: true });
            }

            // Write file
            if (fileInfo.binary && fileInfo.encoding === 'base64') {
              // Decode base64 for binary files
              const binaryData = Uint8Array.from(atob(fileInfo.content), (c) => c.charCodeAt(0));
              await webcontainer.fs.writeFile(relativePath, binaryData);
              data[relativePath] = { data: binaryData, encoding: 'binary' };
            } else {
              // Write text files
              await webcontainer.fs.writeFile(relativePath, fileInfo.content);
              data[relativePath] = { data: fileInfo.content, encoding: 'utf-8' };
            }
          } catch (error) {
            console.warn(`[Clone] Failed to write file ${relativePath}:`, error);
          }
=======
        for (const [key, value] of Object.entries(fileData.current)) {
          // Skip .git directory files — only include actual repo files
          if (key.startsWith('.git/') || key === '.git') {
            continue;
          }

          // Convert to the format expected by importGitRepoToWorkbench
          const content = value.data instanceof Uint8Array
            ? new TextDecoder().decode(value.data)
            : typeof value.data === 'string'
              ? value.data
              : String(value.data);

          data[key] = {
            data: content,
            encoding: value.encoding || 'utf8',
            // Add type and content fields for importGitRepoToWorkbench compatibility
            ...(({ type: 'file', content } as any)),
          };
>>>>>>> a02f44f7d8eb51f7d0a2dc93a91079abd816b609
        }

        console.log('[Clone] Successfully loaded files into WebContainer');
        toast.success('Repository cloned successfully!');

        return { workdir: webcontainer.workdir, data };
      } catch (error) {
        console.error('[Clone] Error:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        // Provide user-friendly error messages
        if (errorMessage.includes('Authentication') || errorMessage.includes('401')) {
          toast.error('Authentication failed. Please connect your GitHub account.');
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          toast.error('Repository not found. Please check the URL.');
        } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
          // Retry for network errors
          if (retryCount < 2) {
            return gitClone(url, retryCount + 1);
          }
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(`Failed to clone repository: ${errorMessage}`);
        }

        throw error;
      }
    },
    [webcontainer, ready],
  );

  return { ready, gitClone };
}
