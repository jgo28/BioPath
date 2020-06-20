 "use strict";

var checkedSubsNames = []; //array of names of enzymes, products, substrates in rxn
var checkedEnzsNames = [];
var checkedProdsNames = [];
var checkedSubsAbbr = [];//hold abbreviations to display on canvas
var checkedProdsAbbr = [];
var canvas1; //variable for canvas element
var substrates; //holds array of all substrate checkboxes
var enzymes; //holds array of all enzyme radio buttons
var products; //holds array of all product checkboxes
var ctx; //context of the canvas element, is 2d
var image; //image to be displayed corresponding to substrates and products chosen
var createBtn; //button hit after module settings are set (displays rxn in canvas)
var saveBtn; //button hit after user is finished, send user back to model edit screen
var backBtn; //buton hit if user wants to go back to modelEdit screen without saving to Database
var clearBtn; //button hit if user wants to clear all checkboxes and the canvas
var isReversible = false; //boolean that indicates if user wants rxn to be reversible or not
var reversibleChoice; //variable to hold reversible radio buttons
var weightSliderValue; //var corresponding to textbox for weight slider, displays weight value and allows user to set weight
var submitWeightBtn; //var corresponding to button to enter weight set in text weightSliderValue textbox
var weightSlider; //var corresponding to weight slider
var objectWidth = 125; //width of boxes for substrates and products and arrows
var objectHeight = 125; //height of boxes for substrates and products
var horizontalBuffer = 20; //buffer size between each substrate, product and enzyme in canvas
var verticalBuffer = 10; //buffer size between each row on canvas
var countProducts;
var countSubstrates;
var modal;
//from database
var mySubstrates;
var myEnzymes;
var myProducts;
var allProds;
var allSubs;
var allModules;
var isPublic;
var modelID;
var moduleID;
var myXCoor;
var myYCoor;
//above from database
var enzymeProds = [];
var enzymeSubs = [];
var enzymeReverse = [];

function collapsibleSignifier(id) {
  var button = document.getElementById(id);
  if (button.innerHTML === "+") {
    button.innerHTML = "-";
  }
  else {
    button.innerHTML = "+";
  }
}

//function to change reversible boolean depending on which reversible radio btn is set
function onRadioReverseChange(){
  if(reversibleChoice[0].checked){
    isReversible = true;
  }else{
    isReversible = false;
  }
}

//check which radio buttons and checkboxes are clicked for products, enzymes and substrates
//push name of product, substrate, enzyme to checkedProdsEnzsSubsNames
//push type to checkedProdsEnzsSubs
function onRadioChange(){
  countProducts = 0;
  countSubstrates = 0;
  checkedSubsNames = [];
  checkedProdsNames = [];
  checkedEnzsNames = [];
  checkedSubsAbbr = [];
  checkedProdsAbbr = [];

  for(var i = 0; i < substrates.length; i++){
    if(substrates[i].checked){
      countSubstrates++;
      checkedSubsNames.push(substrates[i].value);
      checkedSubsAbbr.push(substrates[i].className);
    }
  }
  for(var j = 0; j < enzymes.length; j++){
    if(enzymes[j].checked){
      checkedEnzsNames.push(enzymes[j].value);
    }
  }
  for(var k = 0; k < products.length; k++){
    if(products[k].checked){
      countProducts++;
      checkedProdsNames.push(products[k].value);
      checkedProdsAbbr.push(products[k].className);
    }
  }
  if(countProducts > 5 || countSubstrates > 5){
    modal.style.display = "block";
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);
  }
}
//unit test
// function onRadioChanged(substrates, enzymes, products){
//   countProducts = 0;
//   countSubstrates = 0;
//   checkedSubsNames = [];
//   checkedProdsNames = [];
//   checkedEnzsNames = []
//   var check1 = 0;
//   var check2 = 0;
//   var check3 = 0;
//
//   for(var i = 0; i < substrates.length; i++){
//     if(substrates[i].checked){
//       countSubstrates++;
//       checkedSubsNames.push(substrates[i].value);
//       check1 = 1;
//     }
//   }
//   for(var j = 0; j < enzymes.length; j++){
//     if(enzymes[j].checked){
//       checkedEnzsNames.push(enzymes[j].value);
//       check2 = 1;
//     }
//   }
//   for(var k = 0; k < products.length; k++){
//     if(products[k].checked){
//       countProducts++;
//       checkedProdsNames.push(products[k].value);
//       check3 = 1;
//     }
//   }
//
//   if(countProducts > 5 || countSubstrates > 5){
//     // modal.style.display = "block";
//     // ctx.clearRect(0, 0, canvas1.width, canvas1.height);
//   }
//   return (check1 + check2 + check3);
// }

