export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}
