// Search engine made by GABRO

// A class for generating and managing window tabs.
class Tab {
    static existingTabs = {};

    constructor(name, active, closable, container, mobile, content) {
        const KEY = `${name}-${container}`;

        if (Object.prototype.hasOwnProperty.call(Tab.existingTabs, KEY)) {
            Tab.existingTabs[KEY].setActive();
            return;
        }

        this.name = name;
        this.active = active;
        this.closable = closable;
        this.container = container;
        this.mobile = mobile;
        this.content = content;

        this.tabElement = null;
        this.tabContentElement = null;

        this.createTab();
        this.enterContent(this.content);

        Tab.existingTabs[KEY] = this;
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
        const TAB_WINDOW_CONTAINER = $(`
            <div class="tabWindowContainer tibiaStyleBorderDeep1 fullHeight">
                <div class="tabWindowScrollBox scrollWindowContent npcBoxContainer">
                    ${Array.isArray(content) ? content.map(item => item.outerHTML).join('') : content}
                </div>
            </div>
        `);

        this.tabContentElement.empty().append(TAB_WINDOW_CONTAINER);
    }

    closeTab() {
        const PREVIOUS_TAB = $(`#${this.container} .tabs li`).first();
        PREVIOUS_TAB.length > 0 && PREVIOUS_TAB.trigger('click');

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
        Object.values(Tab.existingTabs)
            .filter(tab => tab.container === this.container)
            .forEach(tab => {
                tab.active = false;
            });
    }
}
// --- --- --- --- --- --- --- --- ---

// Creating the main tab of the window and references to it.
let newTab = null;
let mainTab = null;
let infoTab = null;

$(document).ready(() => {
    newTab = new Tab('Results', true, false, 'tabContainer_1', false);
    mainTab = newTab;
    mainTab.enterContent('');

    newTab = new Tab('Info', false, false, 'tabContainer_1', true);
    infoTab = newTab;
    infoTab.enterContent('');
});
// --- --- --- --- --- --- --- --- ---

// Retrieve the contents of json files and save them to variables.
let conversationsData = [];
let npcData = [];
const mergeData = [];

function handleFetchError(error) {
    console.error('Error:', error);
}
//https://s2ward.github.io/tibia/api/
const FETCH_CONVERSATIONS = fetch('https://s2ward.github.io/tibia/api/conversations.json')
    .then(response => response.json())
    .catch(handleFetchError);

const FETCH_NPC_DATA = fetch('https://s2ward.github.io/tibia/api/npc_data.json')
    .then(response => response.json())
    .catch(handleFetchError);

Promise.all([FETCH_CONVERSATIONS, FETCH_NPC_DATA])
    .then(([conversations, npcDataResponse]) => {
        conversationsData = conversations;
        npcData = npcDataResponse;

        for (const OBJ_1 of npcData) {
            for (const OBJ_2 of conversationsData) {
                if (OBJ_1.name === OBJ_2.name) {
                    const MERGE_OBJ = { ...OBJ_1, ...OBJ_2 };
                    mergeData.push(MERGE_OBJ);
                    break;
                }
            }
        }

        $(document).ready(() => {
            setUpFormListeners()
                .then(createPropertyLists)
                .then(getURLParams)
                .then(setFormSettings)
                .then(saveFormValues)
                .then(updateURLWithSearchParams)
                .catch(function (error) {
                    console.error('Error:', error);
                });
        });
    })
    .catch(handleFetchError);
// --- --- --- --- --- --- --- --- ---

// Retrieving information from a form and listening for changes in the form.
let resultFilterOptionsForm = null;
// ---
let searchPhraseInput = null;
let autoSearchInput = null;
let searchPhraseInNpcNameInput = null;
let searchPhraseInNpcDialogueInput = null;
let searchPhraseInPlayerDialogueInput = null;
let searchModeInput = null;
let searchPhraseByRaceInput = null;
let searchPhraseByLocationInput = null;
let searchPhraseByJobInput = null;
let searchPhraseByVersionInput = null;
// ---
let informations = null;

