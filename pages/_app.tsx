import type { AppProps } from 'next/app'
import Layout from '@/components/Layout'
import '@/styles/globals.css' // make sure your global styles are loaded

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);


export default function MyApp({ Component, pageProps, router }: AppProps) {
  const noLayoutRoutes = ['/login', '/forgot-password'];
  const isNoLayout = noLayoutRoutes.includes(router.pathname);

  return isNoLayout ? (
    <Component {...pageProps} />
  ) : (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}