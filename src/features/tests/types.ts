export type TestPrice = {
  _id: string;
  center_name: string;
  price: number;
};

export type DiagnosticTest = {
  _id: string;
  test_name: string;
  category: string;
  prices: TestPrice[];
};

export type TestAutocompleteItem = {
  _id: string;
  test_name: string;
  category: string;
};

export function priceRange(prices: TestPrice[]): { min: number; max: number } | null {
  if (prices.length === 0) return null;
  const values = prices.map((p) => p.price);
  return { min: Math.min(...values), max: Math.max(...values) };
}