function setUpFormListeners() {
    resultFilterOptionsForm = document.forms.searchOptionsForm;
    // ---
    searchPhraseInput = resultFilterOptionsForm.elements.searchPhrase;
    autoSearchInput = resultFilterOptionsForm.elements.autoSearch;
    searchPhraseInNpcNameInput = resultFilterOptionsForm.elements.searchPhraseInNpcName;
    searchPhraseInNpcDialogueInput = resultFilterOptionsForm.elements.searchPhraseInNpcDialogue;
    searchPhraseInPlayerDialogueInput = resultFilterOptionsForm.elements.searchPhraseInPlayerDialogue;
    searchModeInput = resultFilterOptionsForm.elements.searchMode;
    searchPhraseByRaceInput = resultFilterOptionsForm.elements.searchPhraseByRace;
    searchPhraseByLocationInput = resultFilterOptionsForm.elements.searchPhraseByLocation;
    searchPhraseByJobInput = resultFilterOptionsForm.elements.searchPhraseByJob;
    searchPhraseByVersionInput = resultFilterOptionsForm.elements.searchPhraseByVersion;

    // Listening for changes in the form.
    function handleFormChange() {
        saveFormValues().then(updateURLWithSearchParams);
    }

    function handleSearchModeChange() {
        saveFormValues().then(updateURLWithSearchParams);
    }

    function handleInputDebounced() {
        saveFormValues().then(updateURLWithSearchParams);
    }

    resultFilterOptionsForm.addEventListener('submit', event => {
        event.preventDefault();
        saveFormValues().then(updateURLWithSearchParams);
    });

    autoSearchInput.addEventListener('change', handleFormChange);

    searchPhraseInNpcNameInput.addEventListener('change', handleFormChange);
    searchPhraseInNpcDialogueInput.addEventListener('change', handleFormChange);
    searchPhraseInPlayerDialogueInput.addEventListener('change', handleFormChange);

    searchModeInput.forEach(radio => {
        radio.addEventListener('change', handleSearchModeChange);
    });

    searchPhraseByRaceInput.addEventListener('change', handleFormChange);
    searchPhraseByLocationInput.addEventListener('change', handleFormChange);
    searchPhraseByJobInput.addEventListener('change', handleFormChange);
    searchPhraseByVersionInput.addEventListener('change', handleFormChange);

    let timer;
    searchPhraseInput.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(handleInputDebounced, 0);
    });

    return Promise.resolve();
}
// --- --- --- --- --- --- --- --- ---

// A function that creates drop-down lists based on unique values.
function createPropertyLists() {
    function uniqueValues(data, key) {
        const uniqueVal = new Set();

        data.forEach(item => {
            const val = item[key];
            if (Array.isArray(val)) {
                val.forEach(location => {
                    uniqueVal.add(location);
                });
            } else {
                uniqueVal.add(val);
            }
        });

        return Array.from(uniqueVal).sort();
    }
    /* const uniqueValues = (data, key) => [...new Set(data.map(item => item[key]))].sort(); */
    const RACES_ARRAY = uniqueValues(npcData, 'race');
    const RACES_OPTIONS = RACES_ARRAY.map(race => `<option value="${race}">${race}</option>`).join('');
    $('#racesList').html(`<option selected>All</option>${RACES_OPTIONS}`);

    const LOCATIONS_ARRAY = uniqueValues(npcData, 'location');
    const LOCATIONS_OPTIONS = LOCATIONS_ARRAY.map(location => `<option value="${location}">${location}</option>`).join('');
    $('#locationsList').html(`<option selected>All</option>${LOCATIONS_OPTIONS}`);

    const JOBS_ARRAY = uniqueValues(npcData, 'job');
    const JOBS_OPTIONS = JOBS_ARRAY.map(job => `<option value="${job}">${job}</option>`).join('');
    $('#jobsList').html(`<option selected>All</option>${JOBS_OPTIONS}`);

    const VERSIONS_ARRAY = uniqueValues(npcData, 'version');
    const VERSIONS_OPTIONS = VERSIONS_ARRAY.map(version => `<option value="${version}">${version}</option>`).join('');
    $('#versionsList').html(`<option selected>All</option>${VERSIONS_OPTIONS}`);

    return Promise.resolve();
}
// --- --- --- --- --- --- --- --- ---

