import { Component, OnInit } from '@angular/core';
import { Owner } from '../interfaces/owner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OwnerFormComponent } from '../owner-form/owner-form.component';
import { CarOwnerService } from '../services/car-owner.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CarService } from '../services/car.service';
import { Car } from '../interfaces/car';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-owners-list',
  templateUrl: './owners-list.component.html',
  styleUrls: ['./owners-list.component.sass']
})
export class OwnersListComponent implements OnInit {

  constructor(
    public modalService: NgbModal,
    private ownerService: CarOwnerService,
    private carService: CarService
  ) { }

  public newOwner = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.pattern('^[А-ЯA-Z][a-zA-Zа-яА-Я]*$')]),
    lastName: new FormControl(null, [Validators.required, Validators.pattern('^[А-ЯA-Z][a-zA-Zа-яА-Я]*$')]),
    midName: new FormControl(null, [Validators.required, Validators.pattern('^[А-ЯA-Z][a-zA-Zа-яА-Я]*$')])
  });

  owners: Owner[] = [];
  adding = false;
  viewOrDel = "view";

  ngOnInit(): void {
    this.getOwnersList();
  }

  getOwnersList() {
    forkJoin([this.ownerService.getOwners(), this.carService.getCars()]).subscribe(data => {
      this.owners = data[0].map(ow => Object.assign(ow, {cars: data[1].filter(car => car.ownerId === ow.id)}));
    });
  }

  addOwner() {
    if (!this.newOwner.valid) {
      this.newOwner.markAllAsTouched();
      return;
    }
    let newOwn: Owner = {
      id: null, 
      firstName: this.newOwner.get('firstName')?.value,
      lastName: this.newOwner.get('lastName')?.value,
      midName: this.newOwner.get('midName')?.value,
      cars: []
    };
    this.ownerService.addOwner(newOwn).subscribe(data => {
      this.owners.push(data);
    }).add(this.newOwner.reset());
  }

  ownerOptions(id: number) {
    if(this.viewOrDel === "view")
      this.showOwner(id);
    else
      this.deleteOwner(id);
  }

  deleteOwner(id: number) {
    this.owners.find(ow => ow.id === id)!.cars?.forEach((car: Car) => {
      this.carService.deleteCar(car.id!).subscribe();
    })
    this.ownerService.deleteOwner(id).subscribe(_ => {
      this.owners.splice(this.owners.findIndex(c => c.id === id), 1);
    });
  }

  showOwner(id: number) {
    let modalRef = this.modalService.open(OwnerFormComponent, { centered: true, size: 'xl' });
    modalRef.componentInstance.id = id;
    modalRef.result.then(owner => {
      this.owners.splice(this.owners.findIndex(c => c.id === id), 1, owner);
      this.owners = [... this.owners];
    }).catch(reject => {});
  }

}
