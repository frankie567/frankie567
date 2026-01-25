module.exports = {
  output: 'export',
  env: {
    HOST: process.env.HOST,
  },
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js',
  },
};
