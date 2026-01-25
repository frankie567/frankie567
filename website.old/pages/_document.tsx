import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body className="font-inter antialiased bg-gray-900 text-white tracking-tight">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  };
}

export default MyDocument;