//display image corresponding to substrates and products chosen
function displayImage(xcoor, ycoor, name){
  if(name === "ADP" || name === "ATP"){

  }else{
    var img = document.getElementById(name);
    console.log(img, xcoor, ycoor, objectWidth, objectHeight, name)
    if (!img)
    {
      ycoor = ycoor - (objectHeight / 2);
      ctx.font = "24px Arial";
      ctx.fillText(name, xcoor, ycoor + objectHeight + verticalBuffer);
      ycoor = ycoor + (objectHeight / 2);
    } else {
      ctx.drawImage(img, xcoor, ycoor, objectWidth, objectHeight);
    }
  }
}

//draw boxes for substrates and products and set text
function drawObject(xcoor, ycoor, name, displayName){
  if(name === "ATP" || name === "ADP"){
    //xcoor = xcoor + (objectWidth / 2);
    ycoor = ycoor - (objectHeight / 2);
    ctx.font = "24px Arial";
    ctx.fillText(name, xcoor, ycoor + objectHeight + verticalBuffer);
    ycoor = ycoor + (objectHeight / 2);
    //xcoor = xcoor - (objectWidth / 2);
  }else{
    displayImage(xcoor, ycoor, name);
    //draw box around image
    ctx.moveTo(xcoor,ycoor);
    ctx.lineTo(xcoor + objectWidth, ycoor);
    ctx.lineTo(xcoor + objectWidth, ycoor + objectHeight);
    ctx.lineTo(xcoor, ycoor + objectHeight);
    ctx.lineTo(xcoor, ycoor);
    ctx.stroke();
    
    ycoor = ycoor + objectHeight / 15; //add a small buffer so that text below image does not overlap with square
    ctx.font = "20px Arial";
    //draw text below box containing substrate or product
    ctx.fillText(displayName, xcoor, ycoor + objectHeight + verticalBuffer);
  }
  return [xcoor, ycoor, name];
}

//draw downwards arrow in center of current row
function drawDownArrow(xcoor, ycoor, name){
  ctx.font = "20px Arial";
  ycoor = ycoor + objectHeight / 25;
  ctx.fillText(name, xcoor + 5 , ycoor + (objectHeight / 2));
  if(isReversible){
    ctx.moveTo(xcoor, ycoor);
    ctx.lineTo(xcoor + (objectWidth / 4), ycoor + (objectHeight / 4));
    ctx.lineTo(xcoor, ycoor);
    ctx.lineTo(xcoor - (objectWidth / 4), ycoor + (objectHeight / 4));
    ctx.lineTo(xcoor, ycoor);
    ctx.lineTo(xcoor, ycoor + objectHeight);
    ctx.lineTo(xcoor + (objectWidth / 4), ycoor + objectHeight - (objectHeight / 4));
    ctx.lineTo(xcoor, ycoor + objectHeight);
    ctx.lineTo(xcoor - (objectWidth / 4), ycoor + objectHeight - (objectHeight / 4));
    ctx.stroke();
  }else{
    ctx.moveTo(xcoor, ycoor);
    ctx.lineTo(xcoor, ycoor + objectHeight);
    ctx.lineTo(xcoor + (objectWidth / 4), ycoor + objectHeight - (objectHeight / 4));
    ctx.lineTo(xcoor, ycoor + objectHeight);
    ctx.lineTo(xcoor - (objectWidth / 4), ycoor + objectHeight - (objectHeight / 4));
    ctx.stroke();
  }
  return [xcoor, ycoor, name];
}

