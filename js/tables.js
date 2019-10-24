var datatofetch = "";
if (
  document.title === "Attendance - Senate" || document.title === "Loyalty - Senate" || document.title === "Congress 113 - Senate"
) {
  datatofetch = "senate";
} else {
  datatofetch = "house";
}

async function getData() {
  const response = await fetch(
    `https://api.propublica.org/congress/v1/113/${datatofetch}/members.json`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "eKDuyBWdpQGhsiKGi7geFoBmJR3kCRIRUGRWIASL"
      }
    }
  );
  var data = await response.json();
  var members = data.results[0].members;
  tableFunction(members);
  var informat = stats.mem;

  if (
    document.title === "Congress 113 - Senate" || document.title === "Congress 113 - House"
  ) {
    addMemberTable(stats.mem);
  }

  if (
    document.title === "Attendance - Senate" || document.title === "Attendance - House" || document.title === "Loyalty - Senate" || document.title === "Loyalty - House"
  ) {
    callGlanceTable(members);
  }

  if (
    document.title === "Attendance - Senate" || document.title === "Attendance - House"
  ) {
    attendance("miVo_PCT", "miVo");
  }

  if (
    document.title === "Loyalty - Senate" || document.title === "Loyalty - House"
  ) {
    attendance("voWiPa_PCT", "nuPaVo");
  }
  if (
    document.title === "Congress 113 - Senate" || document.title === "Congress 113 - House"
  ) {
    buildFilter(members);
    createEvent(informat);
  }
}

//loading bar function 
const progress = $("#myprogressBar");
var element = document.getElementById("myprogressBar");    
var width = 1; 
var identity = setInterval(scene, 10); 

function scene() { 
  width++;
    if (width == 101) { 
      clearInterval(identity); 
      progress.addClass("d-none");
    } else if(width == 70) { 
      getData();

    }else{  
      element.style.width = width + '%';  
    } 
  } 

function getFullName(first, middle, last) {
  if (middle === null) {
    middle = " ";
  } else {
    middle.charAt(0) + ". ";
  }
  var full = first.charAt(0) + ". " + middle + " " + last;
  return full;
}

function round(x) {
  return Number.parseFloat(x).toFixed(2);
}

function roundfull(x) {
  return Number.parseFloat(x).toFixed(0);
}

var table1 = "tableLeft";
var table2 = "tableRight";
function tableFunction(members) {
  for (var t = 0; t < members.length; t++) {
    let fullName = getFullName(
      members[t].first_name,
      members[t].middle_name,
      members[t].last_name
    );

    let vote = 0;
    if (typeof members[t].votes_with_party_pct == "undefined") {
      vote = "-";
    } else {
      vote = members[t].votes_with_party_pct * 100;
    }

    let missedVotes = 0;
    if (typeof members[t].missed_votes == "undefined") {
      missedVotes = "-";
    } else {
      missedVotes = members[t].missed_votes;
    }

    let missedVotesPct = 0;
    if (typeof members[t].missed_votes_pct == "undefined") {
      missedVotesPct = "-";
    } else {
      missedVotesPct = members[t].missed_votes_pct * 100;
    }

    let numPartyVotes = roundfull(
      (members[t].votes_with_party_pct / 100) *
        ((1 - members[t].missed_votes_pct / 100) * members[t].total_votes)
    );

    stats.mem.push({
      name: fullName,
      party: members[t].party,
      url: members[t].url,
      seni: members[t].seniority,
      state: members[t].state,
      voWiPa_PCT: vote,
      miVo: missedVotes,
      miVo_PCT: missedVotesPct,
      nuPaVo: numPartyVotes
    });
  }
}
//create table for members
function addMemberTable(whichArr) {
  for (var e = 0; e < whichArr.length; e++) {
    var table = document.getElementById("table");
    var row = document.createElement("tr");
    var cell1 = document.createElement("td");
    var cell2 = document.createElement("td");
    var cell3 = document.createElement("td");
    var cell4 = document.createElement("td");
    var cell5 = document.createElement("td");
    table.appendChild(row);
    row.appendChild(cell1);
    cell1.innerHTML =
      "<a href=" + whichArr[e].url + ">" + whichArr[e].name + "</a>";
    row.appendChild(cell2);
    cell2.innerHTML = whichArr[e].party;
    row.appendChild(cell3);
    cell3.innerHTML = whichArr[e].state;
    row.appendChild(cell4);
    cell4.innerHTML = whichArr[e].seni;
    row.appendChild(cell5);
    cell5.innerHTML = whichArr[e].voWiPa_PCT / 100;
  }
}

