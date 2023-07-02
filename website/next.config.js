module.exports = {
  output: 'export',
  env: {
    HOST: process.env.HOST,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js',
  },
};
