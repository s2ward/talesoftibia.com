// Search engine made by GABRO

// A class for generating and managing window tabs.
class Tab {
    static existingTabs = {};

    constructor(name, active, closable, container, mobile) {
        const key = `${name}-${container}`;

        if (Tab.existingTabs.hasOwnProperty(key)) {
            Tab.existingTabs[key].setActive();
            return;
        }

        Object.assign(this, { name, active, closable, container, mobile });

        this.tabElement = null;
        this.tabContentElement = null;

        this.createTab();

        Tab.existingTabs[key] = this;
    }

    createTab() {
        this.tabElement = $(`
            <li class="tab ${this.mobile ? 'appearsMobile ' : ''}">
                <span class="tabName">${this.name}</span>
                ${this.closable ? '<span class="closeTab"></span>' : ''}
            </li>
        `);

        this.tabContentElement = $(`
            <div class="tabWindow fullHeight"></div>
        `);

        this.tabElement.on('click', () => this.setActive());

        if (this.closable) {
            this.tabElement.find('.closeTab').on('click', (e) => {
                e.stopPropagation();
                this.closeTab();
            });
        }

        $(`#${this.container} .tabs`).append(this.tabElement);
        $(`#${this.container} .tabContent`).append(this.tabContentElement);

        if (this.active) {
            this.setActive();
        }
    }

    enterContent(content) {
        const tabWindowContainer = $(`
            <div class="tabWindowContainer tibiaStyleBorderDeep1 fullHeight">
                <div class="tabWindowScrollBox scrollWindowContent npcBoxContainer">
                    ${Array.isArray(content) ? content.map(item => item.outerHTML).join('') : content}
                </div>
            </div>
        `);

        this.tabContentElement.empty().append(tabWindowContainer);
    }

    closeTab() {
        const previousTab = $(`#${this.container} .tabs li`).first();
        previousTab.length > 0 && previousTab.trigger('click');

        this.destroyTab();
    }

    destroyTab() {
        this.tabElement.off().remove();
        this.tabContentElement.off().remove();
        delete Tab.existingTabs[`${this.name}-${this.container}`];
        delete this;
    }

    setActive() {
        this.setInactive();
        this.active = true;
        this.tabElement.addClass('active');
        this.tabContentElement.addClass('active');
    }

    setInactive() {
        $(`#${this.container} .tabs li.active`).removeClass('active');
        $(`#${this.container} .tabContent .tabWindow.active`).removeClass('active');
        for (const key in Tab.existingTabs) {
            if (Tab.existingTabs.hasOwnProperty(key)) {
                const tab = Tab.existingTabs[key];
                if (tab.container === this.container) {
                    tab.active = false;
                }
            }
        }
    }
}
// --- --- --- --- --- --- --- --- ---

// Creating the main tab of the window and references to it.
var newTab = null;
var mainTab = null;

$(document).ready(function () {
    newTab = new Tab('Results', true, false, 'tabContainer_1', false);
    mainTab = newTab;
    mainTab.enterContent('');
    newTab = new Tab('Info', false, false, 'tabContainer_1', true);
    npcInfoTab = newTab;
    npcInfoTab.enterContent('');
});
// --- --- --- --- --- --- --- --- ---

// Retrieve the contents of json files and save them to variables.
var conversationsData = [];
var npcData = [];

function handleFetchError(error) {
    console.error('Error:', error);
}

const fetchConversations = fetch('https://s2ward.github.io/tibia/api/conversations.json')
    .then(response => response.json())
    .catch(handleFetchError);

const fetchNpcData = fetch('https://s2ward.github.io/tibia/api/npc_data.json')
    .then(response => response.json())
    .catch(handleFetchError);

Promise.all([fetchConversations, fetchNpcData])
    .then(([conversations, npcDataResponse]) => {
        conversationsData = conversations;
        npcData = npcDataResponse;

        $(document).ready(function () {
            createPropertyLists();
        });
    })
    .catch(handleFetchError);