//draw regular arrow for reaction, reversible or irreversible
// function drawArrow(xcoor, ycoor){
//   if(isReversible){
//     ycoor = ycoor + objectHeight / 2;
//     ctx.moveTo(xcoor, ycoor);
//     ctx.lineTo(xcoor + (objectWidth / 4), ycoor - (objectHeight / 4));
//     ctx.lineTo(xcoor + (objectWidth / 4), ycoor + (objectHeight / 4));
//     ctx.lineTo(xcoor, ycoor);
//     ctx.lineTo(xcoor + objectWidth, ycoor);
//     ctx.lineTo(xcoor + objectWidth - (objectWidth / 4), ycoor - (objectHeight / 4));
//     ctx.lineTo(xcoor + objectWidth - (objectWidth / 4), ycoor + (objectHeight / 4));
//     ctx.lineTo(xcoor + objectWidth, ycoor);
//     ctx.stroke();
//   }else{
//     ycoor = ycoor + objectHeight / 2;
//     ctx.moveTo(xcoor, ycoor);
//     ctx.lineTo(xcoor + objectWidth, ycoor);
//     ctx.lineTo(xcoor + objectWidth - (objectWidth / 4), ycoor - (objectHeight / 4));
//     ctx.lineTo(xcoor + objectWidth - (objectWidth / 4), ycoor + (objectHeight / 4));
//     ctx.lineTo(xcoor + objectWidth, ycoor);
//     ctx.stroke();
//   }
// }
//draw plus sign between each substrate and product
function drawPlus(xcoor, ycoor){
  xcoor = xcoor + objectWidth + horizontalBuffer;
  ycoor = ycoor + objectHeight / 2;
  ctx.moveTo(xcoor, ycoor);
  ctx.lineTo(xcoor, ycoor - horizontalBuffer);
  ctx.moveTo(xcoor - horizontalBuffer / 2, ycoor - horizontalBuffer / 2);
  ctx.lineTo(xcoor + horizontalBuffer / 2, ycoor - horizontalBuffer / 2);
  ctx.stroke();
}
//unit test
function setInitialXCoor(count){
  var xcoor;
  if(count === 1){
    xcoor = objectWidth * 2 + horizontalBuffer * 4;
  }else if(count === 2){
    xcoor = (canvas1.width / 2) - (horizontalBuffer * 2) - objectWidth;
  }else if(count === 3){
    xcoor = objectWidth + horizontalBuffer * 2;
  }else if(count === 4){
    xcoor = (canvas1.width / 2) - (horizontalBuffer * 4) - objectWidth * 2;
  }else{
    xcoor = 0;
  }
  return xcoor;
}

function drawSubstrates(currentX, currentY){
  var name;
  var a;
  for(a = 0; a < checkedSubsNames.length; a++){
    name = checkedSubsNames[a];
    var displayName = checkedSubsAbbr[a];
    drawObject(currentX, currentY, name, displayName);
    if(checkedSubsNames.length > a + 1){
      drawPlus(currentX, currentY);
      currentX = currentX + objectWidth + horizontalBuffer * 2;
    }
  }
}

function drawProducts(currentX, currentY){
  var name;
  var a;
  for(a = 0; a < checkedProdsNames.length; a++){
    name = checkedProdsNames[a];
    var displayName = checkedProdsAbbr[a];
    drawObject(currentX, currentY, name, displayName);
    if(checkedProdsNames.length > a + 1){
      drawPlus(currentX, currentY);
      currentX = currentX + objectWidth + horizontalBuffer * 2;
    }
  }
}

