//This file is for the addModel.html
//The primary function is to get all of the information from the user
//to add a new pathway to the database
/*  ******************************************************************
    ********************Add to the Database***************************
    ******************************************************************
*/

//get references to html elements
modelInfoDiv = document.getElementById("model_info_div");
previousReactionsDiv = document.getElementById("previous_reaction_div");
currentReactionDiv = document.getElementById("current_reaction_div");
addPathwayDiv = document.getElementById("add_pathway_div");
subsLabel = document.getElementById("substrates_label");
prodsLabel = document.getElementById("products_label");
enzSelect = document.getElementById("select_enzyme");
nameInput = document.getElementById('input_model_name');
reactionTable = document.getElementById('previous_reactions_table');
reactionHeader = document.getElementById('edit_reaction_header');
addReactionButton = document.getElementById('add_reaction_to_model_btn');
saveReactionButton = document.getElementById('save_edited_reaction_btn');

//get reference to select elements
subSelects = []
prodSelects = []

//get <p> elements to display model info
modelNameDisplay = document.getElementById('model_name');
numberReactionsDisplay = document.getElementById('number_of_reactions');
previousReactions = document.getElementById('previous_reactions');

//from database -- must have script working in addModel.html
var allSubs;
var allEnzys;
var allProds;
var allPaths;
var modelToEdit; //if modelToEdit = "", we're adding a new pathway

var allSubsNoDuplicates = [];
var allEnzysNoDuplicates = [];
var allProdsNoDuplicates = [];
var allPathsNoDuplicates = [];

currentSubSelects = 0;
currentProdSelects = 0;
currentReactionNumber = 0;
editReactionNumber = 0;

//define constants
MAX_SUBS = 5;
MAX_PRODS = 5;
MAX_NUMBER_OF_REACTIONS = localStorage.getItem('numberOfReactions');

//list of reactions that have been added
addedReactions = [];

