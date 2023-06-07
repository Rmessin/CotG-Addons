// ==UserScript==
// @name         W[] - ClaimSheet
// @description  Claim Sheet 
// @namespace    http://tampermonkey.net/
// @version      1.0
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
    const CLAIM_CONFIG = {
		//this is the public version of the spreadsheet that you will need to make to make this work
        CLAIM_SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGMTOgkhoCuETefmHQMQVU6nT1dvvHCMSgltVxM3fdcoVnJm1vSokAatywTZqZwWNp9JaYmyTdXvWh/pubhtml",

		// After you have your questions set up in your form should look like this:
		/*
		Coords
        PlayerName
        Landing Time

		*/
		// click get prefilled link in the right nav area
		// Generally I write Coords, Cont, PN, AN, Land, Castle in my  prefilled form so I can identify them later and click get link
		// Copy link and paste it into a note or word document.
		/*
    	you link should look something like this: 	
		https://docs.google.com/forms/d/e/1FAIpQLSesBA8ZbAJhaAwDJor2XD752pj8frl9yehQU2KETfsQYiNc5A/viewform?usp=pp_url&entry.820958176=Coordsas&entry.757220397=Nameas&entry.600421037=2023-06-07+00:00
		
        
		*/
		PREFILLED_FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSesBA8ZbAJhaAwDJor2XD752pj8frl9yehQU2KETfsQYiNc5A/viewform?usp=pp_url",
        // Make sure to set SHEET_NAME to the name of the sheet you are getting responses 
        SHEET_NAME: 'CoordClaim',
        GF_ENTRY_PARAM_IDS: {
            emptycoords: '820958176',
			playername: '757220397',
            landingtime: '600421037',
           
        }
    };


	/*



	DO NOT TOUCH ANYTHING BELOW THIS LINE


	*/
    // Load the specified sheet from the spreadsheet
    function GFloadSheet(sheet) {
        return fetch(sheet)
            .then((response) => response.text())
            .then((html) => {
                const data = {};
                const spreadsheet = new DOMParser().parseFromString(html, "text/html");
                const tbody = spreadsheet.querySelector(`.waffle > tbody`);

                data[CLAIM_CONFIG.SHEET_NAME] = [];

                tbody.querySelectorAll("tr").forEach(function(tr, line) {
                    data[CLAIM_CONFIG.SHEET_NAME].push([]);
                    tr.querySelectorAll("td").forEach(function(td, column) {
                        data[CLAIM_CONFIG.SHEET_NAME][line].push(td.innerHTML.trim() || "");
                    });
                });

                return data;
            });
    }

    // Get the form URL from the data
    function GFgetFormUrl(data) {
        const formUrl = CLAIM_CONFIG.PREFILLED_FORM_URL;
        return formUrl.replace(/\/viewform.*/, '/formResponse');
    }

    // Get the entry parameter string for the form URL
    function GFgetEntryParamStr(claimentryParams) {
        return Object.keys(claimentryParams)
            .map(key => `entry.${CLAIM_CONFIG.GF_ENTRY_PARAM_IDS[key]}=${encodeURIComponent(claimentryParams[key])}`)
            .join('&');
    }

    // Update the troop info and form link on the page
    function GFupdatePageElements(data, formUrl) {

		const claimentryParams = {
            emptycoords: $('#emptyspotcoord').text(),
            playername: $('#playerName').text(),
           
        };
        const GFentryParamStr = GFgetEntryParamStr(claimentryParams);
        const formResponseUrl = `${formUrl}?${GFentryParamStr}`;
        const discoveredClaimInfo = data[CLAIM_CONFIG.SHEET_NAME].find(entry => $("#emptyspotcoord").text() === entry[3]);
        const timestamp = discoveredClaimInfo ? formatDate(discoveredClaimInfo[0], false) : "No Info";
        const landingTime = discoveredClaimInfo ? formatDate(discoveredClaimInfo[2], true) : "No Info";

        function formatDate(dateString, isLandingStatus) {
        if (!dateString) {
            return isLandingStatus ? "Hidden" : "Assigned";
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

        const claimText = discoveredClaimInfo ? `Claimed: ${timestamp}` : "No Claim Yet!";
        const claimedByText = discoveredClaimInfo ? `By: ${discoveredClaimInfo[1]}` : "";
        const landingText = discoveredClaimInfo ? `Landing: ${landingTime}` : "";

        $("#claimStatus").text(claimText);
        $("#claimedBy").text(claimedByText);
        $("#landingStatus").text(landingText);

        if (discoveredClaimInfo && landingTime !== "No Info" && claimedByText !== "") {
            $("#claimLinkGfunky").hide();
        } else {
            $("#claimLinkGfunky").html(`<a href="${formResponseUrl}" target="_blank">Claim This Spot!</a>`).show();
        }
    }

    // Set up the MutationObserver and load the sheet data
   function setup() {
    $("#emptysInfo").append("<div class='smallredheading'><small><p id='claimStatus'></p><p id='claimedBy'></p> <p id='landingStatus'></p><p id='claimLinkGfunky'></p></small></div>");
    const WatchCity = new MutationObserver(() => {
        GFupdatePageElements(sheetData, formUrl);
    });

    let sheetData;
    let formUrl;

      GFloadSheet(CLAIM_CONFIG.CLAIM_SPREADSHEET_URL)
            .then(data => {
                sheetData = data;
                formUrl = GFgetFormUrl(data);

                const WatchCity = new MutationObserver(() => {
                    GFupdatePageElements(sheetData, formUrl);
                });

                WatchCity.observe(document.querySelector("#emptyspotcoord"), { childList: true });
                ;


            })
            .catch(error => {
                console.error('Error loading sheet data:', error);
            });
    }

    setup();


})();

