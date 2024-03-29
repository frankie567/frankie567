import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { useOpenCalendly } from '../hooks/calendly';
import Transition from './Transition';

const menuItems = [
  { path: '/references', title: 'References' },
  // { path: "/fastapi-book", title: "FastAPI book" },
  { path: '/blog', title: 'Blog' },
];

const Header: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  const { events } = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [top, setTop] = useState(true);
  const openCalendly = useOpenCalendly();

  const mobileNav = useRef<HTMLDivElement>(null);

  // Close the menu on route change
  useEffect(() => {
    const handler = () => setMobileNavOpen(false);
    events.on('routeChangeStart', handler);
    return () => events.off('routeChangeStart', handler);
  }, [events]);

  // Close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!mobileNavOpen || key !== 'Escape') return;
      setMobileNavOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  // Detect whether user has scrolled the page down by 10px
  useEffect(() => {
    const scrollHandler = () => {
      window.pageYOffset > 10 ? setTop(false) : setTop(true);
    };
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [top]);


  return (
    <header className={`fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out ${!top && 'bg-gray-800 backdrop-blur-sm shadow-lg'}`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-1">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Site branding */}
          <div className="flex-shrink-0 mr-4">
            {/* Logo */}
            <Link href="/" className="block">
              <Image
                src="/logos/francois-voron.svg"
                width="150"
                height="56"
                alt="François Voron Logo" />
            </Link>
          </div>

          {/* Site navigation */}
          <nav className="hidden md:flex md:flex-grow">
            <ul className="flex flex-grow justify-end flex-wrap items-center">
              {menuItems.map((item) =>
                <li key={item.path}>
                  <Link href={item.path} className="font-medium hover:text-red-500 px-5 py-3 flex items-center transition duration-150 ease-in-out">
                    {item.title}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Mobile menu */}
          <div className="flex md:hidden">

            {/* Hamburger button */}
            <button
              className={`hamburger ${mobileNavOpen && 'active'}`}
              aria-controls="mobile-nav"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <span className="sr-only">Menu</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect y="4" width="24" height="2" />
                <rect y="11" width="24" height="2" />
                <rect y="18" width="24" height="2" />
              </svg>
            </button>

            {/*Mobile navigation */}
            <div ref={mobileNav}>
              <Transition
                show={mobileNavOpen}
                tag="nav"
                id="mobile-nav"
                className="absolute top-full h-screen pb-16 z-20 left-0 w-full overflow-scroll bg-gray-900"
                enter="transition ease-out duration-200 transform"
                enterStart="opacity-0 -translate-y-2"
                enterEnd="opacity-100 translate-y-0"
                leave="transition ease-out duration-200"
                leaveStart="opacity-100"
                leaveEnd="opacity-0"
              >
                <ul className="px-5 py-2">
                  {menuItems.map((item) =>
                    <li key={item.path}>
                      <Link href={item.path} className="flex hover:text-red-500 py-2">
                        {item.title}
                      </Link>
                    </li>
                  )}
                </ul>
              </Transition>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
