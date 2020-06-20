//This file is for the adminEditModel.html page
//The primary function is to send the name of the pathway to the addModel page
//Written by: Andrew Broadhead and Benjamin Bladow
//Date Last Modified: March 2020
/*  ******************************************************************
    ********************Throw the CHEEESE*****************************
    ******************************************************************
*/
nameInput = document.getElementsByClassName('radioButton');
//this function submits the model to django so that views.py can process the data
//called as the onclick for the 'add to pathway' button
function getSelectedModel() {
    var name = "";
    // //do not prepare data to send to views.py if the user has not set the pathway name
    for(var i = 0; i < nameInput.length; i++){
        if(nameInput[i].checked){
            name = nameInput[i].value;
        }
    }
    if(name)
    document.getElementById('ModelName').value = name;
    // if(nameInput.value.length == 0) {
    //     alert('Cannot Edit unkown Pathway -- Please enter a name for the pathway.');
    // } else {
    //     data = addedReactions;
    //     data = JSON.stringify(data);
    //     //We need to send data to views.py
    //     //for some reason, the name of the button and its value
    //     //get sent to views.py | So bladow and andrew decided that 
    //     //we will send a JSON string of our data. (see below line of code)
    //     document.getElementsByName('pathwayData')[0].value = data;
    document.getElementById('model_name_input').value = nameInput.value;
    //     document.getElementById('number_reactions_input').value = currentReactionNumber; //might need +1

    //     //data in this post statement does nothing - we think
    //     $.post('modelChoice', data)
    //     //if YOU want to make this code better I suggest looking up AJAX stuff
    //     //we tried to but could not get it to work.
    // }
}

