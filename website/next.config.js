module.exports = {
  env: {
    HOST: process.env.HOST,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
  reactStrictMode: true,
  images: {
    loader: 'imgix', // this is a hack until the bug is fixed
    path: process.env.HOST,
  },
}
