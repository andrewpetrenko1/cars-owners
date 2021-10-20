import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Car } from '../interfaces/car';
import { Owner } from '../interfaces/owner';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    let cars = [
      {id: 1, ownerId: 1, licenceNumber: "АЕ9999РЕ", producer: "Toyota", model: "Land Cruizer", year: 2019},
      {id: 2, ownerId: 1, licenceNumber: "АЕ1331РО", producer: "Audi", model: "A6", year: 2008},
      {id: 3, ownerId: 2, licenceNumber: "АЕ5665ОР", producer: "Audi", model: "Q8", year: 2018}
    ]
    let owners: Owner[] = [
      {id: 1, firstName: "Ivan", lastName: "Ivanov", midName: "Ivanovich"},
      {id: 2, firstName: "Alexander", lastName: "Melnik", midName: "Alexandrovich"}
    ]
    return {owners, cars};
  }

  genId(cars: Car[]): number {
    return cars.length > 0 ? Math.max(...cars.map(car => car.id!)) + 1 : 11;
  }
}
