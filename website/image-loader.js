'use client';

export default function dummyImageLoader({ src, width, quality }) {
  return `${process.env.HOST}${src}?w=${width}&q=${quality || 75}`;
}
