// ==UserScript==
// @name         Rankings Exporter
// @description  Rankings Exporter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @author       Fact
// @match        https://*.crownofthegods.com/
// @grant        none
// ==/UserScript==

$().ready(function() {
	var rankingsExport = $("<button>", {
		id: "rankingsExport",
		class: "greenb",
		text: "Rankings Exporter"
	}).attr({
		style: "right: 35.6%; margin-top: 135px; width: 150px; height: 30px !important; font-size: 12px !important; font-family: Trojan; position: absolute;"
	});
	// Append the dropdowns and button to the desired container
	$("#warCounc").append(rankingsExport);
	var gfexportwin = `
    <div id='gfexportwin' class='popUpBox ui-resizable ui-draggable' style='z-index:20001; width:80%; display: none;'>
      <div class='ppbwinbgr'>
        <div class='ppbwintop' style='position: relative !important; height:150px;'></div>
        <div class='ppbwincent' style='position: relative !important; height:auto;'></div>
        <div class='ppbwinbott' style='position: relative !important; height:150px;'></div>
      </div>
      <div class='ppbwincontent' style='width: auto;'>
        <div class='popUpBar ui-draggable-handle' style='margin-top:7px;'>
          <span class='ppspan'>Gfunky's Rankings Export</span>
          <button id='sumX' style='margin-right: 5%; margin-top:5px;' class='xbutton' onclick='$("#gfexportwin").hide();'>
            <div id='xbuttondiv'>
              <div>
                <div id='centxbuttondiv'></div>
              </div>
            </div>
          </button>
        </div>
        <div id='gfexportbody' class='popUpWindow' style='text-align: center;'>
          <select id='gRexport' class='greensel' style='height:30px'>
            <option value='0' selected>Player Empire Score</option>
            <option value='16'>Players Military Score</option>
            <option value='17'>Players Offensive Score</option>
            <option value='18'>Players Defensive Score</option>
            <option value='1'>Alliance Score</option>
            <option value='19'>Alliance Reputation</option>
            <option value='20'>Alliance Military</option>
            <option value='8'>Combat Reputation</option>
            <option value='3'>Offensive Rep</option>
            <option value='4'>Defensive Rep</option>
            <option value='5'>Unit Kills</option>
            <option value='6'>Plundered Goods</option>
            <option value='7'>Raiding Caverns</option>
            <option value='12'>Raiding Bosses</option>
            <option value='13'>Player Temples</option>
            <option value='14'>Alliance Temples</option>
            
          </select>
          <select id='gRCont'class='greensel' style='height:30px'>

          <option value='56' selected>All Continents</option>
          <option value='00'>Continent 00</option>
          <option value='01'>Continent 01</option>
          <option value='02'>Continent 02</option>
          <option value='03'>Continent 03</option>
          <option value='04'>Continent 04</option>
          <option value='05'>Continent 05</option>
          <option value='10'>Continent 10</option>
          <option value='11'>Continent 11</option>
          <option value='12'>Continent 12</option>
          <option value='13'>Continent 13</option>
          <option value='14'>Continent 14</option>
          <option value='15'>Continent 15</option>
          <option value='20'>Continent 20</option>
          <option value='21'>Continent 21</option>
          <option value='22'>Continent 22</option>
          <option value='23'>Continent 23</option>
          <option value='24'>Continent 24</option>
          <option value='25'>Continent 25</option>
          <option value='30'>Continent 30</option>
          <option value='31'>Continent 31</option>
          <option value='32'>Continent 32</option>
          <option value='33'>Continent 33</option>
          <option value='34'>Continent 34</option>
          <option value='35'>Continent 35</option>
          <option value='40'>Continent 40</option>
          <option value='41'>Continent 41</option>
          <option value='42'>Continent 42</option>
          <option value='43'>Continent 43</option>
          <option value='44'>Continent 44</option>
          <option value='45'>Continent 45</option>
          <option value='50'>Continent 50</option>
          <option value='51'>Continent 51</option>
          <option value='52'>Continent 52</option>
          <option value='53'>Continent 53</option>
          <option value='54'>Continent 54</option>
          <option value='55'>Continent 55</option>
          </select>
          <br><br><br>
          <button id='gfExportGo' class='greenb'>Begin Export</button>
        </div>
      </div>
    </div>
  `;
	$("body").append(gfexportwin);

	// Make gfexportwin draggable
	$("#gfexportwin").draggable({
		handle: ".popUpBar",
		containment: "window",
		scroll: false
	});
    
	// Attach a click event handler to the rankingsExport button
	rankingsExport.click(function() {
		$("#gfexportwin").show(); // Show the gfexportwin div
	});
  var aText = $("#gRexport option:selected").text(); // Get the initial selected option text
  var bText = $("#gRCont option:selected").text(); // Get the initial selected option text

  
   $("#gRexport").change(function() {
    aText = $(this).find("option:selected").text(); // Update the selected option text on change
  });
  $("#gRCont").change(function() {
    bText = $(this).find("option:selected").text(); // Update the selected option text on change
  });
  $("#gfExportGo").on("click", function() {
    var b = $("#gRCont").val();
    var a = $("#gRexport").val();
  
    postData("/includes/gR.php", b, a);
  });
  function postData(url, b, a) {
    $.ajax({
      type: "POST",
      url: url,
      data: { b: b, a: a },
      success: function(response) {
        console.log("Response:", response);
        var csvData = parseResponseToCSV(response, a); // Convert the response to CSV data
        console.log("CSV Data:", csvData);
        downloadCSV(csvData, aText, bText); // Pass aText and bText as arguments
      },
      error: function(xhr, status, error) {
        console.error("Error:", error);
      }
    });
  }
  
   

  function parseResponseToCSV(response, a) {
       // Header mapping for each ranking type
    var headers = {
      '0': ['NAME', 'RANK', 'SCORE', 'ALLIANCE', 'CITIES'],
      '16': ['RANK', 'NAME', 'TOTAL_MILITARY', 'ALLIANCE'],
      '17': ['RANK', 'NAME', 'TOTAL_OFFENSE', 'ALLIANCE'],
      '18': ['RANK', 'NAME', 'TOTAL_DEFENSE', 'ALLIANCE'],
      '1': ['ALLIANCE_NAME', 'RANK',  'SCORE', '#_PLAYERS', 'CITIES'],
      '19': ['RANK', 'ALLIANCE_NAME', 'REPUTATION'],
      '20': ['RANK', 'ALLIANCE_NAME', 'MILITARY'],
      '8': ['RANK', 'NAME', 'ALLIANCE', 'TOTAL_REPUTATION'],
      '3': ['NAME', 'RANK',  'ALLIANCE', 'OFFENSIVE_REPUTATION'],
      '4': ['NAME', 'RANK',  'ALLIANCE', 'DEFENSIVE_REPUTATION'],
      '5': ['NAME', 'RANK',  'ALLIANCE', 'TOTAL_KILLS'],
      '6': ['NAME', 'RANK',  'ALLIANCE', 'RESOURCES_PLUNDERED'],
      '7': ['NAME', 'RANK',  'ALLIANCE', 'RESOURCES_PLUNDERED'],
      '12': ['NAME', 'RANK',  'ALLIANCE', 'BOSSES_HIT'],
      '13': ['RANK', 'PLAYER', 'ALLIANCE', 'TOTAL_PERCENTAGE', 'EVARA', 'VEXAMIS', 'IBRIA', 'MERIUS', 'YLANNA', 'NAERA', 'CYNDROS', 'DOMDIS', 'TOTAL_CASTLES'],
      '14': ['RANK', 'ALLIANCE', 'TOTAL_PERCENTAGE', 'EVARA', 'VEXAMIS', 'IBRIA', 'MERIUS', 'YLANNA', 'NAERA', 'CYNDROS', 'DOMDIS', 'TOTAL_CASTLES'],
      '15': ['RANK', 'ALLIANCE', 'CROWN DATE']
    };
      // Fetch appropriate headers for the ranking type
      var rankingHeaders = headers[a];
      function convertToCSV(tableData) {
            let csv = rankingHeaders.join(',') + '\n';  // Add headers to the CSV initially
            tableData.forEach(row => {
                if (Array.isArray(row)) {
                    csv += row.join(',') + '\n';
                } else {
                    console.log("Unexpected row format:", row); // Log unexpected row format
                }
            });
            return csv;
      }
    
      function omitCProperty(object) {
            const {c, ...rest} = object;  // Omit "c" property
            return rest;
      }
    
      if (typeof response === "string") {
            try {
                response = JSON.parse(response);
            } catch (error) {
                console.error("Invalid response format:", error);
                return ""; // Return an empty string if the response cannot be parsed
            }
        }
        if (Array.isArray(response)) {
            var tableData = [];
            response.forEach(function (nestedArray) {
                if (Array.isArray(nestedArray)) {
                    var rowData = a !== 0 ? nestedArray.map(function (item) {
                        return Object.values(omitCProperty(item));
                    }) : nestedArray.map(omitCProperty);  // Omit "c" property if a !== 0
                    tableData.push(...rowData); // Use spread operator to flatten the array
                }
            });
    
            var csvData = convertToCSV(tableData);
            return csvData;
        }
        if (typeof response === "object") {
            // New check for array inside object
            const key = Object.keys(response)[0];
            if (Array.isArray(response[key])) {
                const tableData = response[key].map(item => Object.values(omitCProperty(item)));  // Omit "c" property
                var csvData = convertToCSV(tableData);
                return csvData;
            }
    
            const tableData = [Object.values(omitCProperty(response[key]))]; // Wrap object values inside array and omit "c" property
            var csvData = convertToCSV(tableData);
            return csvData;
        }
        console.error("Invalid response format. Expected an array or JSON string.");
        return ""; // Return an empty string for unsupported response format
     }
    
  
  

  function downloadCSV(csvData, aText, bText) {
    var currentDate = new Date().toISOString().slice(0, 10); // Get the current date in the format YYYY-MM-DD
    var fileName = `${aText}_${bText}_${currentDate}.csv`;
  
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});  