// --- --- --- --- --- --- --- --- ---

// A function that creates drop-down lists based on unique values.
function createPropertyLists() {
    const uniqueValues = (data, key) => [...new Set(data.map(item => item[key]))].sort();

    const races = uniqueValues(npcData, 'race');
    const options1 = races.map(race => `<option value="${race}">${race}</option>`).join('');
    $("#racesList").html(`<option selected>All</option>${options1}`);

    const locations = uniqueValues(npcData, 'location');
    const options2 = locations.map(location => `<option value="${location}">${location}</option>`).join('');
    $("#locationsList").html(`<option selected>All</option>${options2}`);

    const jobs = uniqueValues(npcData, 'job');
    const options3 = jobs.map(job => `<option value="${job}">${job}</option>`).join('');
    $("#jobsList").html(`<option selected>All</option>${options3}`);

    setFormSettings();
}
// --- --- --- --- --- --- --- --- ---

//
function setFormSettings() {
    searchPhraseInput.value = searchParam;
    autoSearchInput.checked = autoParam;
    for (let input of phraseComparisonInputs) {
        if (input.value === comparisonParam) {
            input.checked = true;
            break;
        }
    }
    searchPhraseInNpcNameInput.checked = nameParam;
    searchPhraseInNpcDialogueInput.checked = responseParam;
    searchPhraseInPlayerDialogueInput.checked = keywordParam;
    for (let input of searchModeInput) {
        if (input.value == modeParam) {
            input.checked = true;
            break;
        }
    }
    for (let option of searchPhraseByRaceInput.options) {
        if (option.value === raceParam) {
            option.selected = true;
            break;
        }
    }
    for (let option of searchPhraseByLocationInput.options) {
        if (option.value === locationParam) {
            option.selected = true;
            break;
        }
    }
    for (let option of searchPhraseByJobInput.options) {
        if (option.value === jobParam) {
            option.selected = true;
            break;
        }
    }

    saveFormValues();
}
// --- --- --- --- --- --- --- --- ---

//
function saveFormValues() {
    searchPhraseValue = String(searchPhraseInput.value);
    autoSearchValue = Boolean(autoSearchInput.checked);
    phraseComparisonInputs.forEach(radio => {
        if (radio.checked) {
            phraseComparisonValue = String(radio.value);
        }
    });
    searchPhraseInNpcNameValue = Boolean(searchPhraseInNpcNameInput.checked);
    searchPhraseInNpcDialogueValue = Boolean(searchPhraseInNpcDialogueInput.checked);
    searchPhraseInPlayerDialogueValue = Boolean(searchPhraseInPlayerDialogueInput.checked);
    searchModeInput.forEach(radio => {
        if (radio.checked) {
            searchModeValue = Number(radio.value);
        }
    });
    searchPhraseByRaceValue = String(searchPhraseByRaceInput.value);
    searchPhraseByLocationValue = String(searchPhraseByLocationInput.value);
    searchPhraseByJobValue = String(searchPhraseByJobInput.value);

    updateURLWithSearchParams();

    if (searchPhraseValue.length > 2 || searchModeValue == 2) {
        searchConversations(searchPhraseValue);
    }
    else {
        mainTab.enterContent('');
    }
    // Display for debugging.
    /*
    console.log('Search phrase:', searchPhraseValue);
    console.log('Auto search:', autoSearchValue);
    console.log('Phrase comparison:', phraseComparisonValue);
    console.log('Search phrase by name:', searchPhraseInNpcNameValue);
    console.log('Search phrase by response:', searchPhraseInNpcDialogueValue);
    console.log('Search phrase by keyword:', searchPhraseInPlayerDialogueValue);
    console.log('Search mode:', searchModeValue);
    console.log('Search phrase by race:', searchPhraseByRaceValue);
    console.log('Search phrase by location:', searchPhraseByLocationValue);
    console.log('Search phrase by job:', searchPhraseByJobValue);
    */
}
// --- --- --- --- --- --- --- --- ---