//called when create button is clicked
function displayReaction(){
  var name;
  var currentX = horizontalBuffer;
  var currentY = verticalBuffer;
  currentX = currentX + setInitialXCoor(countSubstrates);
  drawSubstrates(currentX, currentY);

  currentY = currentY + objectHeight + verticalBuffer * 2; //for version with downwards arrow
  currentX = canvas1.width / 2; //for version with downwards arrow
  name = checkedEnzsNames[0];
  drawDownArrow(currentX, currentY, name);

  currentX = horizontalBuffer;
  currentY = verticalBuffer * 5 + objectHeight * 2;
  currentX = currentX + setInitialXCoor(countProducts);
  drawProducts(currentX, currentY);
}

function setReaction(enzymeSubs, enzymeProds, enzymeReverse){

  var canBeChecked = false;
  var enzymeName = checkedEnzsNames[0];
  for(var i = 0; i < enzymeSubs.length; i++){
      if(enzymeSubs[i][1].toUpperCase() === enzymeName.toUpperCase()){
        checkedSubsNames.push(enzymeSubs[i][0]);
        checkedSubsAbbr.push(enzymeSubs[i][2]);
        countSubstrates++;
        canBeChecked = true;
    }
  }
  for(var j = 0; j < enzymeProds.length; j++){
      if(enzymeProds[j][1].toUpperCase() === enzymeName.toUpperCase()){
        checkedProdsNames.push(enzymeProds[j][0]);
        checkedProdsAbbr.push(enzymeProds[j][2]);
        countProducts++;

      }
  }
  for(var i = 0; i < enzymeReverse.length; i++){
    //for(var j = 1; j < enzymeReverse[i].length; j++){
      if(enzymeReverse[i][0].toUpperCase() === enzymeName.toUpperCase()){
        if(enzymeReverse[i][1]){
          isReversible = true;
          reversibleChoice[0].checked = true;
        }else{
          isReversible = false;
          reversibleChoice[1].checked = true;
        }
      }
    //}
  }
  checkSubsEnzProds();

  if(canBeChecked){
    validateReaction();
  }
  // else{
  //   modal2.style.display = "block";
  //   ctx.clearRect(0, 0, canvas1.width, canvas1.height);
  // }

}
//unit test
// function testClickSaveBtn(click){
//   if(click === "click"){
//     //saveBtn.style.background = '#4CAF50'
//     return false;
//   }else{
//     //saveBtn.style.background = '#000000';
//     return true;
//   }
// }

// Clear button function to uncheck all boxes if clicked
function clearAll(){
    countProducts = 0;
    countSubstrates = 0;
    checkedSubsNames = [];
    checkedProdsNames = [];
    checkedEnzsNames = [];

    for(var i = 0; i < substrates.length; i++){
      if(substrates[i].checked){
        substrates[i].checked = false
      }
    }
    for(var j = 0; j < enzymes.length; j++){
      if(enzymes[j].checked){
        enzymes[j].checked = false
      }
    }
    for(var k = 0; k < products.length; k++){
      if(products[k].checked){
        products[k].checked = false
      }
    }
}

