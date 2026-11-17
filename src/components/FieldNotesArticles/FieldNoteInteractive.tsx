import { useEffect, useRef, useState } from 'react';
import controlDocument from './interactives/who-is-in-control.html?raw';
import governanceDocument from './interactives/who-has-signed-what.html?raw';

const documents = {
  'who-is-in-control': controlDocument,
  'who-has-signed-what': governanceDocument,
};

/** These are reviewed, bundled documents; never pass user-provided HTML here. */
export default function FieldNoteInteractive({ slug, title }: {
  slug: keyof typeof documents;
  title: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const observer = useRef<ResizeObserver>();
  const [height, setHeight] = useState(420);

  useEffect(() => {
    const element = frame.current;
    function observeDocument() {
      observer.current?.disconnect();
      const wrapper = element?.contentDocument?.querySelector('.fn-wrap');
      if (!wrapper) return;
      const measure = () => setHeight(Math.ceil(wrapper.getBoundingClientRect().height) + 8);
      observer.current = new ResizeObserver(measure);
      observer.current.observe(wrapper);
      measure();
    }
    // A prerendered srcdoc may finish loading before React hydrates the iframe.
    element?.addEventListener('load', observeDocument);
    observeDocument();
    return () => {
      element?.removeEventListener('load', observeDocument);
      observer.current?.disconnect();
    };
  }, []);

  return (
    <section className="my-12 border-y border-[#dedfda] py-6" aria-label={title}>
      <iframe
        ref={frame}
        title={title}
        srcDoc={documents[slug]}
        loading="lazy"
        height={height}
        className="block w-full border-0"
      />
    </section>
  );
}
