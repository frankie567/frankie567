import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useCalendly } from '../hooks/calendly';

interface HeaderItem {
  title: string;
  pathname: string;
}

const Header: React.FunctionComponent = () => {
  const router = useRouter();
  const items = useMemo<HeaderItem[]>(
    () => [
      { title: 'Home', pathname: '/' },
      { title: 'Blog', pathname: '/blog' },
    ],
    [],
  );
  const openCalendly = useCalendly();

  const [top, setTop] = useState(true);

  useEffect(() => {
    const scrollHandler = () => {
      window.pageYOffset > 10 ? setTop(false) : setTop(true)
    };
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [top]);


  return (
    <header className={`fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out ${!top && 'bg-gray-800 blur shadow-lg'}`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Site branding */}
          <div className="flex-shrink-0 mr-4">
            {/* Logo */}
            <Link href="/" passHref>
              <a className="block">
                <Image src="/logos/francois-voron.svg" layout="fixed" width="150" height="50" alt="François Voron Logo" />
              </a>
            </Link>
          </div>

          {/* Site navigation */}
          <nav className="flex flex-grow">
            <ul className="flex flex-grow justify-end flex-wrap items-center">
              <li>
                <Link href="/references" passHref>
                  <a className="font-medium hover:text-red-500 px-5 py-3 flex items-center transition duration-150 ease-in-out">References</a>
                </Link>
              </li>
              <li>
                <Link href="/fastapi-book" passHref>
                  <a className="font-medium hover:text-red-500 px-5 py-3 flex items-center transition duration-150 ease-in-out">FastAPI book</a>
                </Link>
              </li>
              <li>
                <Link href="/blog" passHref>
                  <a className="font-medium hover:text-red-500 px-5 py-3 flex items-center transition duration-150 ease-in-out">Blog</a>
                </Link>
              </li>
              <li>
                <span onClick={() => openCalendly()} className="btn-sm bg-red-500 hover:bg-red-600 ml-3 cursor-pointer">
                  Book a call
                </span>
              </li>
            </ul>

          </nav>

        </div>
      </div>
    </header>
  );
};

export default Header;
