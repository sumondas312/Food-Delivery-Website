import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/service/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  username=localStorage.getItem('name');

public products : any = [];
public grandTotal !: number;
  constructor(private cartService : CartService) { }

  ngOnInit(): void {
  }

}
