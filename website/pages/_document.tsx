import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body className="font-inter antialiased bg-gray-900 text-white tracking-tight">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  };
}

export default MyDocument;
