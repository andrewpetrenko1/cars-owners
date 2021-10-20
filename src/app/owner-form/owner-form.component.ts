import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Car } from '../interfaces/car';
import { Owner } from '../interfaces/owner';
import { CarOwnerService } from '../services/car-owner.service';
import { CarService } from '../services/car.service';

@Component({
  selector: 'app-owner-form',
  templateUrl: './owner-form.component.html',
  styleUrls: ['./owner-form.component.sass']
})
export class OwnerFormComponent implements OnInit  {
  public ownerForm = new FormGroup({
    id: new FormControl(null),
    firstName: new FormControl(null, [Validators.required, Validators.pattern('^[А-ЯA-Z][a-zA-Zа-яА-Я]*$')]),
    lastName: new FormControl(null, [Validators.required, Validators.pattern('^[А-ЯA-Z][a-zA-Zа-яА-Я]*$')]),
    midName: new FormControl(null, [Validators.required, Validators.pattern('^[А-ЯA-Z][a-zA-Zа-яА-Я]*$')]),
    cars: new FormArray([])
  });
  carsForm = this.ownerForm.controls.cars as FormArray;
  
  @Input() id: number = -1;
  errors: string[] = [];
  removedCars: Car[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private carService: CarService,
    private formBuilder: FormBuilder,
    private ownerService: CarOwnerService
  ) { }

  ngOnInit(): void {
    if(this.id === -1)
      this.activeModal.dismiss();

    forkJoin([this.ownerService.getOwner(this.id), this.carService.getOwnerCars(this.id)]).subscribe(data => {
      this.setForm(data[0]);
      this.carsForm.controls = data[1].map(car => this.createCarForm(car));
      this.ownerForm.get('cars')?.disable();
    });
  }

  isValid(field: string) {
    return this.ownerForm.get(field)!.invalid && this.ownerForm.get(field)!.touched;
  }

  setForm(owner: Owner) {
    this.ownerForm.setValue({
      id: owner.id,
      firstName: owner.firstName,
      lastName: owner.lastName,
      midName: owner.midName,
      cars: []
    });
  }

  createCarForm(car: Car) {
    return this.formBuilder.group({
      id: car.id,
      ownerId: car.ownerId,
      licenceNumber: [car.licenceNumber, [Validators.required, Validators.pattern('[А-Я]{2}[0-9]{4}[А-Я]{2}')]],
      producer: [car.producer, Validators.required],
      model: [car.model, Validators.required],
      year: [car.year, [Validators.required, Validators.min(1990),
         Validators.max(new Date().getFullYear()), Validators.pattern('^[0-9]{4}')]]
    });
  }

  addCarForm() {
    this.carsForm.push(this.createCarForm({id: null, ownerId: this.id, licenceNumber: '', producer: '', model: '', year: null!}));
  }

  deleteCar(pos: any) {
    this.removedCars.push(this.carsForm.at(pos).value);
    this.carsForm.removeAt(pos);
  }

  editCar(pos: any) {
    this.carsForm.at(pos).enable();
  }

  submitData() {
    if(this.errors.length > 0)
      return;

    this.removedCars = this.removedCars.filter(c => c.id != null);
    if(this.removedCars.length > 0) {
      this.removedCars.forEach(car => {
        this.carService.deleteCar(car.id!).subscribe();
      });
    }
    
    let editedOwner: Owner = {
      id: this.ownerForm.get('id')?.value,
      lastName: this.ownerForm.get('lastName')?.value,
      firstName: this.ownerForm.get('firstName')?.value,
      midName: this.ownerForm.get('midName')?.value,
      cars: this.carsForm.controls.map(car => car.value) as []
    };
    let editedCarsObs: Observable<Car>[] = [];
    this.carsForm.controls.filter(car => car.enabled).forEach(car => {
      editedCarsObs.push(this.carService.updateCar(car.value));
    })
    forkJoin(editedCarsObs).subscribe(() => {}, () => {}, ()=> {
      this.ownerService.updateOwner(editedOwner).subscribe(_ => {
        this.activeModal.close(editedOwner);
      })
    });
  }

  submitOwner() {
    this.errors = [];
    if (!this.ownerForm.valid) {
      this.ownerForm.markAllAsTouched();
      return;
    }
    let newCars = this.carsForm.controls.filter(car => car.get('id')?.value === null);
    let observ = [];
    for(const car of newCars) {
      observ.push(this.carService.isLicenseUnique(car.value.licenceNumber).pipe(
        tap(data => {
          if(data === false) {
            this.errors.push(`Licence number ${car.value.licenceNumber} is already used`);
            this.carsForm.at(this.carsForm.controls.lastIndexOf(car)).get('licenceNumber')?.setValue("");
          }
          else {
            this.carService.addCar(car.value).subscribe();
            let carControl = this.carsForm.controls.find(c => c.value.licenceNumber === car.value.licenceNumber);
            carControl?.disable();
          }
        })
      ));
    }
    forkJoin(observ).subscribe(() => {}, () => {}, ()=> {
      this.submitData();
    });
  }

}