// --- --- --- --- --- --- --- --- ---
let searchParam = '';
let autoParam = '';
let nameParam = '';
let responseParam = '';
let keywordParam = '';
let modeParam = '';
let raceParam = '';
let locationParam = '';
let jobParam = '';
let versionParam = '';
let infoParam = '';

function getURLParams() {
    searchParam = String(getQueryParam('search'));
    autoParam = getQueryParam('auto') === 'true';
    nameParam = getQueryParam('name') === 'true';
    responseParam = getQueryParam('response') === 'true';
    keywordParam = getQueryParam('keyword') === 'true';
    modeParam = getQueryParam('mode');
    raceParam = String(getQueryParam('race'));
    locationParam = String(getQueryParam('location'));
    jobParam = String(getQueryParam('job'));
    versionParam = String(getQueryParam('version'));
    infoParam = String(getQueryParam('info'));

    return Promise.resolve();
}

const URL_PARAMS = new URLSearchParams(window.location.search);
const AVAILABLE_PARAMS_NAMES = ['search', 'auto', 'name', 'response', 'keyword', 'mode', 'race', 'location', 'job', 'version', 'info'];
const DEFAULT_PARAMS_VALUES = ['', 'true', 'true', 'true', 'true', '1', 'All', 'All', 'All', 'All', ''];

function getQueryParam(paramName) {
    let paramValue = URL_PARAMS.get(paramName);

    if (paramValue === null && AVAILABLE_PARAMS_NAMES.includes(paramName)) {
        const INDEX = AVAILABLE_PARAMS_NAMES.indexOf(paramName);
        paramValue = DEFAULT_PARAMS_VALUES[INDEX];
        URL_PARAMS.set(paramName, paramValue);
        const NEW_URL = `${window.location.origin}${window.location.pathname}?${URL_PARAMS.toString()}`;
        window.history.replaceState({}, '', NEW_URL.href);
    } else {
        paramValue = validateParam(paramName, paramValue);
        if (paramValue !== URL_PARAMS.get(paramName)) {
            URL_PARAMS.set(paramName, paramValue);
            const NEW_URL = `${window.location.origin}${window.location.pathname}?${URL_PARAMS.toString()}`;
            window.history.replaceState({}, '', NEW_URL.href);
        }
    }

    return paramValue;
}

function validateParam(paramName, paramValue) {
    const INDEX = AVAILABLE_PARAMS_NAMES.indexOf(paramName);

    if (INDEX !== -1) {
        switch (paramName) {
            case 'mode':
                if (!['1', '2'].includes(paramValue)) {
                    paramValue = DEFAULT_PARAMS_VALUES[INDEX];
                }
                break;
            case 'auto':
            case 'name':
            case 'response':
            case 'keyword':
                if (!['true', 'false'].includes(paramValue)) {
                    paramValue = DEFAULT_PARAMS_VALUES[INDEX];
                }
                break;
        }
    } else {
        paramValue = '';
    }

    return paramValue;
}
// --- --- --- --- --- --- --- --- ---

