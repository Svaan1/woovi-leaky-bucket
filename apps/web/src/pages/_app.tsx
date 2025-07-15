import React, { Suspense } from 'react';
import type { AppProps } from 'next/app';
import '../styles/index.css';

import { ReactRelayContainer } from '../relay/ReactRelayContainer';
import { AuthProvider } from '../auth/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<Suspense fallback="loading">
			<AuthProvider>
				<ReactRelayContainer Component={Component} props={pageProps} />
			</AuthProvider>
		</Suspense>
	);
}