function checkSubsEnzProds(){
  console.log("HERE")
  for(var i = 0; i < substrates.length; i++){
    for(var j = 0; j < checkedSubsNames.length; j++){
      if(substrates[i].value === checkedSubsNames[j]){
        substrates[i].checked = true;
      }
    }
  }
  for(var i = 0; i < products.length; i++){
    for(var j = 0; j < checkedProdsNames.length; j++){
      if(products[i].value === checkedProdsNames[j]){
        products[i].checked = true;
      }
    }
  }
  for(var i = 0; i < enzymes.length; i++){
    if(enzymes[i].value === checkedEnzsNames[0]){
      enzymes[i].checked = true;
    }
  }
  if(isReversible){
    reversibleChoice[0].checked = true;
  }else{
    reversibleChoice[1].checked = true;
  }
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

function setArraysRepresentingReaction(){
  countProducts = 0;
  countSubstrates = 0;
  checkedSubsNames = [];
  checkedProdsNames = [];
  checkedEnzsNames = [];
  checkedSubsAbbr = [];
  checkedProdsAbbr = [];

  if(myEnzymes.length == 0){
    return false;
  }else{
    for(var i = 0; i < mySubstrates.length; i++){
      checkedSubsNames.push(mySubstrates[i][0]);
      checkedSubsAbbr.push(mySubstrates[i][3]);
      countSubstrates++;
    }
    for(var i = 0; i < myProducts.length; i++){
      checkedProdsNames.push(myProducts[i][0]);
      checkedProdsAbbr.push(myProducts[i][3]);
      countProducts++;
    }
    checkedEnzsNames.push(myEnzymes[0][0]);
    if(myEnzymes[0][1] === 'irreversible' || myEnzymes[0][1] === 'Irreversible'){
      isReversible = false;
    }else if(myEnzymes[0][1] === 'reversible' || myEnzymes[0][1] === 'Reversible'){
      isReversible = true;
    }


    var continueDisplay = validateReaction();

    if(continueDisplay){
      checkSubsEnzProds();
      displayReaction();
    }else{
      modal.style.display = "block";
      ctx.clearRect(0, 0, canvas1.width, canvas1.height);
    }
  }
}

function validateReaction(){
  //iterate through user selections and create string representation
  //this is done so that if it is a complete reaction (something from
  //every category is chosen) it can easily be compared to the known
  //reactions
  var requiredSubsCount = 0;
  var requiredProdsCount = 0;
  var correctReversibleChoice = false;

  for(var x = 0; x < allSubs.length; x++){
    if(allSubs[x][1] === checkedEnzsNames[0]){
      requiredSubsCount++;
    }
  }
  for(var y = 0; y < allProds.length; y++){
    if(allProds[y][1] === checkedEnzsNames[0]){
      requiredProdsCount++;
    }
  }

  var validSubCount = 0;
  var validProdCount = 0;
  var validEnzCount = 0;
  var validXcoor = 0;
  var validYcoor = 0;

  console.log(checkedSubsNames);

  for(var i = 0; i < checkedSubsNames.length; i++){
    for(var a = 0; a < allSubs.length; a++){
      if(checkedSubsNames[i] === allSubs[a][0] && checkedEnzsNames[0] === allSubs[a][1]){
        validSubCount++;
      }
    }
  }

  for(var j = 0; j < allModules.length; j++){
    if(allModules[j][0] === checkedEnzsNames[0]){
      console.log(allModules[j][0]);
      console.log(checkedEnzsNames[0]);
      validEnzCount++;
      if(allModules[j][1] === "reversible"){
        correctReversibleChoice = true;
      }else{
        correctReversibleChoice = false;
      }
      console.log(allModules[j]);
      validXcoor = allModules[j][4];
      validYcoor = allModules[j][5];
    }
  }

  for(var k = 0; k < checkedProdsNames.length; k++){
    for(var c = 0; c < allProds.length; c++){
      if(checkedProdsNames[k] === allProds[c][0] && checkedEnzsNames[0] === allProds[c][1]){
        validProdCount++;
      }
    }
  }

  if(countProducts > 5 || countSubstrates > 5 || checkedEnzsNames.length === 0 ){
    //settings are invalid, user is limited to 5 products and 5 substrates and an
    //enzyme must be selected
    ctx.fillStyle = "tomato";
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);
    //cannot save invalid reaction
    saveBtn.setAttribute("type","button");
    return false;

  }else if(countSubstrates === 0 && countProducts === 0){
    setReaction(enzymeSubs, enzymeProds, enzymeReverse); //the user has only selected the enzyme so fill in reaction
    console.log(validXcoor, validYcoor);
    if(validXcoor === myXCoor && validYcoor === myYCoor){
      ctx.fillStyle = "limegreen";//reaction will be correct so set to green
      ctx.fillRect(0, 0, canvas1.width, canvas1.height);
      saveBtn.setAttribute("type","submit");
    }else{
      console.log(myXCoor, myYCoor);
      displaySnackbar1();
      ctx.fillStyle = "lightblue";
      ctx.fillRect(0, 0, canvas1.width, canvas1.height);
    }
    //This is a valid reaction, but not the next reaction in the pathway.
    //Display an alert, if the x and y coordinates do not match the valid x and y coors.

  }else if(countSubstrates === 0 || countProducts === 0){
    //settings are invalid, cannot have selected some products and
    //no substrates or some substrates and no products
    ctx.fillStyle = "tomato";
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);
    saveBtn.setAttribute("type","button");
    return false;

  }else if(countProducts === validProdCount && countSubstrates === validSubCount
     && validEnzCount === checkedEnzsNames.length && requiredSubsCount ===
     validSubCount && requiredProdsCount === validProdCount && correctReversibleChoice === isReversible &&
     validXcoor === myXCoor && validYcoor === myYCoor){

     ctx.fillStyle = "limegreen";
     ctx.fillRect(0, 0, canvas1.width, canvas1.height);
     saveBtn.setAttribute("type","submit");

  }else if(countProducts === validProdCount && countSubstrates === validSubCount
     && validEnzCount === checkedEnzsNames.length && requiredSubsCount ===
     validSubCount && requiredProdsCount === validProdCount && correctReversibleChoice === isReversible){
  //   //Reaction is valid
    displaySnackbar1();
    console.log(validXcoor);
    console.log(validYcoor);
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);

  }else{
    //reaction is invalid, but still want to display reaction
    ctx.fillStyle = "tomato";
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);
    saveBtn.setAttribute("type","button");
  }
  //set fillStyle back to black
  ctx.fillStyle = "black";
  return true;
}