//this function will determine if the user is editing an existing model or 
//attempting to add a new one.
function loadEditedModel() {
    //The model information when editing a model comes in as a HTML encoded JSON string,
    //so we need to decode it and then replace apostrophes with quotation marks so
    //JSON.parse() can parse it into an object.
    //the user chose to edit a model if this block exectutes. Else user is adding a new model
    if(encodedJSONModel != ""){
        var txt = document.createElement("textarea");
        txt.innerHTML = encodedJSONModel;
        modelToEdit = JSON.parse(txt.value.replace(/'/g, '"'));
        txt.style = "Display: none";

        //load the model information into the HTML elements
        nameInput.value = modelToEdit["name"];

        //put the reactions into addedReactions
        addedReactions = modelToEdit['Reactions'];
        reactionNumber = addedReactions.length-1;
        currentReactionNumber = addedReactions.length;

        for(var i = 0; i <= reactionNumber; i++)
        {
            displayCurrentReactionInfo(i);
        }

        //display the add pathway button if appropriate
        if(currentReactionNumber >= 1)
        {   //if there is at least one reaction allow user to add pathway to database
            document.getElementById('login-button').style.display = 'block';
        }
        
    }    
}

//update the <p> elements that display information to show
//model name and # of reactions
function displayModelInfo() {
    numberReactionsDisplay.innerHTML = "Number of Reactions: " + currentReactionNumber;
}

//gives the user the option to add up to MAX_SUBS substrates to the reaction
function addAnotherSubstrate(){
    if(currentSubSelects < MAX_SUBS) {
        var subSelect = document.createElement("select");
        subSelect.style.width = '100%';
        subSelects.push(subSelect);
        subsLabel.appendChild(subSelect);
        populateSubSelect();
        currentSubSelects++;
    }
}

function removeSubstrate() {
    if(currentSubSelects > 0) {
        subsLabel.removeChild(subSelects[currentSubSelects-1]);
        subSelects[currentSubSelects-1].remove();
        subSelects.pop();
        currentSubSelects = currentSubSelects - 1;
    }
}


//gives the user the option to add up to MAX_PRODS products to the reaction
function addAnotherProduct() {
    if(currentProdSelects < MAX_PRODS) {
        var prodSelect = document.createElement("select");
        prodSelect.style.width = '100%';
        prodSelects.push(prodSelect);
        prodsLabel.appendChild(prodSelect);
        populateProdSlect();
        currentProdSelects++;
    }
}

//remove the most previous select element for product (in add reaction)
function removeProduct() {
    if(currentProdSelects > 0) {
        prodsLabel.removeChild(prodSelects[currentProdSelects-1]);
        prodSelects[currentProdSelects-1].remove();
        prodSelects.pop();
        currentProdSelects = currentProdSelects - 1;
    }
}

function filterDuplicatePathways(arrayToBeFiltered, filteredArray) {
    //for each element in array to be filtered
    for(var i = 0; i < arrayToBeFiltered.length; i++) {
        //for each pathway's name
        name = arrayToBeFiltered[i];
        isUnique = true;
        for(var j = 0; j < filteredArray.length; j++) {
            if(name == filteredArray[j]) {
                isUnique = false;
            }
        }
        if(isUnique) {
            filteredArray.push(name);
        }
    }
}

// input: arrayToBeFiltered - is an array of data from the database
//          is either a substrate, enzyme, or product
//        filteredArray - also an output. Only has non-duplicate items
//js is pass by reference
function filterDuplicates(arrayToBeFiltered, filteredArray)
{
    //for each element in allSubs
    for(var i = 0; i < arrayToBeFiltered.length; i++)
    {
        //for each substrate name - substrate at i; name is stored in the first position
        nameOfReactant = arrayToBeFiltered[i][0];
        abbrOfReactant = arrayToBeFiltered[i][1];

        isUnique = true;
        for(var j = 0; j < filteredArray.length; j++)
        {   
            uniqueName = filteredArray[j][0]
            //if the name is not unique
            if(nameOfReactant == uniqueName)
                isUnique = false;
        }
        if(isUnique)
        {   //the array is pass by reference so this is good
            filteredArray.push([nameOfReactant, abbrOfReactant]);
        }
    }
    filteredArray.sort();
}

//This function puts all substrates into the new select option for the user
//All substrates from the database.  The new select option is a dropdown menu
function populateSubSelect() {
    for(sub in allSubsNoDuplicates) {
        var option = document.createElement("option");
        //[sub][0] is just the name of element. Does not include abbr
        option.value = allSubsNoDuplicates[sub][0];
        option.appendChild(document.createTextNode(allSubsNoDuplicates[sub][0]));
        subSelects[currentSubSelects].appendChild(option);
    } 
}


//This function puts all products into the new select option for the user
//All produccts from the database.  The new select option is a dropdown menu
function populateProdSlect() {
    for(prod in allProdsNoDuplicates) {
        var option = document.createElement("option");
        //[prod][0] is just the name of element. Does not include abbr
        option.value = allProdsNoDuplicates[prod][0];
        option.appendChild(document.createTextNode(allProdsNoDuplicates[prod][0]));
        prodSelects[currentProdSelects].appendChild(option);
    } 
}


//This function puts all enzymes into the new select option for the user
//All enzymes from the database.  The new select option is a dropdown menu
function populateEnzSelect() {
    enzSelect.style.width = "100%";
    for(enz in allEnzysNoDuplicates) {
        var option = document.createElement("option");
        //[enz][0] is just the name of element. Does not include abbr
        option.value = allEnzysNoDuplicates[enz][0];
        option.appendChild(document.createTextNode(allEnzysNoDuplicates[enz][0]));
        enzSelect.appendChild(option);
    }
}

//calls the necessary functions to add a reaction to the page
function addReaction()
{
    getCurrentReactionInfo();
    displayModelInfo();
    if(currentReactionNumber == 1)
    {   //if there is at least one reaction allow user to add pathway to database
        document.getElementById('login-button').style.display = 'block';
    }
}

//gets the current reaction information from the select boxes and the checkbox and
//adds it as a dictionary to the list of added reactions
function getCurrentReactionInfo() {
    //{'enzyme': 'hexokonaszea', 'products': ['a', 'b'], 'substrates': ['c', 'd'], 'reversible': reversible}
    var enzyme;
    substrates = [];
    products = [];
    var reversible = document.getElementById('reversible_checkbox').checked;
    
    //The database stores the string "(ir)reversible"... not a boolean 
    var reversibleString;
    if(reversible)
        reversibleString = "Reversible"
    else
        reversibleString = "Irreversible"

    //get substrates
    for(var i=0; i < subSelects.length; i++)
    {
        subname = subSelects[i].value;
        var subabbr;
        for(var j = 0; j < allSubsNoDuplicates.length; j++) {
            if(allSubsNoDuplicates[j][0] == subname) {
                subabbr = allSubsNoDuplicates[j][1];
            }
        }
        substrates.push([subname, subabbr]);
    }

    //get enzyme
    var enzabbr;
    for(var j = 0; j < allEnzysNoDuplicates.length; j++) {
        if(allEnzysNoDuplicates[j][0] == enzSelect.value) {
            enzabbr = allEnzysNoDuplicates[j][1];
        }
    }
    enzyme = [enzSelect.value, enzabbr];
    
    //get products
    for(var i = 0; i < prodSelects.length; i++) {
        prodname = prodSelects[i].value
        var prodabbr;
        for(var j = 0; j < allProdsNoDuplicates.length; j++) {
            if(allProdsNoDuplicates[j][0] == prodname) {
                prodabbr = allProdsNoDuplicates[j][1];
            }
        }
        products.push([prodname, prodabbr]);
    }

    if(isValidReaction(substrates, enzyme, products, currentReactionNumber)) {
        //add it to the list and increment index
        addedReactions.push({'substrates': substrates, 'enzyme': enzyme, 'products': products, 'reversible': reversibleString});
        displayCurrentReactionInfo(currentReactionNumber);

        currentReactionNumber++;
        clearReactionFields();
    }
}

//displays the info in the previous reactions div for the reaction# passed in
//TODO: make it look nicer @Josh Go (this is your job!)
function displayCurrentReactionInfo(reactionNumber) {
    var deleteButton = document.createElement('button');
    var editButton = document.createElement('button');
    
    deleteButton.innerHTML = "delete";
    deleteButton.setAttribute('value', reactionNumber)
    deleteButton.setAttribute('class', 'options-btn'); 
    deleteButton.onclick = function()
        {
            deleteReaction(reactionNumber);
        };

    editButton.innerHTML = "edit";
    editButton.setAttribute('value', reactionNumber)
    editButton.setAttribute('class', 'options-btn');
    editButton.onclick = function() {
        editReactionNumber = reactionNumber;
        editReaction(reactionNumber);
    };

    currentReaction = addedReactions[reactionNumber];

    //create each cell for the new row
    var newRow = document.createElement('tr');
    var reactionNumberCell = document.createElement('td');
    var substrateCell = document.createElement('td');
    var enzymeCell = document.createElement('td');
    var productCell = document.createElement('td');
    var reversibleCell = document.createElement('td');
    var optionCell = document.createElement('td');

    //populate substrates cell
    reactionNumberCell.innerHTML = reactionNumber + 1;
    substrateCell.innerHTML = currentReaction['substrates'][0][1]; //substrates
    for(var i = 1; i < currentReaction['substrates'].length; i++) {
        substrateCell.innerHTML += ' + ' + currentReaction['substrates'][i][1]
    }

    //populate enzyme cell
    enzymeCell.innerHTML = currentReaction['enzyme'][1]; //enzyme

    //populate products cell
    productCell.innerHTML = currentReaction['products'][0][1]; //products
    for(var i = 1; i < currentReaction['products'].length; i++) {
        productCell.innerHTML += ' + ' + currentReaction['products'][i][1];
    }
    reversibleCell.innerHTML = currentReaction['reversible']; //reversible

    //add the options buttons
    optionCell.appendChild(deleteButton);
    optionCell.appendChild(editButton);

    //put all the cells in the row and add it to the table
    newRow.appendChild(reactionNumberCell);
    newRow.appendChild(substrateCell);
    newRow.appendChild(enzymeCell);
    newRow.appendChild(productCell);
    newRow.appendChild(reversibleCell);
    newRow.appendChild(optionCell);
    reactionTable.appendChild(newRow);
}

//allows for the user to edit a reaction that has already been created
function editReaction(reactionNumber) {
    clearReactionFields(); //first clear the reaction fields
    currentReaction =  addedReactions[reactionNumber];
    currentSubs = currentReaction["substrates"];
    currentEnz = currentReaction["enzyme"];
    currentProds = currentReaction["products"];

    //populate the substrate selects
    for(var i = 0; i < currentSubs.length; i++){
        addAnotherSubstrate();
        subSelects[i].value = currentSubs[i][0];
    }

    //populate the enzyme select
    enzSelect.value = currentEnz[0];

    //populate the product selects
    for(var i = 0; i < currentProds.length; i++){
        addAnotherProduct();
        prodSelects[i].value = currentProds[i][0];
    }

    //set reversible/irreversible
    if(currentReaction["reversible"].toLowerCase() == "reversible")
        document.getElementById('reversible_checkbox').checked = true;
    else
        document.getElementById('reversible_checkbox').checked = false;

    //set header saying they're editing st00f
    reactionHeader.innerHTML = "You are now editing reaction number: " + (reactionNumber + 1);

    //make button for saving reaction visible, hide the add reaction button
    addReactionButton.style = 'display:none';
    saveReactionButton.style = 'display:block';

    //create a cancel button?
}

//This function will rewrite the edited fields onto the reaction the user wants
//to edit.  It will save the reaction :)
function saveReaction(){    
    var enzyme;
    substrates = [];
    products = [];
    var reversible = document.getElementById('reversible_checkbox').checked;
    
    //The database stores the string "(ir)reversible"... not a boolean 
    var reversibleString;
    if(reversible)
        reversibleString = "Reversible"
    else
        reversibleString = "Irreversible"

    //get substrates. gets name from the select (its been populated) by
    // editReaction. Then gets the correct abbreviation. Pushes to array
    // Similar method for getting products and enzyme.
    for(var i=0; i < subSelects.length; i++)
    {
        subname = subSelects[i].value;
        var subabbr;
        for(var j = 0; j < allSubsNoDuplicates.length; j++) {
            if(allSubsNoDuplicates[j][0] == subname) {
                subabbr = allSubsNoDuplicates[j][1];
            }
        }
        substrates.push([subname, subabbr]);
    }

    //get enzyme
    var enzabbr;
    for(var j = 0; j < allEnzysNoDuplicates.length; j++) {
        if(allEnzysNoDuplicates[j][0] == enzSelect.value) {
            enzabbr = allEnzysNoDuplicates[j][1];
        }
    }
    enzyme = [enzSelect.value, enzabbr];
    
    //get products
    for(var i = 0; i < prodSelects.length; i++) {
        prodname = prodSelects[i].value
        var prodabbr;
        for(var j = 0; j < allProdsNoDuplicates.length; j++) {
            if(allProdsNoDuplicates[j][0] == prodname) {
                prodabbr = allProdsNoDuplicates[j][1];
            }
        }
        products.push([prodname, prodabbr]);
    }

    //Check to make sure the reaction is valid (no repeated enzyme, no two same products or subs...)
    if(isValidReaction(substrates, enzyme, products, editReactionNumber)) {
        //replace values at the editReactionNumber with what the user wants now
        addedReactions[editReactionNumber] = {'substrates': substrates, 'enzyme': enzyme, 'products': products, 'reversible': reversibleString};
        //clear fields
        clearReactionFields();
        
        //children is a list of divs displaying previous reactions + all following divs
        var children = reactionTable.childNodes;

        //the table element has children 1 being the table header and 2 as the first row
        //so we loop through and delete the first row for each reaction added
        //i don't really know what children[0] is :) maybe the table itself?
        firstRowOffset = 2;
        while(children[firstRowOffset]) {
            reactionTable.removeChild(children[firstRowOffset]);
            
        }
        
        //redraw the rows we are keeping. Deletes the entire table 
        //and then builds it back up
        for(var i = 0; i < currentReactionNumber; i++){
            displayCurrentReactionInfo(i);
        }

        //make button for saving reaction invisible, make the add reaction button visible
        addReactionButton.style = 'display:block';
        saveReactionButton.style = 'display:none';

        //Do not display a header
        reactionHeader.innerHTML = "";
    }
}

//remove a reaction from view of user and from the arrays
function deleteReaction(reactionNumber){
    //remove one reaction from the list of added reactions at the certain reaction number
    addedReactions.splice(reactionNumber, 1);
    currentReactionNumber--;

    //children is a list of divs displaying previous reactions + all following divs
    var children = reactionTable.childNodes;

    //the table element has children 1 being the table header and 2 as the first row
    //so we loop through and delete the first row for each reaction added
    //i don't really know what children[0] is :) maybe the table itself?
    firstRowOffset = 2;
    while(children[firstRowOffset]) {
        reactionTable.removeChild(children[firstRowOffset]);
        
    }
    
    //redraw the rows we are keeping
    for(var i = 0; i < currentReactionNumber; i++){
        displayCurrentReactionInfo(i);
        
    }
    displayModelInfo(); //update number of reactions displayed


    if(currentReactionNumber < 1)
    {   //if there are no reactions do not allow user to add empty pathway to database
        document.getElementById('login-button').style.display = 'none';
    }

    //make button for saving reaction invisible, make the add reaction button visible
    addReactionButton.style = 'display:block';
    saveReactionButton.style = 'display:none';
    
    //Do not display a header
    reactionHeader.innerHTML = "";
    clearReactionFields();
}

//This function clears the substrate and product fields
//so that if a reaction has 2+ reactants and the next one does not, 
//everything is all good.
function clearReactionFields()
{   //Substrate
    firstLabel = subsLabel.firstChild;
    while(subsLabel.firstChild)
    {
        subsLabel.removeChild(subsLabel.firstChild);
    }
    subsLabel.appendChild(firstLabel);

    //Product
    firstLabel = prodsLabel.firstChild;
    while(prodsLabel.firstChild)
    {
        prodsLabel.removeChild(prodsLabel.firstChild);
    }
    prodsLabel.appendChild(firstLabel);

    //clear reversible checkbox
    document.getElementById('reversible_checkbox').checked = false;

    //clear data
    currentSubSelects = 0;
    subSelects = [];

    currentProdSelects = 0;
    prodSelects = [];    
}

//this function checks the currently built reaction to make sure the user did not make
//any errors
//returns true if the reaction is valid, false otherwise
function isValidReaction(substrates, enzyme, products, reactionNumber) {
    //check for repeated enzymes
    for(var i = 0; i < reactionNumber; i++) {
        //compare the name of the current enzyme to that of every enzyme in the pathway already
        if(enzyme[0] == addedReactions[i]['enzyme'][0]) {
            alert('Cannot repeat enzyme: ' + enzyme[0] + ".");
            return false;
        }
    }
    //check to see if reaction has a product and a substrate
    if(substrates.length < 1 || products.length < 1) {
        alert('Reactions must have at least one substrate and product.')
        return false;
    }
    //check to ensure no duplicate substrates
    for(var i = 0; i < substrates.length; i++) {
        for(var j = i+1; j < substrates.length; j++) {
            if(substrates[i][0] == substrates[j][0]) {
                alert('No duplicate substrates for same reaction!');
                return false;
            }
        }
    }
    //check to ensure no duplicate products
    for(var i = 0; i < products.length; i++) {
        for(var j = i+1; j < products.length; j++) {
            if(products[i][0] == products[j][0]) {
                alert('No duplicate products for same reaction!');
                return false;
            }
        }
    }
    //check to make sure every reaction besides the 1st has at least one sub
    //from previous reaction's product(s)
    if(reactionNumber >= 1) {
        previousProducts = addedReactions[reactionNumber-1]["products"];
        for (var i = 0; i < previousProducts.length; i++) {
            for (var j = 0; j < substrates.length; j++) {
                if (previousProducts[i][0] == substrates[j][0]) {
                    return true;
                }
            }
        }
        alert("None of the products for reaction " + (reactionNumber) + " are substrates in the next reaction.");
        return false;
    }
    //Passed error checks with flying colors :D
    return true;
}

//This function is for the case when the user deletes a reaction and 
//forgets to edit the previous or following reactions to make sure all
//of the substrates line up.  It returns true when all reactions are valid.
//Else false;
function areReactionsValid() {
    for(var i = 0; i < currentReactionNumber; i++) {
        currentSubs = addedReactions[i]["substrates"];
        currentEnz = addedReactions[i]["enzyme"];
        currentProds = addedReactions[i]["products"];

        if(!isValidReaction(currentSubs, currentEnz, currentProds, i)) {
            return false;
        }
    }
    return true;
}

//checks to see if the pathway the user wishes to submit is valid
//the form does not submit if this returns false
function isValidForm() {
    if(nameInput.value.length == 0) {
        return false
    }
    
    if(!isUniqueName(nameInput.value, allPaths) && modelToEdit == "")
    {
        alert('Pathway name is not unique. Cannot add to the database.')
        return false;
    } 

    //check to see if the entered name is unique or is the same as it was before editing
    if(!isUniqueName(nameInput.value, allPaths) && modelToEdit != "")
    {
        if(nameInput.value != modelToEdit['name']) {
            alert('Pathway name is not unique. Cannot add to the database.')
            return false;
        }
    } 

    if(!areReactionsValid()){
        return false;
    }

    //check to ensure each reaction's products match up 
    //with next reaction's substrates.  Send out a dialog
    //box to confirm w/user that user knows what to do
    //This is a soft restriction that occurs when a substrate
    //is in the pathway but does not come from a specified reaction
    //in the pathway.
    var flag = false;
    //for each reaction
    for(var i = 1; i < currentReactionNumber; i++){
        previousReaction = addedReactions[i-1];
        currentReaction = addedReactions[i];
        //for each product in the previous reaction
        for(var j = 0; j < previousReaction['products'].length; j++){
            flag = false;
            previousProduct = previousReaction['products'][j];
            //for each substrate in the current reaction
            for(var k = 0; k < currentReaction['substrates'].length; k++){
                currentSubstrate = currentReaction['substrates'][k];
                //if any previous product is equal to the any of the current rxn substrate we goochie man
                if(previousProduct[0] == currentSubstrate[0]){
                    flag = true;
                    break;
                }
            }
            //if there is a loose product that does not go into the next reaction
            if(!flag){
                errorMessage = "Reaction number: " + i + " has products that are not used in the very next reaction."
                if(confirm(errorMessage + '\n' + "Do you wish to add this pathway to the database anyway?")){
                    //do nuthing for now?
                }
                else{
                    return false;
                }
                break;
            }
        }
    }
    //check to ensure each reaction's substrates match up 
    //with previous reaction's products.  Send out a dialog
    //box to confirm w/user that user knows what to do
    var flag = false;
    //for each reaction
    for(var i = 1; i < currentReactionNumber; i++){
        
        previousReaction = addedReactions[i-1];
        currentReaction = addedReactions[i];
        //for each product in the previous reaction
        //for each substrate in the current reaction
        for(var k = 0; k < currentReaction['substrates'].length; k++){
            flag = false;
            currentSubstrate = currentReaction['substrates'][k];
            for(var j = 0; j < previousReaction['products'].length; j++){
                previousProduct = previousReaction['products'][j];
                if(previousProduct[0] == currentSubstrate[0]){
                    flag = true;
                    break;
                }
            }
        
            //if there is a loose substrate that does not go into the next reaction
            if(!flag){
                errorMessage = "Reaction number: " + (i+1) + " has substrates that do not come from the previous reaction."
                if(confirm(errorMessage + '\n' + "Do you wish to add this pathway to the database anyway?")){
                    //do nuthing for now?
                }
                else{
                    return false;
                }
                break;
            }
        }
    }

    return true;
}

//this function submits the model to django so that views.py can process the data
//called as the onclick for the 'add to pathway' button
function submitPathway() {
    //do not prepare data to send to views.py if the user has not set the pathway name
    if(nameInput.value.length == 0) {
        alert('Cannot add to database -- Please enter a name for the pathway.');
    } else {
        data = addedReactions;
        data = JSON.stringify(data);
        //We need to send data to views.py
        //for some reason, the name of the button and its value
        //get sent to views.py | So bladow and andrew decided that 
        //we will send a JSON string of our data. (see below line of code)
        document.getElementsByName('pathwayData')[0].value = data;
        document.getElementById('model_name_input').value = nameInput.value;
        document.getElementById('number_reactions_input').value = currentReactionNumber; //might need +1

        //data in this post statement does nothing - we think
        $.post('modelChoice', data)
        //if YOU want to make this code better I suggest looking up AJAX stuff
        //we tried to but could not get it to work.
    }
}

loadEditedModel();
displayModelInfo();
filterDuplicates(allSubs, allSubsNoDuplicates);
filterDuplicates(allEnzys, allEnzysNoDuplicates);
filterDuplicates(allProds, allProdsNoDuplicates);
filterDuplicatePathways(allPaths, allPathsNoDuplicates);

populateEnzSelect();

/*  ******************************************************************
    ********************For the Modal*********************************
    ******************************************************************
*/
// Get the modal
var modalSub = document.getElementById("modal_add_substrate");
var modalEnz = document.getElementById("modal_add_enzyme");
var modalProd = document.getElementById("modal_add_product");

// Get the button that opens the modal
var addSubstrateBtn = document.getElementById("add_new_substrate_btn");
var addEnzymeBtn = document.getElementById("add_new_enzyme_btn");
var addProductBtn = document.getElementById("add_new_product_btn");

// Get the <span> element that closes the modal
var spanSub = document.getElementsByClassName("close")[0];
var spanEnz = document.getElementsByClassName("close")[1];
var spanProd = document.getElementsByClassName("close")[2]; //2

// When the user clicks on the button, open the modal
addSubstrateBtn.onclick = function() { modalSub.style.display = "block"; }
addEnzymeBtn.onclick = function() { modalEnz.style.display = "block"; }
addProductBtn.onclick = function() { modalProd.style.display = "block"; }

// When the user clicks on <span> (x), close the modal
spanSub.onclick = function() { modalSub.style.display = "none"; }
spanEnz.onclick = function() { modalEnz.style.display = "none"; }
spanProd.onclick = function() { modalProd.style.display = "none"; }

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modalSub || event.target == modalProd || event.target == modalEnz) {
    modalSub.style.display = "none";
    modalEnz.style.display = "none";
    modalProd.style.display = "none";
  }
}

