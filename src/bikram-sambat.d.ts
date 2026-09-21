declare module "bikram-sambat" {
  export function toBik_euro(date: string): string;
  export function toBik_dev(date: string): string;
  export function toBik_text(date: string): string;
  export function daysInMonth(year: number, month: number): number;
  export function toGreg(
    year: number,
    month: number,
    day: number,
  ): { year: number; month: number; day: number };
}
