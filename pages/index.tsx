import Head from 'next/head';
import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { Product } from '../components/Product';
import { useSelector } from 'react-redux';

const AllProductsQuery = gql`
  query allProductsQuery($first: Int, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          imageUrl
          price
          title
          description
          id
          available
          user {
            company
          }
        }
      }
    }
  }
`;

function Home() {
  const searchText = useSelector((state) => state.search.text)

  const { data, loading, error, fetchMore } = useQuery(AllProductsQuery, {
    variables: { first: 2 },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  const { endCursor, hasNextPage } = data?.products.pageInfo;

  return (
    <div>
      <Head>
        <title>Tijara</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <p><b>Producto buscado: </b>{searchText}</p>
      <div className="container mx-auto max-w-5xl my-20 px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.products.edges.map(({ node }, i) => (
            <Link href={`/product/${node.id}`} key={i}>
              <a>
                <Product
                  title={node.title}
                  price={node.price}
                  id={node.id}
                  description={node.description}
                  imageUrl={node.imageUrl}
                  available={node.available}
                  company={node.user.company}
                />
              </a>
            </Link>
          ))}
        </div>
        {hasNextPage ? (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded my-10"
            onClick={() => {
              fetchMore({
                variables: { after: endCursor },
                updateQuery: (prevResult, { fetchMoreResult }) => {
                  fetchMoreResult.products.edges = [
                    ...prevResult.products.edges,
                    ...fetchMoreResult.products.edges,
                  ];
                  return fetchMoreResult;
                },
              });
            }}
          >
            más
          </button>
        ) : (
          <p className="my-10 text-center font-medium">
            Has alcanzado el final!
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