// 
function updateURLWithSearchParams() {
    urlParams.set('search', searchPhraseValue);
    urlParams.set('auto', autoSearchValue);
    urlParams.set('comparison', phraseComparisonValue);
    urlParams.set('name', searchPhraseInNpcNameValue);
    urlParams.set('response', searchPhraseInNpcDialogueValue);
    urlParams.set('keyword', searchPhraseInPlayerDialogueValue);
    urlParams.set('mode', searchModeValue);
    urlParams.set('race', searchPhraseByRaceValue);
    urlParams.set('location', searchPhraseByLocationValue);
    urlParams.set('job', searchPhraseByJobValue);

    const newURL = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;

    window.history.replaceState({}, '', newURL);
}
// --- --- --- --- --- --- --- --- ---

// A function that searches for player dialogues with NPCs based on keywords.
function searchConversations(keyWord) {
    let preparedKeyWord = keyWord.toLowerCase().trim();
    preparedKeyWord = preparedKeyWord.endsWith(',') ? preparedKeyWord.slice(0, -1) : preparedKeyWord;

    const keyWordsArray = preparedKeyWord.split(',').map(word => word.trim());

    const npcConversationsMap = new Map();

    for (const obj of conversationsData) {
        const filteredConversations = obj.conversation.filter(conv => {
            const { prompt, answer } = conv;
            const { name } = obj;
            const index = npcData.findIndex(obj => obj.name === name);
            const obj1 = index !== -1 ? npcData[index] : undefined;

            for (let keyWord of keyWordsArray) {
                const regex1 = new RegExp(`\\b${keyWord}\\b`, 'igu');
                if (searchModeValue == 1 &&
                    (
                        searchPhraseInPlayerDialogueValue && (
                            (phraseComparisonValue === 'similar' && prompt.toLowerCase().includes(keyWord)) ||
                            (phraseComparisonValue === 'same' && regex1.test(prompt.toLowerCase()))
                        ) ||
                        searchPhraseInNpcDialogueValue && (
                            (phraseComparisonValue === 'similar' && answer.some(ans => ans.toLowerCase().includes(keyWord))) ||
                            (phraseComparisonValue === 'same' && answer.some(ans => regex1.test(ans)))
                        ) ||
                        searchPhraseInNpcNameValue && (
                            (phraseComparisonValue === 'similar' && name.toLowerCase().includes(keyWord)) ||
                            (phraseComparisonValue === 'same' && regex1.test(name.toLowerCase())))
                    ) &&
                    (
                        (obj1.race === searchPhraseByRaceValue || searchPhraseByRaceValue === 'All') &&
                        (obj1.location === searchPhraseByLocationValue || searchPhraseByLocationValue === 'All') &&
                        (obj1.job === searchPhraseByJobValue || searchPhraseByJobValue === 'All')
                    )
                ) {
                    continue;
                }
                else if (searchModeValue == 2 &&
                    (
                        (obj1.race === searchPhraseByRaceValue || searchPhraseByRaceValue === 'All') &&
                        (obj1.location === searchPhraseByLocationValue || searchPhraseByLocationValue === 'All') &&
                        (obj1.job === searchPhraseByJobValue || searchPhraseByJobValue === 'All')
                    )) {
                    continue;
                }
                else {
                    return false;
                }
            }
            return true;
        });

        if (filteredConversations.length === 0) continue;

        if (!npcConversationsMap.has(obj.name)) {
            npcConversationsMap.set(obj.name, []);
        }

        npcConversationsMap.get(obj.name).push(...filteredConversations);
    }

    const regex = new RegExp(`\\b([a-zA-Z0-9'-]*(${keyWordsArray.join('|')})[a-zA-Z0-9'-]*)\\b`, 'igu');

    const npcBoxContentDivArray = [...npcConversationsMap].map(([npcName, conversations]) => {
        const npcBoxContentDiv = $(`
          <div class="npcBoxContent clearBoth">
            <div
                onClick="showAllConversations(\`${npcName}\`); showInformation(\`${npcName}\`);"
                style="background-image: url('img/npcimg/${(npcName.replace(/ /g, "_")).replace(/'/g, "\\'")}.png')">
            </div>
            <div>
                ${conversations.map(conv => `
                    <a>Player: ${conv.prompt}</a>
                    ${conv.answer.map(ans => `
                        <p>${npcName}: ${searchModeValue == 1 ? ans.replace(regex, '<a>$1</a>') : ans}</p>
                    `).join('')}
                `).join('')}
            </div>
          </div>
        `);

        return npcBoxContentDiv.get(0);
    });

    mainTab.enterContent([...npcBoxContentDivArray]);
    mainTab.setActive();
}
// --- --- --- --- --- --- --- --- ---

