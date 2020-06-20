"use strict";

function collapsableMenu() {
  /*
    Collapses and uncollapses content in menu
  */
  var coll = document.getElementsByClassName("collapsible-button");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  } 
}

function hamburgerMenuToggle(x) {
  /*
    Function to toggle the the hamburger menu animations in CSS
  */
    x.classList.toggle("hamburger-change");
}

function toggleViewHamburgerItems() {
  /*
    Toggle between showing and hiding the navigation menu links 
    when the user clicks on the hamburger menu / bar icon. 
  */
    var x = document.getElementById("toggle-hamburger-items");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
} 

function openNav() {
  /* 
    How far the popout menu stretches to the left. Right now it is set
    to stretch to fit the entire window.
  */
  var x = window.matchMedia("(max-width: 767.98px)");
  if (x.matches) {
    document.getElementById("mySidebar").style.width = "100vw";
  }
}
  
function closeNav() {
  /* 
    Places where the close button should be inside the popout menu.
  */
  var x = window.matchMedia("(max-width: 767.98px)");
  if (x.matches) {
    document.getElementById("mySidebar").style.width = "0vw";
  }
}

collapsableMenu();
