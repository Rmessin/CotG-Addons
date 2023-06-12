// ==UserScript==
// @name         W[] - Claim & Intel Window 
// @description  Claim Sheet 
// @namespace    http://tampermonkey.net/
// @version      3.6.11
// @license      MIT
// @author       Fact
// @match        https://w[].crownofthegods.com/
// @grant        none
// ==/UserScript==



// Make sure to Change the World Numbers Above! 
(function() {
    'use strict';
    // the gFiframcesrc is simply from your share > Copy Link from your main document .. this will be used for the Window
    const gFiframesrc = 'https://docs.google.com/spreadsheets/d/18ecx7FmNVtC_0Jxj5A0KkreIj-XMZDlu-dn7brZkeIQ/edit?usp=sharing';
    const CONFIG = {
        SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGMTOgkhoCuETefmHQMQVU6nT1dvvHCMSgltVxM3fdcoVnJm1vSokAatywTZqZwWNp9JaYmyTdXvWh/pubhtml",
        INTEL: {
            //https://docs.google.com/forms/d/e/1FAIpQLSfi0nUJiNDdYcOGZtbEQ-QI10DlyTcNAivhXz25khHJJIiquQ/viewform?usp=pp_url&entry.338556308=Troops+Type&entry.2074846360=Coords&entry.1188131177=PLayer&entry.441486065=ALLIANCE&entry.621474224=Continent&entry.865387645=LoW&entry.464167876=Castle
            PREFILLED_FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSfi0nUJiNDdYcOGZtbEQ-QI10DlyTcNAivhXz25khHJJIiquQ/viewform?usp=pp_url",
            SHEET_NAME: 'Intel', 
            ENTRY_PARAM_IDS: {
                citycoords: '2074846360',  
                citycont: '621474224',  
                cityplayername: '1188131177',  
                cityplayeralliance: '441486065', 
                cityWater: '865387645',  
                cityCastle: '464167876',  
            }
        },
        CLAIM: {
            //https://docs.google.com/forms/d/e/1FAIpQLSesBA8ZbAJhaAwDJor2XD752pj8frl9yehQU2KETfsQYiNc5A/viewform?usp=pp_url&entry.600421037=2023-06-11+01:31&entry.820958176=Coords&entry.757220397=PLayer
            PREFILLED_FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSesBA8ZbAJhaAwDJor2XD752pj8frl9yehQU2KETfsQYiNc5A/viewform?usp=pp_url",
            SHEET_NAME: 'CoordClaim',
            ENTRY_PARAM_IDS: {
                emptycoords: '820958176',
                playername: '757220397',
                landingtime: '600421037',
            }
        }
    };

    function loadSheet(configSection) {
        return fetch(CONFIG.SPREADSHEET_URL)
            .then((response) => response.text())
            .then((html) => {
                const data = {};
                const spreadsheet = new DOMParser().parseFromString(html, "text/html");
                const tbody = spreadsheet.querySelector(`.waffle > tbody`);
    
                data[configSection.SHEET_NAME] = [];
    
                tbody.querySelectorAll("tr").forEach(function(tr, line) {
                    data[configSection.SHEET_NAME].push([]);
                    tr.querySelectorAll("td").forEach(function(td, column) {
                        data[configSection.SHEET_NAME][line].push(td.innerHTML.trim() || "");
                    });
                });
    
                return data;
            });
    }
    

    function getFormUrl(config) {
        const formUrl = config.PREFILLED_FORM_URL;
        return formUrl.replace(/\/viewform.*/, '/formResponse');
    }

    function getEntryParamStr(entryParams, config) {
        console.log("getEntryParamStr - config: ", config);
    
        return Object.keys(entryParams)
            .map(key => `entry.${config.ENTRY_PARAM_IDS[key]}=${encodeURIComponent(entryParams[key])}`)
            .join('&');
    }
    

    function updatePageElements(data, formUrl, config) {
        console.log("updatePageElements - config: ", config);
      
        const { SHEET_NAME, ENTRY_PARAM_IDS } = config;
        

        if (config === CONFIG.INTEL) {
            function getCityCastle() {
                const citbtypClass = $('#citbtyp').attr('class');
                const cityRegex = /cityreg[1-8]/;
                const castleRegex = /castlreg[1-8]/;
                const templeRegex = /temple(\d)_(\d{1,2})/;
                const templeNames = ['Evara', 'Vexemis', 'Ibria', 'Merius', 'Ylanna', 'Naera', 'Cyndros', 'Domdis'];
    
                if (cityRegex.test(citbtypClass)) {
                    return 'City';
                } else if (castleRegex.test(citbtypClass)) {
                    return 'Castle';
                } else {
                    const templeMatch = citbtypClass.match(templeRegex);
                    if (templeMatch) {
                        const templeIndex = parseInt(templeMatch[1], 10) - 1;
                        const templeLevel = templeMatch[2];
                        return `${templeNames[templeIndex]} (${templeLevel})`;
                    }
                }		
            }
            
    
            
            // Check if landframe has class landframe or waterframe
            const landframe = $('#landframe');
            const cityWater = landframe.hasClass('frameland') ? 'Land' : 'Water';
            const intelEntryParams = {
                citycoords: $('#citycoords').text(),
                cityplayername: $('#cityplayername').text(),
                citycont: $('#citycont').text(),
                cityplayeralliance: $('#cityplayeralliance').text(),
                cityWater: cityWater,
                cityCastle: getCityCastle()
            };
            const intelEntryParamStr = getEntryParamStr(intelEntryParams, CONFIG.INTEL);
            const intelResponseUrl = `${formUrl}?${intelEntryParamStr}`;


            const discoveredTroopInfo = data[SHEET_NAME].find(entry => $("#citycoords").text() === entry[2]);
            const troopsHereText = discoveredTroopInfo ? `${discoveredTroopInfo[0].split("/")[1]}/${discoveredTroopInfo[0].split("/")[0]}: ${discoveredTroopInfo[1]}` : "No Info";
    
            $("#TroopsHere").text(troopsHereText);
            $("#FormLinkGFUNKY").html(`<a href="${intelResponseUrl}" target="_blank">Open in form</a>`);

            
        } else if (config === CONFIG.CLAIM) {

            const claimEntryParams = {
                emptycoords: $('#emptyspotcoord').text(),
                playername: $('#playerName').text(),
               
            };
            const claimEntryParamStr = getEntryParamStr(claimEntryParams, CONFIG.CLAIM);
            const claimResponseUrl = `${formUrl}?${claimEntryParamStr}`;


            const discoveredInfo = data[SHEET_NAME].find(entry => $("#emptyspotcoord").text() === entry[3]);
    
            if (discoveredInfo) {
                const timestamp = formatDate(discoveredInfo[0], false);
                const claimedBy = discoveredInfo[1];
                const landingTime = formatDate(discoveredInfo[2], true);
    
                $("#claimStatus").text(`Claimed: ${timestamp}`);
                $("#claimedBy").text(`By: ${claimedBy}`);
                $("#landingStatus").text(`Landing: ${landingTime}`);
                $("#claimLinkGfunky").hide();
            } else {
                $("#claimStatus").text("No Claim Yet!");
                $("#claimedBy").text("");
                $("#landingStatus").text("");
                $("#claimLinkGfunky").html(`<a href="${claimResponseUrl}" target="_blank">Claim This Spot!</a>`).show();
            }
        }
    
        // Format the date in the desired format
        function formatDate(dateString, isLandingTime) {
            if (!dateString) {
                return isLandingTime ? "Hidden" : "Assigned";
            }
    
            const date = new Date(dateString);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            return `${month}/${day} ${time}`;
        }
    }
    function setup(config) {
        const { SPREADSHEET_URL, SHEET_NAME } = config;
    
        if (config === CONFIG.INTEL) {
            $("#cityplayerInfo").append("<div class='smallredheading'><small><p id='TroopsHere'></p><p id='FormLinkGFUNKY'></p></small></div>");
        } else if (config === CONFIG.CLAIM) {
            $("#emptysInfo").append("<div class='smallredheading'><small><p id='claimStatus'></p><p id='claimedBy'></p><p id='landingStatus'></p><p id='claimLinkGfunky'></p></small></div>");
        }
    
        loadSheet(config)
            .then(data => {
                const formUrl = getFormUrl(config);
                const WatchCity = new MutationObserver(() => {
                    updatePageElements(data, formUrl, config);
                });
    
                const elementsToObserve = [
                    { selector: "#emptyspotcoord", condition: config ===CONFIG.CLAIM},
                    { selector: "#citycoords", condition: config ===CONFIG.INTEL},
                    { selector: "#cityplayername", condition: config === CONFIG.INTEL },
                    { selector: "#cityplayeralliance", condition: config === CONFIG.INTEL },
                    { selector: "#citycont", condition: config === CONFIG.INTEL },
                    { selector: "#cityWater", condition: config === CONFIG.INTEL },
                    { selector: "#cityCastle", condition: config === CONFIG.INTEL },
                ];
    
                for (const { selector, condition } of elementsToObserve) {
                    if (condition) {
                        const node = document.querySelector(selector);
                        if (node) {
                            WatchCity.observe(node, { childList: true });
                        }
                    }
                }
            })
            .catch(err => console.error(err));
    }
    
    // Initialization
    [CONFIG.INTEL, CONFIG.CLAIM].forEach(setup);

    //START Intel Display Script
    const intelFunction = () => {
        // Check if the 'gfunkyinteldiv' already exists
        const existingIntelDiv = document.querySelector('#gfunkyinteldiv');
        // If it doesn't exist, append it to the body
        if (!existingIntelDiv) {
           
            const completedGFiframe = gFiframesrc + '&rm=minimal&amp;';
            const intelSheetHtml = `
                <div id="gfunkyinteldiv" class='popUpBox ui-resizable ui-draggable' style='z-index:2002; width:80% !important;'>
                  <div class='ppbwinbgr ui-draggable' style='width:100% !important;'>
                        <div class='ppbwintop ui-resizable ui-draggable' style='width:100% !important;'></div>
                        <div class='ppbwincent ui-draggable' style='width:100% !important;'></div>
                        <div class='ppbwinbott ui-resizable ui-draggable' style='width:100% !important;'></div>
                    </div>
                    <div class='ppbwincontent ui-resizable ui-draggable' style='height:98%; width:100% !important;' >
                        <div class='popUpBar ui-resizable ui-draggable-handle'>
                            <span class='ppspan'  style='margin-left:10%'>Intel</span>
                            <button id='sumX' class='xbutton' onclick=$('#gfunkyinteldiv').remove()>
                                <div id='xbuttondiv'>
                                    <div>
                                        <div id='centxbuttondiv'></div>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <div id='gfunkyintelbody' class='popUpWindow ui-resizable' style='width:95%; margin-left:auto;'>
                            <div><iframe src='${completedGFiframe}' style='height: 95%;width:95%;border-radius: 6px;border: 3px ridge #99805d;'></iframe></div>
                        </div>
                    </div>
                </div>
            `;
            // Use or append your intelSheetHtml here...
       

            $("body").append(intelSheetHtml);
            $("#gfunkyinteldiv").draggable({
                handle: ".popUpBar",
                containment: "window",
                scroll: false
            });
        }

        // Show the 'gfunkyinteldiv'
        $('#gfunkyinteldiv').show();
    }

    const gfButton = document.querySelector('#gfoverview');

    if (!gfButton) {
        console.error('Could not find element with ID "gfoverview"');
         // Add IntelButton only when gfButton is not present
    const IntelButton = $("<button>", {
        id: "IntelButton",
        class: "greenb",
        text: "Alliance Intel"
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
                    intelTab.setAttribute('aria-labelledby', 'ui-id-169');
                    intelTab.setAttribute('aria-selected', 'false');
                    intelTab.setAttribute('aria-expanded', 'false');

                    const intelLink = document.createElement('a');
                    intelLink.setAttribute('href', '#intelTab');
                    intelLink.setAttribute('role', 'presentation');
                    intelLink.setAttribute('class', 'ui-tabs-anchor');
                    intelLink.setAttribute('tabindex', '-1');
                    intelLink.setAttribute('id', 'ui-id-169');
                    intelLink.textContent = 'Intel';

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

})();
