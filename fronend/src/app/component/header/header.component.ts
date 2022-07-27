import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/service/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {


menu:any=document.querySelector('#menu-bars');
navbar:any;

public searchTerm: string="";
  constructor(private cartService : CartService) { }

  ngOnInit(): void {
    
  }

  // menufunction(){
  //   this.menu=document.querySelector('#menu-bars');
  //   this.navbar=document.querySelector('.navbar');
  //   this.menu.onclick=()=>{                     //menu button function
  //     this.menu.classList.toggle('fa-times');
  //     this.navbar.classList.toggle('active');
  //   }
  //   window.onscroll=()=>{                     
  //     this.menu.classList.remove('fa-times');
  //     this.navbar.classList.remove('active');
  // }
  // }
  



  search(event:any){
    this.searchTerm=(event.target as HTMLInputElement).value;
    this.cartService.search.next(this.searchTerm);
  }

  

}
