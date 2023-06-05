
// ==UserScript==
// @name         W{} - GDoc Window For Intel
// @description  Intel Helper Tool
// @namespace    http://tampermonkey.net/
// @version      2.0
// @author       Fact
// @match        https://w31.crownofthegods.com/
// @grant        none
// ==/UserScript==

//make sure the @ Match above matches your world number! 
// You can not use the wildcard * unless you plan on looking at the same data across all worlds

(function() {
//START Intel Display Script
    const intelFunction = () => {
        // Check if the 'gfunkyinteldiv' already exists
        const existingIntelDiv = document.querySelector('#gfunkyinteldiv');
        // If it doesn't exist, append it to the body
        if (!existingIntelDiv) {
            // Replace the Template URL with your own.
            // Grab your url by simply copying the link from "share" in your document in Google Drive ... depending on use you may want to set permissions
            const iframeSRC = 'https://docs.google.com/spreadsheets/d/1Oilwmlz50BlOxxIfRBYTg-QsAACngfqN8NFjNDjuPhE/edit?usp=sharing';

            // Construct the complete URL with additional parameters
            const completeURL = iframeSRC + '&rm=minimal&amp;';

            // Create the HTML elements
            const gfunkyinteldiv = document.createElement('div');
            gfunkyinteldiv.id = 'gfunkyinteldiv';
            gfunkyinteldiv.className = 'popUpBox ui-resizable ui-draggable';
            gfunkyinteldiv.style = 'z-index:2002; width:80% !important;';

            gfunkyinteldiv.innerHTML = `
                <div class='ppbwinbgr ui-draggable' style='width:100% !important;'>
                    <div class='ppbwintop ui-resizable ui-draggable' style='width:100% !important;'></div>
                    <div class='ppbwincent ui-draggable' style='width:100% !important;'></div>
                    <div class='ppbwinbott ui-resizable ui-draggable' style='width:100% !important;'></div>
                </div>
                <div class='ppbwincontent ui-resizable ui-draggable' style='height:98%; width:100% !important;'>
                    <div class='popUpBar ui-resizable ui-draggable-handle'>
                        <span class='ppspan' style='margin-left:10%'>Intel</span>
                        <button id='sumX' class='xbutton' style='margin-right: 7%;' onclick="$('#gfunkyinteldiv').remove()">
                            <div id='xbuttondiv'>
                                <div>
                                    <div id='centxbuttondiv'></div>
                                </div>
                            </div>
                        </button>
                    </div>
                    <div id='gfunkyintelbody' class='popUpWindow ui-resizable' style='width:95%; margin-left:auto;'>
                        <div>
                            <iframe id="gfunkyiframe" style='height: 95%;width:95%;border-radius: 6px;border: 3px ridge #99805d;'></iframe>
                        </div>
                    </div>
                </div>
            `;

            // Append the 'gfunkyinteldiv' to the body
            document.body.appendChild(gfunkyinteldiv);

            // Set the src attribute of the iframe
            document.getElementById('gfunkyiframe').src = completeURL;
        }

        // Show the 'gfunkyinteldiv'
        document.getElementById('gfunkyinteldiv').style.display = 'block';
    };

    // Call the intelFunction whenever needed
    intelFunction();

    // Make the 'gfunkyinteldiv' draggable
    $(document).ready(function() {
        $("#gfunkyinteldiv").draggable({
            handle: ".popUpBar",
            containment: "window",
            scroll: false
        });
    });


    const gfButton = document.querySelector('#gfoverview');

    if (!gfButton) {
        //console.error('Could not find element with ID "gfoverview"');
         // Add IntelButton only when gfButton is not present
    const IntelButton = $("<button>", {
        id: "IntelButton", //Be Sure to Change this ID if you are planning on running multiple instances of this script at the same time for the same server
        class: "greenb",
        text: "Alliance Intel" //Change this text to what you want the War Button To say (if you are using Gfunky, this Button wont Exist)
    }).attr({
        style: "right: 35.6%; margin-top: 235px; width: 150px; height: 30px !important; font-size: 12px !important; font-family: Trojan; position: absolute;"
    });

    IntelButton.on('click', intelFunction);

    // Add the button to the body (or wherever you want to add it)
    $('#warCounc').append(IntelButton);
    } else {
        // This code runs when the gfButton is clicked, creating sumtabs and the Intel tab
        gfButton.addEventListener('click', () => {
            // Wait for sumtabs to be created by whatever other code runs when gfButton is clicked
            setTimeout(() => {
                const sumtabs = document.querySelector('#sumtabs');
                const findmysenTab = document.querySelector('a[href="#findmysenTab"]').parentNode;

                if (sumtabs && findmysenTab) {
                    const intelTab = document.createElement('li');

                    intelTab.setAttribute('role', 'tab');
                    intelTab.setAttribute('class', 'ui-state-default ui-corner-top');
                    intelTab.setAttribute('tabindex', '-1');
                    intelTab.setAttribute('aria-controls', 'intelTab');
                    intelTab.setAttribute('aria-labelledby', 'intelTabGF'); //you will want to change the id to the same one you made below for the intelLink ID if you change this
                    intelTab.setAttribute('aria-selected', 'false');
                    intelTab.setAttribute('aria-expanded', 'false');

                    const intelLink = document.createElement('a');
                    intelLink.setAttribute('href', '#intelTab'); 
                    intelLink.setAttribute('role', 'presentation');
                    intelLink.setAttribute('class', 'ui-tabs-anchor');
                    intelLink.setAttribute('tabindex', '-1');
                    intelLink.setAttribute('id', 'intelTabGF'); //Be Sure to Change this ID if you are planning on running multiple instances of this script at the same time for the same server
                    intelLink.textContent = 'Intel'; // Change This Text to What you want the Gfunky Overview Tab To say! 

                    intelLink.addEventListener('click', intelFunction);

                    intelTab.appendChild(intelLink);
                    sumtabs.insertBefore(intelTab, findmysenTab.nextSibling);
                } else {
                    console.error('Could not find elements with IDs "sumtabs" and/or "findmysenTab"');
                    return;
                }
            }, 500);  // adjust the delay as necessary
        });
    }
});