function createErrorCheckArrays() {

  enzymeSubs = allSubs;
  enzymeProds = allProds;
  for(var k = 0; k < allModules.length; k++){
    var isReversible = false;
    if(allModules[k][1] == "reversible"){
      isReversible = true;
    }
    var str = allModules[k][0];
    enzymeReverse.push([str, isReversible, allModules[k][2], allModules[k][3]]);
  }
}

function enableAndDisableBtns() {
  //check if model is public
  if(isPublic === 'True' || moduleID != 0){
    //disable saveBtn
    saveBtn.disabled = true;
    saveBtn.style.visibility="hidden";
  }else {
    //disable save button so it cannot be clicked with out selecting create reaction first
    saveBtn.setAttribute("type", "button");
  }
}

//any substrate, product, or enzyme with a space in it's name, has to be saved
//with an underscore instead of a space, so we need to change the underscores to spaces
function replaceUnderscores(){
  for(var i = 0; i < myEnzymes.length; i++){
    myEnzymes[i][0] = myEnzymes[i][0].replaceAll(/_/,' ');
  }
  for(var j = 0; j < mySubstrates.length; j++){
    mySubstrates[j][0] = mySubstrates[j][0].replaceAll(/_/,' ');
  }
  for(var k = 0; k < myProducts.length; k++){
    myProducts[k][0] = myProducts[k][0].replaceAll(/_/,' ');
  }
}

//display snackbar to let user know their reaction is valid, but not the one we're looking for
function displaySnackbar1() {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
}

//display snackbar to let user know they can clear and click just the enzyme to get the reaction
function displaySnackbarHelp() {
  // Get the snackbar DIV
  var y = document.getElementById("snackbarHelp");

  // Add the "show" class to DIV
  y.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ y.className = y.className.replace("show", ""); }, 7000);
}
//You must create a reaction befor saving
function displaySnackbarSaveBtn() {
  // Get the snackbar DIV
  var z = document.getElementById("snackbarSaveBtn");

  // Add the "show" class to DIV
  z.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ z.className = z.className.replace("show", ""); }, 5000);
}

