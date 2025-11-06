import React from 'react';
import type { PageContent } from '../types';

const SocialLink = ({ href, tooltip, children }: { href: string, tooltip: string, children: React.ReactNode }) => (
  <div className="relative group">
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors duration-300">
      <span className="sr-only">{tooltip}</span>
      <span className="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-1 group-hover:rotate-[-10deg]">
        {children}
      </span>
    </a>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs font-medium text-gray-200 bg-zinc-800 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none whitespace-nowrap">
      {tooltip}
    </div>
  </div>
);

interface FooterProps {
  content: PageContent | null;
}

function Footer({ content }: FooterProps) {
  const facebookUrl = content?.facebookUrl;
  const copyrightText = content?.footerCopyrightText || 'Andries Service+. Alle rechten voorbehouden.';

  return (
    <footer className="bg-zinc-950">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          {facebookUrl && (
            <SocialLink href={facebookUrl} tooltip="Facebook">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.5c0-1.925 1.422-2.5 3.5-2.5h1.5v3z"/>
              </svg>
            </SocialLink>
          )}
        </div>
        <p className="text-gray-500">
          &copy; {new Date().getFullYear()} <span dangerouslySetInnerHTML={{ __html: copyrightText }} />
        </p>
      </div>
    </footer>
  );
}

export default Footer;