import '../styles/tailwind.css';
import { UserProvider } from '@auth0/nextjs-auth0';
import Layout from '../components/Layout';
import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/apollo';
import { Provider } from 'react-redux';
import store from '../lib/store';

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <UserProvider>
        <ApolloProvider client={client}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ApolloProvider>
      </UserProvider>
    </Provider>
  );
}

export default MyApp;