// A function that displays the player's dialogues with the NPC based on the name of the npc.
function showAllConversations(npcName) {
    const preparedNpcName = npcName.toLowerCase().trim();

    const npcConversationsMap = new Map();

    for (const obj of conversationsData) {
        const { name, conversation } = obj;

        const filteredConversations = conversation.filter(({ prompt, answer }) => {
            return preparedNpcName === name.toLowerCase();
        });

        if (filteredConversations.length === 0) {
            continue;
        }

        if (!npcConversationsMap.has(name)) {
            npcConversationsMap.set(name, []);
        }

        npcConversationsMap.get(name).push(...filteredConversations);
    }


    const npcBoxContentDivArray = [...npcConversationsMap].map(([npcName, conversations]) => {
        const npcBoxContentDiv = $(`
          <div class="npcBoxContent clearBoth">
            <div
                onClick="showInformation(\`${npcName}\`);"
                style="background-image: url('img/npcimg/${(npcName.replace(/ /g, "_")).replace(/'/g, "\\'")}.png')">
            </div>
            <div>
                ${conversations.map(conv => `
                    <a>Player: ${conv.prompt}</a>
                    ${conv.answer.map(ans => `
                        <p>${npcName}: ${ans}</p>
                    `).join('')}
                `).join('')}
            </div>
          </div>
        `);

        return npcBoxContentDiv.get(0);
    });

    try {
        newTab = new Tab(`${npcName}`, false, true, 'tabContainer_1', false);
        newTab.enterContent([...npcBoxContentDivArray]);
    } catch (error) {
    }
}
// --- --- --- --- --- --- --- --- ---

// A function that displays information about NPCs.
const showInformation = (npcName) => {
    const npcInfoDiv = $('#npc-info');

    const index = npcData.findIndex(obj => obj.name === npcName);
    const npc = index !== -1 ? npcData[index] : undefined;
    if (!npc) return;

    const npcInfoDivContent = `
      <div class="npcName npcNameColor">${npc.name}</div>
      <div class="npcAppearance bottomSpace10M" style="background-image: url('img/npcimg/${npc.name.replace(/ /g, "_").replace(/'/g, "\\'")}.png')"></div>
      <div class="npcMonologues bottomSpace10M">
        ${npc.dialogues.map(dialogue => `<p class="npcMonologueFormat npcMonologueColor">${dialogue}</p>`).join('')}
      </div>
      <div class="npcInformation bottomSpace10M">
        <table class="tibiaStyleTable userSelectLock">
          <tbody class="tibiaStyleTbody">
            <tr class="tibiaStyleTr">
              <td class="tibiaStyleTd">Job</td>
              <td class="tibiaStyleTd">${npc.job}</td>
            </tr>
            <tr class="tibiaStyleTr">
              <td class="tibiaStyleTd">Race</td>
              <td class="tibiaStyleTd">${npc.race}</td>
            </tr>
            <tr class="tibiaStyleTr">
              <td class="tibiaStyleTd">Gender</td>
              <td class="tibiaStyleTd">${npc.gender}</td>
            </tr>
            <tr class="tibiaStyleTr">
              <td class="tibiaStyleTd">Location</td>
              <td class="tibiaStyleTd">${npc.location}${npc.subarea ? ` -> ${npc.subarea}` : ''}</td>
            </tr>
            <tr class="tibiaStyleTr">
              <td class="tibiaStyleTd">Version</td>
              <td class="tibiaStyleTd">${npc.version}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="npcLocation">
        <a class="tibiaStyleButtonType1 bottomSpace10M" href="${npc.map}" target="_blank">NPC Location</a>
      </div>
      <div class="npcQuests">
        ${npc.quests.map(quest => `<a class="tibiaStyleButtonType1 bottomSpace10M" href="${quest['quest-url']}" target="_blank">${quest['quest-name']}</a>`).join('')}
      </div>
    `;

    npcInfoDiv.empty().html(npcInfoDivContent);
    npcInfoTab.enterContent(npcInfoDivContent);
};

