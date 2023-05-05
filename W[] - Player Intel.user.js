// ==UserScript==
// @name         W[] - Player Intel
// @description  Player Intel for {Alliance Name}
// @namespace    http://tampermonkey.net/
// @version      5
// @license      MIT
// @author       Fact
// @match        https://w[].crownofthegods.com/
// @grant        none
// ==/UserScript==



		// Only leaders should be distributing these to their alliances as each alliance's documents must be unique
		// IMPORTANT  change the [] above with your world number

(function() {
    'use strict';
// only change the CONFIG
    const CONFIG = {
		//this is the public version of the spreadsheet that you will need to make to make this work
        SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGMTOgkhoCuETefmHQMQVU6nT1dvvHCMSgltVxM3fdcoVnJm1vSokAatywTZqZwWNp9JaYmyTdXvWh/pubhtml",
		
		// After you have your questions set up in your form should look like this:
		/*
		Troop Type 
		Coordinates
		Continent
		Player Name
		Alliance Name
		Land or Water
		City or Castle
		
		*/
		// click get prefilled link in the right nav area
		// Generally I write Coords, Cont, PN, AN, Land, Castle in my  prefilled form so I can identify them later and click get link
		// Copy link and paste it into a note or word document. 
		/*
		you link should look something like this: 	https://docs.google.com/forms/d/e/1FAIpQLSfi0nUJiNDdYcOGZtbEQ-QI10DlyTcNAivhXz25khHJJIiquQ/viewform?usp=pp_url&entry.2074846360=coords&entry.1188131177=pn&entry.441486065=an&entry.621474224=cn&entry.865387645=water&entry.464167876=castled
		
		in this example citycoords should be 2074846360 as you see below it is. now my document is set up slightly different as you can see my next entry is actually PN,
		which is player Name so cityplayername is the next number to use instead of citycont. this is why I write inside my prefilled form to make sure I get it right.
		
		Generally you wont need to change the sheet name unless you name it something other than Sheet1
		*/
		PREFILLED_FORM_URL: " https://docs.google.com/forms/d/e/1FAIpQLSfi0nUJiNDdYcOGZtbEQ-QI10DlyTcNAivhXz25khHJJIiquQ/viewform?usp=pp_url",
        SHEET_NAME: 'Sheet1',
        ENTRY_PARAM_IDS: {
            citycoords: '2074846360',
			citycont: '621474224',
            cityplayername: '1188131177',
            cityplayeralliance: '441486065',
			cityWater: '865387645',
			cityCastle: '464167876'
        }
    };
	
	
	/*
	
	
	
	DO NOT TOUCH ANYTHING UNDER THIS LINE
	
	
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
        const discoveredTroopInfo = data[CONFIG.SHEET_NAME].find(entry => $("#citycoords").text() === entry[1]);
        const troopsHereText = discoveredTroopInfo ? `${discoveredTroopInfo[0].split("/")[1]}/${discoveredTroopInfo[0].split("/")[0]}: ${discoveredTroopInfo[2]}` : "No Info";
        
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
                // Observe changes in #landframe
                WatchCity.observe(document.querySelector("#landframe"), { attributes: true, attributeFilter: ['class'] });
                // Observe changes in #citbtyp
                WatchCity.observe(document.querySelector("#citbtyp"), { attributes: true, attributeFilter: ['class'] });

                
            })
            .catch(error => {
                console.error('Error loading sheet data:', error);
            });
    }

    setup();


})();

