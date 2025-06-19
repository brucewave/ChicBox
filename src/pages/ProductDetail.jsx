import React, { useEffect, useState } from 'react';

const ProductDetail = ({ id }) => {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`);
        const data = await response.json();
        console.log('Product Data from API:', data);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  return (
    <div>
      {/* Render your product details here */}
    </div>
  );
};

export default ProductDetail; 