// --- --- --- --- --- --- --- --- ---














// Retrieving information from a form and listening for changes in the form.
var searchPhraseValue = '';
var autoSearchValue = true;
var phraseComparisonValue = 'similar';
var searchPhraseInNpcNameValue = true;
var searchPhraseInNpcDialogueValue = true;
var searchPhraseInPlayerDialogueValue = true;
var searchModeValue = 1;
var searchPhraseByRaceValue = 'All';
var searchPhraseByLocationValue = 'All';
var searchPhraseByJobValue = 'All';

var searchOptionsForm = null;
var searchPhraseInput = null;
var autoSearchInput = null;
var phraseComparisonInputs = null;
var searchPhraseInNpcNameInput = null;
var searchPhraseInNpcDialogueInput = null;
var searchPhraseInPlayerDialogueInput = null;
var searchModeInput = null;
var searchPhraseByRaceInput = null;
var searchPhraseByLocationInput = null;
var searchPhraseByJobInput = null;

$(document).ready(function () {
    searchOptionsForm = document.forms.searchOptionsForm;
    searchPhraseInput = searchOptionsForm.elements.searchPhrase;
    autoSearchInput = searchOptionsForm.elements.autoSearch;
    phraseComparisonInputs = searchOptionsForm.elements.phraseComparison;
    searchPhraseInNpcNameInput = searchOptionsForm.elements.searchPhraseInNpcName;
    searchPhraseInNpcDialogueInput = searchOptionsForm.elements.searchPhraseInNpcDialogue;
    searchPhraseInPlayerDialogueInput = searchOptionsForm.elements.searchPhraseInPlayerDialogue;
    searchModeInput = searchOptionsForm.elements.searchMode;
    searchPhraseByRaceInput = searchOptionsForm.elements.searchPhraseByRace;
    searchPhraseByLocationInput = searchOptionsForm.elements.searchPhraseByLocation;
    searchPhraseByJobInput = searchOptionsForm.elements.searchPhraseByJob;

    // Listening for changes in the form.
    function handleFormChange() {
        if (autoSearchInput.checked) {
            saveFormValues();
        }
    }

    function handleSearchModeChange() {
        if (autoSearchInput.checked) {
            saveFormValues();
        }
    }

    function handleInputDebounced() {
        if (autoSearchInput.checked && searchModeValue === 1) {
            saveFormValues();
        }
    }

    searchOptionsForm.addEventListener('submit', event => {
        event.preventDefault();
        saveFormValues();
    });

    autoSearchInput.addEventListener('change', handleFormChange);

    phraseComparisonInputs.forEach(radio => {
        radio.addEventListener('change', handleFormChange);
    });

    searchPhraseInNpcNameInput.addEventListener('change', handleFormChange);
    searchPhraseInNpcDialogueInput.addEventListener('change', handleFormChange);
    searchPhraseInPlayerDialogueInput.addEventListener('change', handleFormChange);

    searchModeInput.forEach(radio => {
        radio.addEventListener('change', handleSearchModeChange);
    });

    searchPhraseByRaceInput.addEventListener('change', handleFormChange);
    searchPhraseByLocationInput.addEventListener('change', handleFormChange);
    searchPhraseByJobInput.addEventListener('change', handleFormChange);

    let timer;
    searchPhraseInput.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(handleInputDebounced, 0);
    });
});




