'use client';

export default function dummyImageLoader({ src, width, quality }) {
  if (src.startsWith('http')) {
    return src;
  }
  return `${process.env.HOST}${src}?w=${width}&q=${quality || 75}`;
}
