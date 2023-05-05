
// ==UserScript==
// @name FactExporter
// @namespace www.tampermonkey.com
// @version 3
// @description Exporter
// @author Fact
// @match https://*.crownofthegods.com/*
// @include https://*.crownofthegods.com/?s=*
// @grant none
// ==/UserScript==
/*

Version:  3
Last Modified:  April 20,2023

*/
(function() {
    $(function() {
        var today = new Date();
        var exportButton = $("<button>", {
            "class": "greenb regButton",
            "style": "font-size: 14px;margin-left: 20px; width: 60px; border-radius:6px",
            html: "<div class='button'><a href='#' id='gcitiesxportbutton' role='button' style='color:#c7e2e7;'>Export</a></div>"
        });
        $("#plSpanName").after(exportButton);

        $("#gcitiesxportbutton").click(function(event) {
		const playerName = $("#plSpanName").text();
			const outputFile = `${playerName}sCities${today.getDate()}${Number(today.getMonth()+1)}${today.getFullYear()}.csv`;
            exportTableToCSV(document.getElementById('citiesTable'), outputFile);
        });

        function exportTableToCSV(table, filename) {
		  const rows = table.querySelectorAll("tr:has(td)");
		  const headers = table.querySelectorAll("tr:has(th)");
		  const colDelimiter = '","';
		  const rowDelimiter = '"\r\n"';
		  const formattedRows = Array.from(rows).map(row => {
			const cells = row.children;
			const firstColChild = cells[0].firstElementChild.firstElementChild;
			const cityType = firstColChild.getAttribute("title").split(" ")[0];
			const cityTitle = firstColChild.getAttribute("title").split(" ")[1];
			const newCells = [
			  $("#plSpanName").text(),
			  cityType,
			  cityTitle,
			  ...Array.from(cells).slice(1).map(cell => cell.textContent.trim())
			];
			const formattedNewCells = newCells.slice(0, 3).map(cell => (cell || '').replace(/"/g, '""')).concat(newCells.slice(3));
			return formattedNewCells.join(colDelimiter);
		  }).join(rowDelimiter);

		  const formattedHeaders = `"Player Name","City Type","City Title","City Name","Coords","Cont","Score`;

		  const csv = `${formattedHeaders}${rowDelimiter}${formattedRows}`;
		  const csvData = `data:application/csv;charset=utf-8,${encodeURIComponent(csv)}`;
		  const link = document.createElement("a");
		  link.setAttribute("download", filename);
		  link.setAttribute("href", csvData);
		  link.click();
		}


    });
})();