// This function sets the form inputs values and settings based on the provided parameters.
function setFormSettings() {
    searchPhraseInput.value = searchParam;
    autoSearchInput.checked = autoParam;
    searchPhraseInNpcNameInput.checked = nameParam;
    searchPhraseInNpcDialogueInput.checked = responseParam;
    searchPhraseInPlayerDialogueInput.checked = keywordParam;

    for (const input of searchModeInput) {
        if (input.value === modeParam) {
            input.checked = true;
            break;
        }
    }

    for (const option of searchPhraseByRaceInput.options) {
        if (option.value === raceParam) {
            option.selected = true;
            break;
        }
    }

    for (const option of searchPhraseByLocationInput.options) {
        if (option.value === locationParam) {
            option.selected = true;
            break;
        }
    }

    for (const option of searchPhraseByJobInput.options) {
        if (option.value === jobParam) {
            option.selected = true;
            break;
        }
    }

    for (const option of searchPhraseByVersionInput.options) {
        if (option.value === versionParam) {
            option.selected = true;
            break;
        }
    }

    // ---
    if (infoParam !== '') {
        showInformation(infoParam);
    }

    return Promise.resolve();
}
// --- --- --- --- --- --- --- --- ---

// This function save the form input values to the appropriate variables.
let searchPhraseValue = '';
let autoSearchValue = true;
let searchPhraseInNpcNameValue = true;
let searchPhraseInNpcDialogueValue = true;
let searchPhraseInPlayerDialogueValue = true;
let searchModeValue = 1;
let searchPhraseByRaceValue = 'All';
let searchPhraseByLocationValue = 'All';
let searchPhraseByJobValue = 'All';
let searchPhraseByVersionValue = 'All';

function saveFormValues() {
    searchPhraseValue = String(searchPhraseInput.value);
    autoSearchValue = Boolean(autoSearchInput.checked);
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
    searchPhraseByVersionValue = String(searchPhraseByVersionInput.value);

    if (searchPhraseValue.length > 2 || searchModeValue === 2) {
        searchSpecificObject(searchPhraseValue);
    } else {
        mainTab.enterContent('');
    }

    return Promise.resolve();
}
// --- --- --- --- --- --- --- --- ---

// This function updates the URL with the selected search params.
function updateURLWithSearchParams() {
    const URL_PARAMS = {
        search: searchPhraseValue,
        auto: autoSearchValue,
        name: searchPhraseInNpcNameValue,
        response: searchPhraseInNpcDialogueValue,
        keyword: searchPhraseInPlayerDialogueValue,
        mode: searchModeValue,
        race: searchPhraseByRaceValue,
        location: searchPhraseByLocationValue,
        job: searchPhraseByJobValue,
        version: searchPhraseByVersionValue,
        info: informations
    };

    const NEW_URL = new URL(window.location.href);

    new URLSearchParams(URL_PARAMS).forEach((value, key) => {
        NEW_URL.searchParams.set(key, value);
    });

    window.history.replaceState({}, '', NEW_URL.href);

    return Promise.resolve();
}
// --- --- --- --- --- --- --- --- ---

