export interface Car {
  id: number | null,
  ownerId: number,
  licenceNumber: string;
  producer: string;
  model: string;
  year: number;
}
