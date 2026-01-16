// This file is deprecated. Use lib/api/catalog.ts instead.
// Kept for backward compatibility but should not be used.

export function getProducts(): never {
  throw new Error('getProducts is deprecated. Use getCatalogProducts from lib/api/catalog instead.');
}

export function getProductById(): never {
  throw new Error('getProductById is deprecated. Use getCatalogProduct from lib/api/catalog instead.');
}
