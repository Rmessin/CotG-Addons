// ==UserScript==
// @name         W[] - Player Intel
// @description  Player Intel {AllianceName}
// @namespace    http://tampermonkey.net/
// @version      5.1
// @author       Fact
// @match        https://w[].crownofthegods.com/
// @grant        none
// ==/UserScript==



		// Only leaders should be distributing these to their alliances as each alliance's documents must be unique
		// IMPORTANT change the [] above with your world number

        /* using Google Sheets: 
         Create a new Spreadsheet. Feel Free to call it whatever you'd like
         Create a Form. Again, call it whatever you'd like
        
        To make the script work with as little editing as possible, follow this format for your questions:
        Troop Type 
		Coordinates
		Continent
		Player Name
		Alliance Name
		Land or Water
		City or Castle

        once this is set up you will want to make sure the document is published to the web. and copy the link to put it for the SPREADSHEET_URL. 
        the current format of this script asks for the whole document to be published. if you are advanced you can modify it to only publish a single sheet


         */
        

(function() {
    'use strict';
    // Beginners: only change the CONFIG
    const CONFIG = {
		//this is the public version of the spreadsheet that you will need to make to make this work
        SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSNhxLRiUX59qAVkTI88ZJvF_spEwlXgCw20Yx6mcebNZ-2TYd3lcDg4efDuCY-nxdyL6_DOSWMW1Oy/pubhtml",
		
		/*
		 click get prefilled link for your form in the right nav area of "edit form"
		 Generally I write Coords, Cont, PN, AN, Land, Castle (or anything that allows me to identify which entry the each are) in my prefilled form so I can identify them later and click get link
		 Copy link and paste it into a note or word document.
		
		your link should look something like this: 	https://docs.google.com/forms/d/e/1FAIpQLSfXBogdEh03SKJZb6rHkyLX5ZXY2bSj9fUAzq5KYUxq6GfO8g/viewform?usp=pp_url&entry.271617078=Coords&entry.1622971848=+CN&entry.1123426270=PN&entry.1186888858=AN&entry.1882198345=Land&entry.2140514447=Castle
		in this example citycoords should be 271617078 as you see below it is. do the same for the rest.
		
        Generally you wont need to change the sheet name unless you name it something other than Form Responses 1, however if you do, you MUST update the SHEET_NAME variable below
		*/
		PREFILLED_FORM_URL: " https://docs.google.com/forms/d/e/1FAIpQLSfXBogdEh03SKJZb6rHkyLX5ZXY2bSj9fUAzq5KYUxq6GfO8g/viewform?usp=pp_url",
        // you will grab the preFilled URL up to the &entry of your link you copied. 
        SHEET_NAME: 'Form Responses 1', // be careful not to remove the quotes or comma when you replace this data with your own
        ENTRY_PARAM_IDS: {
            citycoords: '271617078',  // be careful not to remove the quotes or comma when you replace this data with your own
			citycont: '1622971848',  // be careful not to remove the quotes or comma when you replace this data with your own
            cityplayername: '1123426270',  // be careful not to remove the quotes or comma when you replace this data with your own
            cityplayeralliance: '1186888858',  // be careful not to remove the quotes or comma when you replace this data with your own
			cityWater: '1882198345',  // be careful not to remove the quotes or comma when you replace this data with your own
			cityCastle: '2140514447',  // be careful not to remove the quotes or comma when you replace this data with your own
        }
    };
	
	
	/*
	
	
	If you followed the above format,
	DO NOT TOUCH ANYTHING UNDER THIS LINE
	
    if you have changed which column you have items you will need to modify the script to match your format
	
	*/ 
    // Load the specified sheet from the spreadsheet
    function loadSheet(sheet) {
        return fetch(sheet)
            .then((response) => response.text())
            .then((html) => {
                const data = {};
                const spreadsheet = new DOMParser().parseFromString(html, "text/html");
                const tbody = spreadsheet.querySelector(`.waffle > tbody`);

                data[CONFIG.SHEET_NAME] = [];

                tbody.querySelectorAll("tr").forEach(function(tr, line) {
                    data[CONFIG.SHEET_NAME].push([]);
                    tr.querySelectorAll("td").forEach(function(td, column) {
                        data[CONFIG.SHEET_NAME][line].push(td.innerHTML.trim() || "");
                    });
                });

                return data;
            });
    }

    // Get the form URL from the data
    function getFormUrl(data) {
        const formUrl = CONFIG.PREFILLED_FORM_URL;
        return formUrl.replace(/\/viewform.*/, '/formResponse');
    }

    // Get the entry parameter string for the form URL
    function getEntryParamStr(entryParams) {
        return Object.keys(entryParams)
            .map(key => `entry.${CONFIG.ENTRY_PARAM_IDS[key]}=${encodeURIComponent(entryParams[key])}`)
            .join('&');
    }

    // Update the troop info and form link on the page
    function updatePageElements(data, formUrl) {
		
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
        const entryParams = {
            citycoords: $('#citycoords').text(),
            cityplayername: $('#cityplayername').text(),
            citycont: $('#citycont').text(),
            cityplayeralliance: $('#cityplayeralliance').text(),
			cityWater: cityWater,
			cityCastle: getCityCastle()
        };
        const entryParamStr = getEntryParamStr(entryParams);
        const formResponseUrl = `${formUrl}?${entryParamStr}`;
        const discoveredTroopInfo = data[CONFIG.SHEET_NAME].find(entry => $("#citycoords").text() === entry[2]);
        // note this is set to entry[2] because it starts at 0, so the third column is number 2 so if you design your sheet differently, you will need to match the city coords with the correct column here, otherwise it will always say "no Info"
        const troopsHereText = discoveredTroopInfo ? `${discoveredTroopInfo[0].split("/")[1]}/${discoveredTroopInfo[0].split("/")[0]}: ${discoveredTroopInfo[1]}` : "No Info";
        // the current format is month/day : troopInfo you can adjust this if you prefer 
		$("#TroopsHere").text(troopsHereText);
        $("#FormLinkGFUNKY").html(`<a href="${formResponseUrl}" target="_blank">Open in form</a>`);
    }

    // Set up the MutationObserver and load the sheet data
   function setup() {
    $("#cityplayerInfo").append("<div class='smallredheading'><small><p id='TroopsHere'></p><p id='FormLinkGFUNKY'></p></small></div>");
    const WatchCity = new MutationObserver(() => {
        updatePageElements(sheetData, formUrl);
    });
	
    let sheetData;
    let formUrl;
	
      loadSheet(CONFIG.SPREADSHEET_URL)
            .then(data => {
                sheetData = data;
                formUrl = getFormUrl(data);

                const WatchCity = new MutationObserver(() => {
                    updatePageElements(sheetData, formUrl);
                });

                WatchCity.observe(document.querySelector("#citycoords"), { childList: true });
                WatchCity.observe(document.querySelector("#cityplayername"), { childList: true });
                WatchCity.observe(document.querySelector("#cityplayeralliance"), { childList: true });
                WatchCity.observe(document.querySelector("#citycont"), { childList: true });
                WatchCity.observe(document.querySelector("#landframe"), { attributes: true, attributeFilter: ['class'] });
                WatchCity.observe(document.querySelector("#citbtyp"), { attributes: true, attributeFilter: ['class'] });

                
            })
            .catch(error => {
                console.error('Error loading sheet data:', error);
            });
    }

    setup();


})();

