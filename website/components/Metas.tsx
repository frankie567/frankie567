import NextHead from 'next/head';
import React from 'react';

interface MetasProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
}

const defaultProps: MetasProps = {
  title: 'François Voron',
  description: 'I build high-quality softwares with the best technologies to achieve your business goals in a fast-changing environment. Free 30-minutes call to talk about your project.',
  image: `${process.env.HOST}/meta-image.jpg`,
  canonical: undefined,
};

const Metas: React.FunctionComponent<React.PropsWithChildren<MetasProps>> = ({ title, description, image, canonical } = defaultProps) => {
  return (
    <NextHead>
      <title key="title">{title}</title>
      <meta key="og_title" property="og:title" content={title} />
      <meta key="twitter_title" property="twitter:title" content={title} />

      <meta key="description" name="description" content={description} />
      <meta key="og_description" property="og:description" content={description} />
      <meta key="twitter_description" property="twitter:description" content={description} />

      <meta key="og_image" property="og:image" content={image} />
      <meta key="twitter_image" property="twitter:image" content={image} />

      {canonical && <link rel="canonical" href={canonical} />}
    </NextHead>
  );
};

export default Metas;
