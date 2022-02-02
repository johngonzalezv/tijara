import React from 'react';

export const Product = ({
  imageUrl,
  price,
  title,
  description,
  id,
}) => {
  return (
    <div key={id} className="shadow  max-w-md  rounded">
      <img src={imageUrl} />
      <div className="p-5 flex flex-col space-y-2">
        <p className="text-lg font-medium">{title}</p>
        <p className="text-gray-600">{description}</p>
        <p className="text-gray-600">{price}</p>
      </div>
    </div>
  );
};
