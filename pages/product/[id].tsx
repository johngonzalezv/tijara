import React from 'react';
import { gql, useQuery } from '@apollo/client'

const ProductQuery = gql `
    query ($id: String!) {
        product(id: $id) {
            title
            price
            description
            imageUrl
        }
    }
`;

export default function ({ id }) {
    const { loading, error, data } = useQuery(ProductQuery, { variables: { id } });

    if (loading) return <p>Loading...</p>;
    if (error)   return <p>Oh no... {error.message}</p>;

    return (
        <div>
            <div className='prose container mx-auto px-8'>
                <h1>{data.product.title}</h1>
                <img src={data.product.imageUrl} className='shadow-lg rounder-lg' />
                <p>{data.product.description}</p>
                <p>{data.product.price}</p>
            </div>
        </div>
    );
}

export const getServerSideProps = async ({ params }) => {
    return {
        props: { id: params.id }
    };
};