function callGlanceTable(members) {
  var statG = stats.Glance;
  var vwpHD = 0;
  var vwpHD = 0;
  var vwpHR = 0;
  var vwpHI = 0;
  for (var j = 0; j < members.length; j++) {
    if (members[j].party === "D") {
      ++statG[0].number;
      if (typeof members[j].votes_with_party_pct != "undefined") {
        vwpHD += members[j].votes_with_party_pct;
      }
    } else if (members[j].party === "R") {
      ++statG[1].number;
      if (typeof members[j].votes_with_party_pct != "undefined") {
        vwpHR += members[j].votes_with_party_pct;
      }
    } else {
      ++statG[2].number;
      if (typeof members[j].votes_with_party_pct != "undefined") {
        vwpHI += members[j].votes_with_party_pct;
      }
    }
  }
  statG[3].number = statG[0].number + statG[1].number + statG[2].number;
  statG[0].percent = round(vwpHD / statG[0].number);
  statG[1].percent = round(vwpHR / statG[1].number);
  var y = vwpHI / statG[2].number;

  if (statG[2].number === 0) {
    statG[2].percent = 0;
  } else {
    statG[2].percent = round(vwpHI / statG[2].number);
  }
  statG[3].percent = round((vwpHD + vwpHR + vwpHI) / statG[3].number);

  //Glance Table
  for (var k = 0; k < statG.length; k++) {
    var glanceTable = document.getElementById("glanceTable");
    var row = document.createElement("tr");
    var cell1 = document.createElement("td");
    var cell2 = document.createElement("td");
    var cell3 = document.createElement("td");

    glanceTable.appendChild(row);
    row.appendChild(cell1);
    cell1.innerHTML = statG[k].name;
    row.appendChild(cell2);
    cell2.innerHTML = statG[k].number;
    row.appendChild(cell3);
    cell3.innerHTML = statG[k].percent + " %";
  }
}

//10% Tables top and low
function attendance(colom3, colom2) {
  for (var t = 0; t < stats.mem.length; t++)
    if (stats.mem[t][colom3] !== "-") {
      stats.gabArr.push(stats.mem[t]);
    }
  var result = stats.gabArr.reduce((unique, o) => {
    if (!unique.some(obj => obj[colom3] === o[colom3])) {
      unique.push(o);
    }
    return unique;
  }, []);

  if (
    document.title === "Attendance - Senate" || document.title === "Attendance - House"
  ) {
    stats.gabArr.sort((a, b) => {
      return a[colom3] * 100 < b[colom3] * 100 ? 1 : -1;
    });
  } else {
    stats.gabArr.sort((a, b) => {
      return a[colom3] * 100 > b[colom3] * 100 ? 1 : -1;
    });
  }
  //need only 10 top or 10 low
  var d = 0;
  for (var b = 0; b < result.length * 0.1 + d; b++) {
    for (var c = 1; c < result.length * 0.1; c++) {
      if (stats.gabArr[b][colom3] == stats.gabArr[c][colom3]) {
        d++;
      }
    }
    stats.gabArr_low.push(stats.gabArr[b]);
  }

  if (
    document.title === "Attendance - Senate" || document.title === "Attendance - House"
  ) {
    stats.gabArr.sort((a, b) => {
      return a[colom3] * 100 > b[colom3] * 100 ? 1 : -1;
    });
  } else {
    stats.gabArr.sort((a, b) => {
      return a[colom3] * 100 < b[colom3] * 100 ? 1 : -1;
    });
  }
  var e = 0;
  for (var b = 0; b < result.length * 0.1 + e; b++) {
    for (var c = 1; c < result.length * 0.1; c++) {
      if (stats.gabArr[b][colom3] == stats.gabArr[c][colom3]) {
        e++;
      }
    }
    stats.gabArr_max.push(stats.gabArr[b]);
  }

  var min = stats.gabArr_low;
  var max = stats.gabArr_max;
  
  //Fill Tables
  function fillAttendanceTables(tableID, arrInput, colom2, colom3) {
    for (var e = 0; e < arrInput.length; e++) {
      var table = document.getElementById(tableID);
      var row = document.createElement("tr");
      var cell1 = document.createElement("td");
      var cell2 = document.createElement("td");
      var cell3 = document.createElement("td");

      table.appendChild(row);
      row.appendChild(cell1);
      cell1.innerHTML =
      "<a href=" + arrInput[e].url + ">" + arrInput[e].name + "</a>";
      row.appendChild(cell2);
      cell2.innerHTML = arrInput[e][colom2];
      if (arrInput[e][colom3] !== "-") {
        row.appendChild(cell3);
        cell3.innerHTML = arrInput[e][colom3] / 100 + " %";
      }
    }
  }
  fillAttendanceTables(table1, min, colom2, colom3);
  fillAttendanceTables(table2, max, colom2, colom3);
}

