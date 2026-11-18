import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import App from './App';

/**
 * Renders one company page to an HTML string at build time, waiting for lazy
 * routes to load, so crawlers that do not run JavaScript receive the content.
 */
export function render(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _encoding, done) { html += chunk.toString(); done(); },
      final(done) { resolve(html); done(); },
    });
    const stream = renderToPipeableStream(<App path={path} />, {
      onAllReady() { stream.pipe(sink); },
      onShellError: reject,
      onError: reject,
    });
  });
}
