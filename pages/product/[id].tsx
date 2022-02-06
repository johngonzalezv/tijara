import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client'
import toast, {Toaster} from 'react-hot-toast';
import { useForm } from 'react-hook-form'
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../lib/prisma';

const ProductQuery = gql `
    query ($id: String!) {
        product(id: $id) {
            title
            price
            description
            imageUrl
            available
        }
    }
`;

const ProductMutation = gql`
    mutation ($id:String!, $title: String!, $description: String!, $price: String!, $imageUrl: String!, $available: Boolean!) {
        updateProduct(id: $id, title: $title, description: $description, price: $price, imageUrl: $imageUrl, available: $available) {
            id
            title
            price
            description
            imageUrl
            available
        }
    }
`;
export default function ({ id }) {
    const { loading, error, data} = useQuery(ProductQuery, { variables: { id } });

    const {
        register,
        setValue,
        handleSubmit,
        // formState: { errors },
        // reset,
    } = useForm({defaultValues: data?.product})

    setValue('title', data?.product.title)
    setValue('description', data?.product.description)
    setValue('price', data?.product.price)
    setValue('imageUrl', data?.product.imageUrl)
    setValue('available', data?.product.available)
    
    const [updateProduct, mutationResult] = useMutation(ProductMutation,{
        onCompleted: ({updateProduct}) => {
            setValue('title', updateProduct.title)
            setValue('description', updateProduct.description)
            setValue('price', updateProduct.price)
            setValue('imageUrl', updateProduct.imageUrl)
            setValue('available', updateProduct.available)
        }
    });

    if (loading) return <p>Loading...</p>;
    if (error)   return <p>Oh no... {error.message}</p>;
        
    const onSubmit = async data => {
        const {title, description, price, imageUrl, available} = data
        const variables = { id, title, description, price, imageUrl, available}
        try {
            toast.promise(updateProduct({ variables }), {
                loading: 'Actualizando producto ...',
                success: 'Producto actualizado correctamente!',
                error: `Algo salió mal! Por favor intenta de nuevo - ${mutationResult.error}`
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            <Toaster />
            <form className='prose container mx-auto px-8' onSubmit={handleSubmit(onSubmit)}>
                <input name="title" type="text" 
                    className='border-none w-full text-3xl font-black text-center'
                    {...register('title', { required: true })}
                />
                <img src={data.product.imageUrl} className='shadow-lg rounder-lg' />
                <input name="description" type="text" 
                    className='border-none w-full'
                    {...register('description', { required: true })}
                />

                <input name="price" type="text" 
                    className='border-none w-full'
                    {...register('price', { required: true })}
                />
                <div>
                <label className="form-check-label inline-block text-gray-700 p-3" >Disponible:</label>
                <input name="available" type="checkbox" role="switch" id="flexSwitchCheckDefault56"
                    className="appearance-none w-9 rounded-full bg-white bg-contain bg-gray-300  cursor-pointer shadow-sm"
                    {...register('available')}
                />
                </div>
                <button
                    disabled={mutationResult.loading}
                    type="submit"
                    className="my-4 capitalize bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600"
                    >
                    {mutationResult.loading ? (
                        <span className="flex items-center justify-center">
                        <svg
                            className="w-6 h-6 animate-spin mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                        </svg>
                        Actualizando ...
                        </span>
                    ) : (
                        <span>Actualice el producto</span>
                    )}
                    </button>
            </form>
        </div>
    );
}

export const getServerSideProps = async ({ req, res, params }) => {
    const session = getSession(req, res)

    if (!session) {
        return {
            redirect: {
                permanent: false,
                destination: '/api/auth/login'
            },
            props: {}
        }
    }

    const user = await prisma.user.findUnique({
        select: {
            email: true,
            role: true
        },
        where: {
            email: session.user.email
        }
    });

    if (user.role !== 'PROVIDER') {
        return {
            redirect: {
                permanent: false,
                destination: '/404'
            },
            props: {}
        };
    }
    
    return {
        props: { id: params.id }
    };
};

// TODOS:
// 1. An user can't update a product of other
// 2. ux fail, when a product is edited, while data is returned, inputs take old value