//Get info from the modal
newSubstrate = [];
newEnzyme = [];
newProduct = [];

//When save substrate button gets clicked on
function saveSubstrate()
{   //exit out of modal
    modalSub.style.display = "none";
    //add as option for Select Substrates
    nameNewSub = document.getElementById("new_substrate_name").value;
    abbrNewSub = document.getElementById("new_substrate_abbr").value;

    //Make new list with just substrate names in order to check if new name is unique
    var allSubsString = [];
    for(var i = 0; i < allSubsNoDuplicates.length; i++) {
        allSubsString[i] = allSubsNoDuplicates[i][0];
    }

    if(abbrNewSub.length > 8) {
        alert('Abbreviations cannot be longer than 8 characters!');
    } else if(!isUniqueName(nameNewSub, allSubsString)){
        alert('Substrate name is not unique. Cannot add to the database.')
    } else {
        newSubstrate = [nameNewSub, abbrNewSub];
        allSubsNoDuplicates.push(newSubstrate);
        allSubsNoDuplicates.sort();
        
        //add as an option for user to select even for current options
        for(var i = 0; i < currentSubSelects; i++)
        {
            var option = document.createElement("option");
            //[sub][0] is just the name of element. Does not include abbr
            option.value = nameNewSub;
            option.appendChild(document.createTextNode(nameNewSub));
            subSelects[i].appendChild(option);
        }
    }
}