//Filter Functions
function buildFilter(members) {
  for (var i = 0; i < members.length; i++) {
    if (stats.statesTable.includes(members[i].state)) {
    } else {
      stats.statesTable.push(members[i].state);
      stats.statesTable.sort();
    }
  }

  for (var i = 0; i < members.length; i++) {
    if (stats.polPartys.includes(members[i].party)) {
    } else {
      stats.polPartys.push(members[i].party);
      stats.polPartys.sort();
    }
  }

  //checkbox filter
  for (var e = 0; e < stats.statesTable.length; e++) {
    var dropDown = document.getElementById("dropDownFilterState");
    var checkbox = document.createElement("li");
    dropDown.appendChild(checkbox);
    checkbox.innerHTML =
      '<input type="checkbox" class="checkbox" id="check_' + stats.statesTable[e] + '" value="' + stats.statesTable[e] + '">' + stats.statesTable[e];
  }
}

function createEvent(informat) {
  let elem = document.getElementsByClassName("checkbox");
  for (var i = 0; i < elem.length; i++) {
    elem[i].addEventListener("change", function() {
      change(informat);
    });
  }
}

function change(informat) {
  document.getElementById("table").innerHTML = "";
  let filterArr = [];
  let stateArr = [];
  for (var t = 0; t < stats.polPartys.length; t++) {
    // checks if checkboxes are checked then give result dependning on checks
    if (document.getElementById("check" + stats.polPartys[t]).checked) {
      filterArr.push(
        document.getElementById("check" + stats.polPartys[t]).value
      );
    }
  }
  for (var i = 0; i < stats.statesTable.length; i++) {
    // checks if checkboxes are checked then give result dependning on checks
    if (document.getElementById("check_" + stats.statesTable[i]).checked) {
      stateArr.push(
        document.getElementById("check_" + stats.statesTable[i]).value
      );
    }
  }

  var filteredMembers = [];
  for (var tl = 0; tl < informat.length; tl++) {
    //posts Table depending on checkboxes

    if (filterArr.length === 0 && informat.length === 0) {
      filteredMembers.push(informat[tl]);
    } else if (
      filterArr.length > 0 && stateArr.length === 0 && filterArr.includes(informat[tl].party)
    ) {
      filteredMembers.push(informat[tl]);
    } else if (
      filterArr.length === 0 && stateArr.length > 0 && stateArr.includes(informat[tl].state)
    ) {
      filteredMembers.push(informat[tl]);
    } else if (
      filterArr.length > 0 && stateArr.length > 0 && stateArr.includes(informat[tl].state) && filterArr.includes(informat[tl].party)
    ) {
      filteredMembers.push(informat[tl]);
    }
  }
  addMemberTable(filteredMembers);
}