// A function that searches for player dialogues with NPCs based on keywords.
function searchSpecificObject(keyword) {
    console.time('search');
    const preparedKeyword = keyword.toLowerCase().trim();
    const KEYWORD_REGEX = new RegExp(transformInput(preparedKeyword), 'gium');
    console.log(KEYWORD_REGEX);

    const NPC_CONVERSATIONS_MAP = new Map();

    for (const obj of mergeData) {
        const { name, race, location, job, version /*, dialogues */ } = obj;

        const FILTERED_NPC_CONVERSATIONS = obj.conversation.filter(conv => {
            const { prompt, answer } = conv;

            if (searchModeValue === 1 &&
                (
                    (
                        searchPhraseInPlayerDialogueValue && !searchPhraseInNpcDialogueValue && !searchPhraseInNpcNameValue && (
                            KEYWORD_REGEX.test(prompt)
                        )
                    ) || (
                        searchPhraseInNpcDialogueValue && !searchPhraseInPlayerDialogueValue && !searchPhraseInNpcNameValue && (
                            answer.some(ans => KEYWORD_REGEX.test(ans))
                        )
                    ) || (
                        searchPhraseInNpcNameValue && !searchPhraseInPlayerDialogueValue && !searchPhraseInNpcDialogueValue && (
                            KEYWORD_REGEX.test(
                                name.toLowerCase().replace(/_/g, ' ')
                            )
                        )
                    ) || (
                        searchPhraseInPlayerDialogueValue && searchPhraseInNpcDialogueValue && searchPhraseInNpcNameValue && (
                            answer.some(ans => KEYWORD_REGEX.test(
                                (ans + ' ' + prompt + ' ' + name.replace(/_/g, ' '))
                            )
                            )
                        )
                    ) || (
                        searchPhraseInPlayerDialogueValue && searchPhraseInNpcNameValue && !searchPhraseInNpcDialogueValue && (
                            KEYWORD_REGEX.test(
                                (prompt + ' ' + name.replace(/_/g, ' '))
                            )
                        )
                    ) || (
                        searchPhraseInNpcDialogueValue && searchPhraseInNpcNameValue && !searchPhraseInPlayerDialogueValue && (
                            answer.some(ans => KEYWORD_REGEX.test(
                                (ans + ' ' + name.replace(/_/g, ' '))
                            )
                            )
                        )
                    ) || (
                        searchPhraseInNpcDialogueValue && searchPhraseInPlayerDialogueValue && !searchPhraseInNpcNameValue && (
                            answer.some(ans => KEYWORD_REGEX.test(
                                (ans + ' ' + prompt)
                            )
                            )
                        )
                    )
                ) &&
                (
                    (race === searchPhraseByRaceValue || searchPhraseByRaceValue === 'All') &&
                    (location === searchPhraseByLocationValue || searchPhraseByLocationValue === 'All') &&
                    (job === searchPhraseByJobValue || searchPhraseByJobValue === 'All') &&
                    (version === searchPhraseByVersionValue || searchPhraseByVersionValue === 'All')
                )
            ) {
                return true;
            } else if (searchModeValue === 2 &&
                (
                    (race === searchPhraseByRaceValue || searchPhraseByRaceValue === 'All') &&
                    (location === searchPhraseByLocationValue || searchPhraseByLocationValue === 'All') &&
                    (job === searchPhraseByJobValue || searchPhraseByJobValue === 'All') &&
                    (version === searchPhraseByVersionValue || searchPhraseByVersionValue === 'All')
                )
            ) {
                return true;
            } else {
                return false;
            }
        });

        if (FILTERED_NPC_CONVERSATIONS.length === 0) continue;

        if (!NPC_CONVERSATIONS_MAP.has(obj.name)) {
            NPC_CONVERSATIONS_MAP.set(obj.name, []);
        }

        NPC_CONVERSATIONS_MAP.get(obj.name).push(...FILTERED_NPC_CONVERSATIONS);
    }

    let result = preparedKeyword.replace(/'(?!\w)|(?<!\w)'/g, '\\b').replace(/\(([^)]*)\)/g, '$1').replace(/[&|]/g, ',').trim();
    result = result.endsWith(',') ? result.slice(0, -1) : result;
    const keyWordsArray = result.split(',').map(word => word.trim());
    const KEYWORDS_REGEX = new RegExp(`\\b([a-zA-Z0-9'-]*(${keyWordsArray.join('|')})[a-zA-Z0-9'-]*)\\b`, 'igu');

    let NPC_CONV_ARRAY_DIV_CONTENT = null;

    if (searchModeValue === 1) {
        NPC_CONV_ARRAY_DIV_CONTENT = [...NPC_CONVERSATIONS_MAP].map(([npcName, conversations]) => `
            <div class="npcBoxContent">
                <div
                    onClick="showSpecificObject(\`${npcName}\`); showInformation(\`${npcName}\`);"
                    style="background-image: url('https://s2ward.github.io/tibia/img/npc/${npcName.replace(/'/g, "\\'")}.png')">
                </div>
                <div>
                    ${conversations.map(conv => `
                        <a>Player: ${conv.prompt}</a>
                        ${conv.answer.map(ans => `
                            <p>${npcName.replace(/_/g, ' ')}: ${searchModeValue === 1
                ? ans.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
                    .replace(KEYWORDS_REGEX, '<a>$1</a>')
                : ans.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}</p>
                        `).join('')}
                    `).join('')}
                </div>
            </div>
        `).join('');
    } else {
        NPC_CONV_ARRAY_DIV_CONTENT = '<div class="allNpcBox">' + [...NPC_CONVERSATIONS_MAP].map(([npcName]) => `
            <div class="npcBox" onClick="showSpecificObject(\`${npcName}\`); showInformation(\`${npcName}\`);">
                <div class="npcName npcNameColor">${npcName.replace(/_/g, ' ')}</div>
                <div class="npcAppearance" style="background-image: url('https://s2ward.github.io/tibia/img/npc/${npcName.replace(/'/g, "\\'")}.png')">
                </div>
            </div>
        `).join('') + '</div>';
    }

    mainTab.enterContent(NPC_CONV_ARRAY_DIV_CONTENT);
    mainTab.setActive();

    console.timeEnd('search');
}
// --- --- --- --- --- --- --- --- ---

