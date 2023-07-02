import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

interface FooterProps {
}

const Footer: React.FunctionComponent<React.PropsWithChildren<FooterProps>> = ({ }) => {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Top area: Blocks */}
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12 border-t border-gray-800">

          {/* 1st block */}
          <div className="sm:col-span-12 lg:col-span-3">
            <div className="mb-2">
              {/* Logo */}
              <Link href="/" className="inline-block">
                <Image src="/logos/francois-voron.svg" layout="fixed" width="150" height="56" alt="François Voron Logo" />
              </Link>
            </div>
            <div className="text-sm text-justify text-gray-500">
              Full-stack web developer and data scientist, I&#39;ve a proven track record working in SaaS industry, with a special focus on Python backends and REST API.
            </div>
          </div>

          {/* 2nd block */}
          <div className="lg:col-start-7 sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-gray-400 font-medium mb-2">About me</h3>
            <ul className="text-sm">
              <li className="mb-2">
                <Link href="/references" className="text-gray-500 hover:text-white transition duration-150 ease-in-out">References</Link>
              </li>
              {/*<li className="mb-2">
                <Link href="/fastapi-book" passHref><a className="text-gray-500 hover:text-white transition duration-150 ease-in-out">FastAPI book</a></Link>
              </li> */}
              <li className="mb-2">
                <Link href="/blog" className="text-gray-500 hover:text-white transition duration-150 ease-in-out">Blog</Link>
              </li>
            </ul>
          </div>

          {/* 3rd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-gray-400 font-medium mb-2">Open source</h3>
            <ul className="text-sm">
              <li className="mb-2">
                <a href="https://www.fief.dev" className="text-gray-500 hover:text-white transition duration-150 ease-in-out">Fief</a>
              </li>
              <li className="mb-2">
                <a href="https://github.com/frankie567/fastapi-users" className="text-gray-500 hover:text-white transition duration-150 ease-in-out">FastAPI Users</a>
              </li>
              <li className="mb-2">
                <a href="https://github.com/frankie567/httpx-oauth" className="text-gray-500 hover:text-white transition duration-150 ease-in-out">HTTPX OAuth</a>
              </li>
            </ul>
          </div>

          {/* 4th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-gray-400 font-medium mb-2">Legal</h3>
            <ul className="text-sm">
              <li className="mb-2">
                <Link href="/terms" className="text-gray-500 hover:text-white transition duration-150 ease-in-out">Terms</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom area */}
        <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-gray-800">

          {/* Social links */}
          <ul className="flex mb-4 md:order-1 md:ml-4 md:mb-0">
            <li>
              <a href="https://github.com/frankie567" className="flex justify-center items-center bg-gray-800 hover:bg-red-500 rounded-full shadow transition duration-150 ease-in-out" aria-label="Github">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z" />
                </svg>
              </a>
            </li>
            <li className="ml-4">
              <a href="https://twitter.com/fvoron" className="flex justify-center items-center bg-gray-800 hover:bg-red-500 rounded-full shadow transition duration-150 ease-in-out" aria-label="Twitter">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 11.5c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.3.6-2.1.8-.6-.6-1.5-1-2.4-1-1.7 0-3.2 1.5-3.2 3.3 0 .3 0 .5.1.7-2.7-.1-5.2-1.4-6.8-3.4-.3.5-.4 1-.4 1.7 0 1.1.6 2.1 1.5 2.7-.5 0-1-.2-1.5-.4 0 1.6 1.1 2.9 2.6 3.2-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3.1 2.3-1.1.9-2.5 1.4-4.1 1.4H8c1.5.9 3.2 1.5 5 1.5 6 0 9.3-5 9.3-9.3v-.4c.7-.5 1.3-1.1 1.7-1.8z" />
                </svg>
              </a>
            </li>
            <li className="ml-4">
              <a href="https://www.linkedin.com/in/fvoron/" className="flex justify-center items-center bg-gray-800 hover:bg-red-500 rounded-full shadow transition duration-150 ease-in-out" aria-label="LinkedIn">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.3 8H8.7c-.4 0-.7.3-.7.7v14.7c0 .3.3.6.7.6h14.7c.4 0 .7-.3.7-.7V8.7c-.1-.4-.4-.7-.8-.7zM12.7 21.6h-2.3V14h2.4v7.6h-.1zM11.6 13c-.8 0-1.4-.7-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4-.1.7-.7 1.4-1.4 1.4zm10 8.6h-2.4v-3.7c0-.9 0-2-1.2-2s-1.4 1-1.4 2v3.8h-2.4V14h2.3v1c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2h.1z"></path>
                </svg>
              </a>
            </li>
          </ul>

          {/* Copyrights note */}
          <div className="text-sm text-gray-500 mr-4">Made with ❤️ from 🇫🇷 - François Voron - SIRET 52101474600023</div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
