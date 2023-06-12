// ==UserScript==
// @name         W[] - Claim & Intel
// @description  Claim Sheet
// @namespace    http://tampermonkey.net/
// @version      3.6.11
// @license      MIT
// @author       Fact
// @match        https://w31.crownofthegods.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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

})();