// A function that displays the player's dialogues with the NPC based on the name of the npc.
// eslint-disable-next-line no-unused-vars
function showSpecificObject(objName) {
    const FOUND_OBJ = conversationsData.find(obj => obj.name === objName);

    if (FOUND_OBJ) {
        const OBJ_DIV_CONTENT = `
            <div class="npcBoxContent">
                <div
                    onClick="showInformation(\`${FOUND_OBJ.name}\`);"
                    style="background-image: url('https://s2ward.github.io/tibia/img/npc/${FOUND_OBJ.name.replace(/'/g, "\\'")}.png')">
                </div>
                <div>
                    ${FOUND_OBJ.conversation.map(conv => `
                        <a>Player: ${conv.prompt}</a>
                        ${conv.answer.map(ans => `
                            <p>${FOUND_OBJ.name.replace(/_/g, ' ')}: ${ans.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}</p>
                        `).join('')}
                    `).join('')}
                </div>
            </div>
        `;

        createNewTab(`${FOUND_OBJ.name.replace(/_/g, ' ')}`, false, true, 'tabContainer_1', false, OBJ_DIV_CONTENT);
    } else {
        return false;
    }
}
// --- --- --- --- --- --- --- --- ---

// --- --- --- --- --- --- --- --- ---
function createNewTab(name, active, closable, container, mobile, content) {
    try {
        newTab = new Tab(name, active, closable, container, mobile, content);
    } catch (error) {
        console.error('Error:', error);
    }
}
// --- --- --- --- --- --- --- --- ---

