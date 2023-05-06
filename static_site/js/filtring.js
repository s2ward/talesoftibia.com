function racesList() {
    const races = [...new Set(npcData.map(item => item.race))].sort();
    const options1 = races.map(race => `<option value="${race}">${race}</option>`).join("");
    document.getElementById("racesList").innerHTML = `<option selected>All</option>`;
    document.getElementById("racesList").innerHTML += options1;

    const locations = [...new Set(npcData.map(item => item.location))].sort();
    const options2 = locations.map(location => `<option value="${location}">${location}</option>`).join("");
    document.getElementById("locationsList").innerHTML = `<option selected>All</option>`;
    document.getElementById("locationsList").innerHTML += options2;

    const jobs = [...new Set(npcData.map(item => item.job))].sort();
    const options3 = jobs.map(job => `<option value="${job}">${job}</option>`).join("");
    document.getElementById("jobsList").innerHTML = `<option selected>All</option>`;
    document.getElementById("jobsList").innerHTML += options3;
    readygo();
}