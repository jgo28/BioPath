/*
    Contains functions used in the admin pages of BioPath.
*/
"use strict";

function sortTable(col_type, table_id) {
    /*
        Sorts the HTML table that lists all the usernames stored
        in the database that can be deleted.
        col_type = 'name': input is only alphabetical characters
        col_type = 'date': input is in datetime format (Year/Month/Day Hours/Minutes/Seconds)
        table_id: html id of the html table
        Based off: https://www.geeksforgeeks.org/how-to-sort-rows-in-a-table-using-javascript/
    */
    var table = document.getElementById(table_id);
    var is_switching = true;  // marks if table still needs to be rearranged
    var sort_direction = "ascending";
    var first_row;  // row in the table that is compared to second_row
    var second_row  // row in the table that is compared to first_row
    var switch_items; // marks if the selected rows need to be swapped
    var i, count = 0;
    // main loop that runs until table is resorted
    while(is_switching) {
        var rows = table.rows;
        is_switching = false;
        // Start at i=1 to skip the header row of the table
        for (var i = 1; i < rows.length-1; i++) {
            switch_items = false;
            // Retrieve values in the rows to be compared based on input type (name or date)
            if (col_type == "name") {
                first_row = rows[i].getElementsByTagName("td")[0].getElementsByTagName("label")[0].innerText;
                second_row = rows[i+1].getElementsByTagName("td")[0].getElementsByTagName("label")[0].innerText;
            }
            else if (col_type == "date") {
                first_row = rows[i].getElementsByTagName("td")[1].innerText;
                second_row = rows[i+1].getElementsByTagName("td")[1].innerText;
            }
            if (sort_direction == "ascending") {
                // Check if 2 rows need to be switched 
                if (first_row > second_row) { 
                    // If yes, mark switch_items as needed and break for loop 
                    switch_items = true; 
                    break;
                } 
            }
            else if (sort_direction == "descending") {
                if(first_row < second_row) {
                    // If yes, mark switch_items as needed and break for loop 
                    switch_items = true; 
                    break;
                } 
            }
        }
        // Switch the designated rows and check to see if other rows need to be switched.
        if (switch_items) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]); 
            is_switching = true; 
            count++;
        }
        else {
            // Run while loop again for descending order 
            if (count == 0 && sort_direction == "ascending") { 
                sort_direction = "descending"; 
                is_switching = true; 
            } 
        }
    }
}

function changeArrowIndicator(el) {
    /*
        Toggles arrow indicator between ascending and descending modes
        by adding/removing CSS classes.
    */
    var asc = el.classList.contains('asc');
    var desc = el.classList.contains('desc');
    el.classList.remove('asc');
    el.classList.remove('desc');
    if ((desc || (!asc && !desc))) {
        el.classList.add("asc");
    }
    else {
        el.classList.add("desc");
    }
}