import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client'
import toast, {Toaster} from 'react-hot-toast';
import { useForm } from 'react-hook-form'

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

const ProductMutation = gql`
    mutation ($id:String!, $title: String!, $description: String!, $price: String!, $imageUrl: String!) {
        updateProduct(id: $id, title: $title, description: $description, price: $price, imageUrl: $imageUrl,) {
            id
            title
            price
            description
            imageUrl
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
    
    const [updateProduct, mutationResult] = useMutation(ProductMutation,{
        onCompleted: ({updateProduct}) => {
            setValue('title', updateProduct.title)
            setValue('description', updateProduct.description)
            setValue('price', updateProduct.price)
            setValue('imageUrl', updateProduct.imageUrl)
        }
    });

    if (loading) return <p>Loading...</p>;
    if (error)   return <p>Oh no... {error.message}</p>;
        
    const onSubmit = async data => {
        const {title, description, price, imageUrl} = data
        const variables = { id, title, description, price, imageUrl}
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

export const getServerSideProps = async ({ params }) => {
    return {
        props: { id: params.id }
    };
};