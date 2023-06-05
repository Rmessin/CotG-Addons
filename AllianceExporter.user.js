// ==UserScript==
// @name         Alliance Exporter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Exports Cities Based on Alliance
// @author       Fact
// @match https://*.crownofthegods.com/*
// @include https://*.crownofthegods.com/?s=*

// ==/UserScript==

const rankingsPopUpBox = document.getElementById('rankingsPopUpBox');
rankingsPopUpBox.style.textAlign = 'center';



	// Create export button element
function createExportButton() {
    return $('<button>', {
        id: 'export_alliance',
        class: 'regbutton greenb',
        css: {marginTop: '10px', width: '100px'},
        text: 'Export Alliance'
    });
}
createExportButton().insertBefore($('#rankingsXbutton'));

let allianceNameAE = localStorage.getItem('allianceName'); 

function createInput() {
 const input = $('<input>', {
    id: 'allianceName_AE',
    placeholder: 'Alliance Name',
    value: allianceNameAE
});

  // Add an event listener to the input to save its value to local storage and convert it to uppercase
  input.on('input', function() {
    allianceNameAE = input.val().toUpperCase();
    localStorage.setItem('allianceName', allianceNameAE);
    input.val(allianceNameAE);
	updatePlayersNames();
  });

  return input;
}



createInput().insertBefore($('#rankingsXbutton'));
// Initialize variables

const buttonAE = $('#export_alliance');
const allPlayersNames = [];
const allPlayers = [];
let allCities = '"Alliance","Player","City Name","Score","X Coords","Y Coords","X:Y","Continent","Castled","On Water","Temple" \n';


	setTimeout(function() {
		(function(open) {
			XMLHttpRequest.prototype.open = function() {
				this.addEventListener('readystatechange', function() {
					if (this.readyState != 4) {
						return;
					}
					const url = this.responseURL;
					if (url.indexOf('gR.php') != -1) {
						const players = JSON.parse(this.response)['0'];
						localStorage.setItem('playersData', JSON.stringify(players));
					}
				}, false);
				open.apply(this, arguments);
			};
		})(XMLHttpRequest.prototype.open);
	}, 1000);


	// Function to update the allPlayersNames array based on allianceNameAE
	function updatePlayersNames() {
		allPlayersNames.length = 0;
		const playersData = localStorage.getItem('playersData');
		if (playersData) {
			const players = JSON.parse(playersData);
			// Filter data by alliance
			players.forEach(player => {
				if (player[4].toUpperCase() === allianceNameAE) {
					allPlayersNames.push(player[1]);
				}
			});
		}
	}







	function sendCSVae(row) {
    const yesNoMap = { 0: 'No', 1: 'Yes' };
    const castle = yesNoMap[row[7]];
    const water = yesNoMap[row[8]];
    const templeValue = row[9];
    const temple = templeValue === 0 ? 'No' : `Yes (${templeValue})`;

    return [
        row[0], // Alliance Name
        row[1], // Player Name
        row[2], // City Name
        row[3], // City Score
        row[4], // X Coords
        row[5], // Y Coords
        `${row[4]}:${row[5]}`, // X:Y
        row[6], //Continent
        castle,
        water,
        temple,
        //row[10], // City ID
    ].join(',') + '\n';
}



// On export button click

	buttonAE.on('click', () => {
		// Reset allPlayers and allCities
    allPlayers.length = 0;
    allCities = '"Alliance","Player","City Name","Score","X Coords","Y Coords","X:Y","Continent","Castled","On Water","Temple" \n';
	updatePlayersNames();
	  // Retrieve cities for each player
	  allPlayersNames.forEach(player => {
		$.post('includes/gPi.php', {a: player}, (data) => {
		  const playerData = JSON.parse(data);
		  allPlayers.push(playerData);
		  playerData.h.forEach(city => {
			allCities += sendCSVae([
				playerData.a, // Alliance Name
				playerData.player, // Player Name
				city.h,  // city name
			  	city.a,  // City Size
				city.b,  // X coordinate
				city.c,  // Y coordinate
				city.d,  // continent
				city.e,  // Castle?
				city.f,  // Water
				city.g,  // Temple
				city.i   // city ID
			]);
		  });
		  // Export data as CSV file if last player
		  if (allPlayers.length === allPlayersNames.length) {
			const today = new Date();
			const outputFile = `${allianceNameAE}${today.getDate()}${Number(today.getMonth()+1)}${today.getFullYear()}.csv`;
			exportCSVToDownload(allCities, outputFile);
		  }
		});
	  });
	});

	// Export data as CSV file
	function exportCSVToDownload(csv, filename) {
	  const csvData = `data:application/csv;charset=utf-8,${encodeURIComponent(csv)}`;
	  const link = document.createElement('a');
	  link.setAttribute('download', filename);
	  link.setAttribute('href', csvData);
	  link.click();
	}