//When save Enzyme button gets clicked on
function saveEnzyme()
{   //exit out of modal
    modalEnz.style.display = "none";
    //add as option for Select Substrates
    nameNewEnz = document.getElementById("new_enzyme_name").value;
    abbrNewEnz = document.getElementById("new_enzyme_abbr").value;

    //Make new list with just enzyme names in order to check if new name is unique
    var allEnzysString = [];
    for(var i = 0; i < allEnzysNoDuplicates.length; i++) {
        allEnzysString[i] = allEnzysNoDuplicates[i][0];
    }

    if(abbrNewEnz.length > 8) {
        alert('Abbreviations cannot be longer than 8 characters!');
    } else if(!isUniqueName(nameNewEnz, allEnzysString)){
        alert('Enzyme name is not unique. Cannot add to the database.')
    } else {
        newEnzyme = [nameNewEnz, abbrNewEnz];
        allEnzysNoDuplicates.push(newEnzyme);
        allEnzysNoDuplicates.sort();

        var option = document.createElement("option");
        //[enz][0] is just the name of element. Does not include abbr
        option.value = nameNewEnz;
        option.appendChild(document.createTextNode(nameNewEnz));
        enzSelect.appendChild(option);
    }
}

//When save product button gets clicked on
function saveProduct()
{   //exit out of modal
    modalProd.style.display = "none";
    //add as option for Select Substrates
    nameNewProd = document.getElementById("new_product_name").value;
    abbrNewProd = document.getElementById("new_product_abbr").value;

    //Make new list with just product names in order to check if new name is unique
    var allProdsString = [];
    for(var i = 0; i < allProdsNoDuplicates.length; i++) {
        allProdsString[i] = allProdsNoDuplicates[i][0];
    }
    if(abbrNewProd.length > 8) {
        alert('Abbreviations cannot be longer than 8 characters!');
    }else if(!isUniqueName(nameNewProd, allProdsString)){
        alert('Product name is not unique. Cannot add to the database.')
    }else {
        newProduct = [nameNewProd, abbrNewProd];
        allProdsNoDuplicates.push(newProduct);
        allProdsNoDuplicates.sort();
        
        //add as an option for user to select even for current options
        for(var i = 0; i < currentProdSelects; i++)
        {
            var option = document.createElement("option");
            //[sub][0] is just the name of element. Does not include abbr
            option.value = nameNewProd;
            option.appendChild(document.createTextNode(nameNewProd));
            prodSelects[i].appendChild(option);
        }
    }
}

//This function takes in a string: nameToCheck and a list
//of strings listToCheckAgainst.  If the original string is not
//in the list, return true. else return false.
function isUniqueName(nameToCheck, listToCheckAgainst){

    for(var i = 0; i < listToCheckAgainst.length; i++) {
        if(listToCheckAgainst[i] == nameToCheck) {
            return false;
        }
    }
    return true;
}
