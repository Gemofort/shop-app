import products from './products.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function main(event: any) {
  const productId = event.pathParameters?.product_id;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing product_id' }),
    };
  }

  const product = products.find((product) => product.id === productId);

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Product not found' }),
    };
  }

  return {
    body: JSON.stringify(product),
    statusCode: 200,
  };
}