var urlParams = new URLSearchParams(window.location.search);
var availableParams = ['search', 'auto', 'comparison', 'name', 'response', 'keyword', 'mode', 'race', 'location', 'job'];
var defaultValues = ['', 'true', 'similar', 'true', 'true', 'true', '1', 'All', 'All', 'All'];

function validateParam(paramName, paramValue) {
    var index = availableParams.indexOf(paramName);

    if (index !== -1) {
        switch (paramName) {
            case 'comparison':
                if (!['similar', 'same'].includes(paramValue)) {
                    paramValue = defaultValues[index];
                }
                break;
            case 'mode':
                if (![1, 2].includes(parseInt(paramValue))) {
                    paramValue = defaultValues[index];
                }
                break;
            case 'auto':
            case 'name':
            case 'response':
            case 'keyword':
                if (!['true', 'false'].includes(paramValue)) {
                    paramValue = defaultValues[index];
                }
                break;
        }
    } else {
        paramValue = '';
    }

    return paramValue;
}

function getQueryParam(paramName) {
    var paramValue = urlParams.get(paramName);

    if (paramValue === null && availableParams.includes(paramName)) {
        var index = availableParams.indexOf(paramName);
        paramValue = defaultValues[index];
        urlParams.set(paramName, paramValue);
        var newURL = window.location.origin + window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState({}, '', newURL);
    } else {
        paramValue = validateParam(paramName, paramValue);
        if (paramValue !== urlParams.get(paramName)) {
            urlParams.set(paramName, paramValue);
            var newURL = window.location.origin + window.location.pathname + '?' + urlParams.toString();
            window.history.replaceState({}, '', newURL);
        }
    }

    return paramValue;
}

var searchParam = String(getQueryParam('search'));
var autoParam = getQueryParam('auto') === 'true' ? true : false;
var comparisonParam = String(getQueryParam('comparison'));
var nameParam = getQueryParam('name') === 'true' ? true : false;
var responseParam = getQueryParam('response') === 'true' ? true : false;
var keywordParam = getQueryParam('keyword') === 'true' ? true : false;
var modeParam = Number(getQueryParam('mode'));
var raceParam = String(getQueryParam('race'));
var locationParam = String(getQueryParam('location'));
var jobParam = String(getQueryParam('job'));

// Display for debugging.
/*
console.log('search:', searchParam);
console.log('auto:', autoParam);
console.log('comparison:', comparisonParam);
console.log('name:', nameParam);
console.log('response:', responseParam);
console.log('keyword:', keywordParam);
console.log('mode:', modeParam);
console.log('race:', raceParam);
console.log('location:', locationParam);
console.log('job:', jobParam);
*/


$(document).ready(() => {
    const searchOptionsElement = $('#options');
    const toggleButtonElement = $('#options-button');

    const handleWindowResize = () => {
        if ($(window).width() > 900) {
            searchOptionsElement.css({
                display: '',
            });
            if (npcInfoTab.active == true) {
                mainTab.setActive();
            }
        }
    };

    const handleToggleButton = () => {
        if (searchOptionsElement.css('display') === 'none') {
            searchOptionsElement.css({
                display: 'flex'
            });
        } else {
            searchOptionsElement.css('display', 'none');
        }
    };

    toggleButtonElement.click((event) => {
        handleToggleButton();
        event.stopPropagation();
    });

    $(window).resize(handleWindowResize);
});
