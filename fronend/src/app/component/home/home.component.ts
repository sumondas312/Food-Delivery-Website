import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  slideIndex = 0;
  constructor() {}

  ngOnInit(): void {}

  // imageObject = [
  //   {image:"src/assets/AdobeStock_170631465_Preview.jpeg"},
  //   {image:"assets/AdobeStock_495563104_Preview.jpeg"},
  //   {image:"assets/AdobeStock_371641155_Preview.jpeg"},
  //   {image:"assets/AdobeStock_481007794_Preview.jpeg"}
  // ];

  // showSlides() {
  // let slides = document.getElementsByClassName("mySlides") as HTMLCollectionOf<HTMLElement>;
  // for (let i = 0; i < slides.length; i++) {
  //   slides[i].style.display = "none";
  // }
  // this.slideIndex++;
  // if (this.slideIndex > slides.length) {this.slideIndex = 1}
  // slides[this.slideIndex-1].style.display = "flex";
  // setTimeout(() => this.showSlides(), 2000);
  // }


  //add to plate popup function
  popup1(){
    let popup=document.getElementById('Rasogolla') as HTMLElement;
    console.log(popup);
    
    popup.classList.toggle("show");
  }
  popup2(){
    let popup=document.getElementById('Fish Fry') as HTMLElement ;
    popup.classList.toggle("show");
  }
  popup3(){
    let popup=document.getElementById('Pomfret Fish Curry') as HTMLElement;
    popup.classList.toggle("show");
  }
  popup4(){
    let popup=document.getElementById('Langcha') as HTMLElement;
    popup.classList.toggle("show");
  }
  popup5(){
    let popup=document.getElementById('Kachuri') as HTMLElement;
    popup.classList.toggle("show");
  }
  popup6(){
    let popup=document.getElementById('Cham Cham') as HTMLElement;
    popup.classList.toggle("show");
  }
}
