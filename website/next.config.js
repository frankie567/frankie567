module.exports = {
  env: {
    HOST: process.env.HOST,
  },
  reactStrictMode: true,
  images: {
    loader: 'imgix', // this is a hack until the bug is fixed
    path: '/'
  },
}