//Run when window loads
window.onload = function init(){

  //if error checking is allowed for the model
  if(allModules.length != 0){
    //Create arrays representing the correct version of the complete model
    createErrorCheckArrays();
    //The database needs strings to be saved with underscores, so any underscores need to be replaced with spaces
    //so the user doesn't see underscores on the screen.
    replaceUnderscores();
  }
  //Display a note to the user telling them what they should do
  displaySnackbarHelp();

  //canvas1 is where the reaction is deisplayed.
  canvas1 = document.getElementById("imageCanvas");
  //substrates holds the checkboxes the user can choose from to add substrates to the reaction
  substrates  = document.getElementsByName('Substrate');
  //enzymes holds the radio buttons the user can pick their enzyme from
  enzymes = document.getElementsByClassName('Enzyme');
  //products holds the checkboxes the user cna choose from to add products to the reaction
  products = document.getElementsByName('Product');
  //reversible choice holds the radio buttons to set the reaction to reversible or irreversible
  reversibleChoice = document.getElementsByName('reversibleChoice');
  //ctx is used to draw on the canvas
  ctx  = canvas1.getContext("2d");
  createBtn = document.getElementById("createReaction");
  saveBtn = document.getElementById("saveReaction");
  backBtn = document.getElementById("backBtn");
  clearBtn = document.getElementById("clearReaction");
  weightSliderValue = document.getElementById('weightSliderValue');
  submitWeightBtn = document.getElementById('submitWeight');
  weightSlider = document.getElementById('weightSlider');
  modal = document.getElementById('invalidModal');
  //modal2 = document.getElementById('invalidCheckModal');
  var span = document.getElementsByClassName("close")[0];
  var saveBtnClicked = false;
  //SET CURRENT REACTION TO STRING FROM MODEL EDIT SCREEN HERE
  var fromModel = localStorage.getItem("reactionClicked");

  enableAndDisableBtns();//if user is viewing public model, disable save button
  setArraysRepresentingReaction();//function to set the arrays to current reaction and call values to display/validate


  createBtn.addEventListener("click", function(event){
    //clear everything out of canvas on button click so we can draw new rxn
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);
    //calling beginPath here preps canvas for drawing
    ctx.beginPath();
    ctx.lineWidth = 3;
    //validate that settings are good, reaction created is good or bad
    var continueDisplay = validateReaction();

    //the settings are valid so display as usual
    if(continueDisplay){
      displayReaction();
    }else{
      modal.style.display = "block";
      ctx.clearRect(0, 0, canvas1.width, canvas1.height);
    }

  });

  saveBtn.addEventListener("click", function(event){
    //Submit post request to Django and update database
    if(saveBtn.type == "button"){
      //display snackbar letting user know that they must create a reaction before saving
      displaySnackbarSaveBtn();
    }else if(saveBtn.type == "submit"){

    }
  });

  backBtn.addEventListener("click", function(event){
    document.location.href = '/testApp/modelEdit/'+modelID;
  });

  clearBtn.addEventListener("click", function(event){
    //reset global variables

    //clear everything out of canvas on button click so we can draw new rxn
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);

    //calling beginPath here preps canvas for drawing
    ctx.beginPath();

    clearAll();
    saveBtn.setAttribute("type","button");
  });

  //exit out of invalidModal when x is clicked
  span.addEventListener("click", function(event) {
    modal.style.display = "none";
  });

  //exit out of invalidModal when area outside of modal is clicked
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
function main () {
  mySubstrates.sort();
}
main();

// module.exports = {};
// module.exports.testClickSaveBtn = testClickSaveBtn;
// module.exports.onRadioChange = onRadioChanged;
// module.exports.setInitialXCoor = setInitialXCoor;
