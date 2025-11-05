import React, { useState, useEffect } from 'react';
import type { PageContent } from '../types';

const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const href = e.currentTarget.getAttribute('href');
  if (!href || href === '#') return;

  const targetId = href.substring(1);
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    const headerOffset = targetId === 'home' ? 0 : 64; // h-16 header height
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

interface HeaderProps {
  onOpenGallery: () => void;
  content: PageContent | null;
}

function Header({ onOpenGallery, content }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: '#home', label: content?.navHome || 'Home', type: 'link' },
    { href: '#diensten', label: content?.navServices || 'Diensten', type: 'link' },
    { href: '#before-after', label: content?.navBeforeAfter || 'Voor & Na', type: 'link' },
    { label: content?.navGallery || 'Galerij', type: 'button' },
    { href: '#contact', label: content?.navContact || 'Contact', type: 'link' },
  ];
  
  const logo = content?.logo;
  const companyName = content?.companyName || 'Andries Service+';
  const logoUrl = logo?.url || '';

  const renderNavLinks = (isMobile: boolean) => navLinks.map((item) => (
    item.type === 'link' ? (
      <a
        key={item.label}
        href={item.href}
        onClick={(e) => {
          handleSmoothScroll(e);
          if (isMobile) setIsMenuOpen(false);
        }}
        className={isMobile ? "text-gray-300 hover:bg-zinc-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors" : "text-gray-300 hover:bg-zinc-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"}
      >
        {item.label}
      </a>
    ) : (
      <button
        key={item.label}
        onClick={() => {
          onOpenGallery();
          if (isMobile) setIsMenuOpen(false);
        }}
        className={isMobile ? "text-gray-300 hover:bg-zinc-800 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors" : "text-gray-300 hover:bg-zinc-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"}
      >
        {item.label}
      </button>
    )
  ));

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-zinc-950/90 shadow-lg backdrop-blur-sm' : 'bg-transparent'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <a href="#home" onClick={handleSmoothScroll} className="flex items-center text-xl font-bold tracking-tight text-white" aria-label="Home">
                {logoUrl ? (
                   <img 
                    className="h-10 w-10 rounded-full mr-3 object-contain" 
                    src={logoUrl}
                    width="40"
                    height="40"
                    alt={logo?.alt || 'Andries Service+ Logo'}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full mr-3 bg-zinc-800"></div>
                )}
                <span dangerouslySetInnerHTML={{ __html: companyName.replace('Service+', '<span class="text-green-500">Service+</span>') }} />
              </a>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {renderNavLinks(false)}
            </div>
            
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="bg-zinc-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
            
          </div>
        </nav>
      </header>

      {isMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-zinc-900/95 backdrop-blur-sm z-30" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks(true)}
          </div>
        </div>
      )}
    </>
  );
}

export default Header;