// A function that displays informations.
function showInformation(objName) {
    const INFO_DIV = $('#npc-info');
    const FOUND_OBJ = npcData.find(obj => obj.name === objName);

    if (FOUND_OBJ) {
        const INFO_DIV_CONTENT = `
            <div class="npcName npcNameColor">${FOUND_OBJ.name.replace(/_/g, ' ')}</div>
            <div class="npcAppearance bottomSpace10M" 
            style="background-image: url('https://s2ward.github.io/tibia/img/npc/${FOUND_OBJ.name.replace(/ /g, '_').replace(/'/g, "\\'")}.png')"></div>
            <div class="npcMonologues bottomSpace10M">
                ${FOUND_OBJ.dialogues.map(dialogue => `<p class="npcMonologueFormat npcMonologueColor">${dialogue}</p>`).join('')}
            </div>
            <div class="npcInformation bottomSpace10M">
                <table class="tibiaStyleTable userSelectLock">
                    <tbody class="tibiaStyleTbody">
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Job</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ.job}</td>
                        </tr>
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Race</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ.race}</td>
                        </tr>
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Gender</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ.gender}</td>
                        </tr>
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Location</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ.location}${FOUND_OBJ.subarea ? ` &nbsp;⮞&nbsp; ${FOUND_OBJ.subarea}` : ''}</td>
                        </tr>
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Version</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ.version}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ${FOUND_OBJ.map[0] !== ''
                ? `
                    <div class="npcLocation">
                        <a class="tibiaStyleButtonType1 bottomSpace10M" href="${FOUND_OBJ.map}" target="_blank">NPC Location</a>
                    </div>
                `
                : ''}
            ${FOUND_OBJ.quests.length !== 0
                ? `
                    <p class="tibiaStyleParagraph userSelectLock">Related Quests:</p>
                    <div class="npcQuests topSpace10M bottomSpace10M">
                        ${FOUND_OBJ.quests.map(quest => `<a class="tibiaStyleButtonType1 bottomSpace10M" href="${quest['quest-url']}" target="_blank">${quest['quest-name']}</a>`).join('')}
                        <div style="width: 100%; height: 1px;"></div>
                    </div>
                `
                : ''}
        `;

        informations = objName;
        updateURLWithSearchParams();

        INFO_DIV.empty().html(INFO_DIV_CONTENT);
        infoTab.enterContent(INFO_DIV_CONTENT);
    } else {
        return false;
    }
}
// --- --- --- --- --- --- --- --- ---

$(document).ready(() => {
    const searchOptionsElement = $('#options');
    const toggleButtonElement = $('#options-button');

    const handleWindowResize = () => {
        if ($(window).width() > 900) {
            searchOptionsElement.css({
                display: ''
            });
            if (infoTab.active === true) {
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

function transformInput(input) {
    return '^' + input
        .replace(/\s\s/g, ' ')
        .replace(/([a-zA-Z0-9\-'\s])\s+([a-zA-Z0-9\-'\s])/g, '$1#$2')
        .replace(/\s/g, '')
        .replace(/\(/g, '(?:')
        .replace(/([a-zA-Z0-9\-'\s#]+)/g, '(?=.*$1)')
        .replace(/&/g, '')
        .replace(/'(?!\w)|(?<!\w)'/g, '\\b')
        .replace(/#/g, ' ')
}

/* function transformInput1(input) {
    return '^' + input
        .split('  ').join(' ')
        .replace(/([a-zA-Z0-9\-'\s])\s+([a-zA-Z0-9\-'\s])/g, '$1#$2')
        .split(' ').join('')
        .split('(').join('(?:')
        .replace(/([a-zA-Z0-9\-'\s#]+)/g, '(?=.*$1)')
        .split('&').join('')
        .split('\'').join('\\b')
        .split('#').join(' ');
} */
/*
zrobić sprawdzanie czy liczba nawiasów ( lub ) jest parzysta
zrobić sprawdzanie czy po | albo & jest wyraz
('uman' | zathroth) & ('god | ascen) | banor
function transformInput(input) {
    return new RegExp(input
        .replace(/\(/g, '(?:')
        .replace(/([a-zA-Z0-9\-']+)/g, '(?=.*$1)')
        .replace(/&/g, '')
        .replace(/'(?!\w)|(?<!\w)'/g, '\\b')
        .replace(/\s/g, '')
        , 'giu'
    );
}
*/

/*
'b&'o&'n&'e$'l&'o&'r&'d
.replace(/(?<=\w)'(?!\w)|(?<!\w)'(?=\w)/g, `\\b`)
*/

/* const findDuplicateObjects = (data) => {
    const duplicates = [];
    const seenNames = {};

    data.forEach((obj) => {
        const name = obj.name;
        if (seenNames.hasOwnProperty(name)) {
            if (!duplicates.includes(seenNames[name])) {
                duplicates.push(obj.name);
            }
        } else {
            seenNames[name] = obj;
        }
    });

    return duplicates;
}; */