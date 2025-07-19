import type { AppProps } from 'next/app'
import Layout from '@/components/Layout'
import '@/styles/globals.css' // make sure your global styles are loaded

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
