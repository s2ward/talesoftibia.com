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
        updateURLWithCurrentTab(this.name);
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

function updateURLWithCurrentTab(tabName) {
  const currentTab = new URL(window.location.href).searchParams.get('t');
  if (currentTab === tabName.replace(/ /g, '_')) return;  // Prevent unnecessary URL update

  const url = new URL(window.location);
  url.searchParams.set('t', tabName.replace(/ /g, '_'));
  window.history.replaceState({}, '', url);
}

// --- --- --- --- --- --- --- --- ---

// Creating the main tab of the window and references to it.
let newTab = null;
let mainTab = null;
let infoTab = null;

// Retrieve the contents of json files and save them to variables.
let booksData = [];
let imgData = [];
const mergeData = [];
let infoTabInstance = new Tab('Info', false, false, 'tabContainer_1', true);

function handleFetchError(error) {
    console.error('Error:', error);
}
//https://s2ward.github.io/tibia/api/
const FETCH_BOOKS = fetch('https://s2ward.github.io/tibia/api/books.json')
    .then(response => response.json())
    .catch(handleFetchError);

const FETCH_IMG = fetch('https://s2ward.github.io/tibia/api/books-img.json')
    .then(response => response.json())
    .catch(handleFetchError);

Promise.all([FETCH_BOOKS, FETCH_IMG])
    .then(([books, images]) => {
        booksData = books;
        imgData = images;

        for (const OBJ_1 of imgData) {
            for (const OBJ_2 of booksData) {
                if (OBJ_1.name === OBJ_2.name) {
                    const MERGE_OBJ = { ...OBJ_1, ...OBJ_2 };
                    mergeData.push(MERGE_OBJ);
                    break;
                }
            }
        }

        // Initialize tabs after data is loaded
      $(document).ready(() => {
        let resultsTab = new Tab('Results', false, false, 'tabContainer_1', false);
        

        mainTab = resultsTab; // Assign to global variable
        infoTab = infoTabInstance; // Assign to global variable

        const urlParams = new URLSearchParams(window.location.search);
        const specifiedTabName = urlParams.get('t');
        informations = urlParams.get('i') || '';

        if (informations) {
          showInformation(informations);
        }

        if (specifiedTabName) {
            const tabKey = `${specifiedTabName}-tabContainer_1`;
            if (Tab.existingTabs.hasOwnProperty(tabKey)) {
                // Activate existing tab if found
                Tab.existingTabs[tabKey].setActive();
            } else {
                // If not found, create and activate a new tab
                showSpecificObject(specifiedTabName);
            }
        } else {
            // If no specific tab is specified, activate the Results tab
            resultsTab.setActive();
        }

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
let searchPhraseInBooksInput = null;
let searchPhraseInCreaturesInput = null;
let searchPhraseInAchievementsInput = null;
let searchModeInput = null;
let filterResultsByNameInput = null;
let filterResultsByLocationInput = null;
let filterResultsByAuthorInput = null;
let filterResultsByVersionInput = null;
// ---
let informations = null;

function setUpFormListeners() {
    resultFilterOptionsForm = document.forms.searchOptionsForm;
    // ---
    searchPhraseInput = resultFilterOptionsForm.elements.searchPhrase;
    autoSearchInput = resultFilterOptionsForm.elements.autoSearch;
    searchPhraseInBooksInput = resultFilterOptionsForm.elements.searchPhraseInBooks;
    searchPhraseInCreaturesInput = resultFilterOptionsForm.elements.searchPhraseInCreatures;
    searchPhraseInAchievementsInput = resultFilterOptionsForm.elements.searchPhraseInAchievements;
    searchModeInput = resultFilterOptionsForm.elements.searchMode;
    filterResultsByNameInput = resultFilterOptionsForm.elements.filterResultsByName;
    filterResultsByLocationInput = resultFilterOptionsForm.elements.filterResultsByLocation;
    filterResultsByAuthorInput = resultFilterOptionsForm.elements.filterResultsByAuthor;
    filterResultsByVersionInput = resultFilterOptionsForm.elements.filterResultsByVersion;

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

    searchPhraseInBooksInput.addEventListener('change', handleFormChange);
    searchPhraseInCreaturesInput.addEventListener('change', handleFormChange);
    searchPhraseInAchievementsInput.addEventListener('change', handleFormChange);

    searchModeInput.forEach(radio => {
        radio.addEventListener('change', handleSearchModeChange);
    });

    filterResultsByNameInput.addEventListener('change', handleFormChange);
    filterResultsByLocationInput.addEventListener('change', handleFormChange);
    filterResultsByAuthorInput.addEventListener('change', handleFormChange);
    filterResultsByVersionInput.addEventListener('change', handleFormChange);

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

    const NAMES_ARRAY = uniqueValues(booksData, 'libraries');
    const NAMES_OPTIONS = NAMES_ARRAY.map(libraries => `<option value="${libraries}">${libraries.replace(/_/g, ' ')}</option>`).join('');
    $('#namesList').html(`<option selected>All</option>${NAMES_OPTIONS}`);

    const LOCATIONS_ARRAY = uniqueValues(booksData, 'locations');
    const LOCATIONS_OPTIONS = LOCATIONS_ARRAY.map(locations => `<option value="${locations}">${locations}</option>`).join('');
    $('#locationsList').html(`<option selected>All</option>${LOCATIONS_OPTIONS}`);

    const AUTHORS_ARRAY = uniqueValues(booksData, 'author');
    const AUTHORS_OPTIONS = AUTHORS_ARRAY.map(author => `<option value="${author}">${author}</option>`).join('');
    $('#authorsList').html(`<option selected>All</option>${AUTHORS_OPTIONS}`);

    const VERSIONS_ARRAY = uniqueValues(booksData, 'version');
    const VERSIONS_OPTIONS = VERSIONS_ARRAY.map(version => `<option value="${version}">${version}</option>`).join('');
    $('#versionsList').html(`<option selected>All</option>${VERSIONS_OPTIONS}`);

    return Promise.resolve();
}
// --- --- --- --- --- --- --- --- ---

// --- --- --- --- --- --- --- --- ---
let searchParam = '';
let autoParam = '';
let booksParam = '';
let creaturesParam = '';
let achievementsParam = '';
let modeParam = '';
let nameParam = '';
let locationParam = '';
let authorParam = '';
let versionParam = '';
let infoParam = '';
let tabParam = '';

function getURLParams() {
    searchParam = String(getQueryParam('s'));
    autoParam = getQueryParam('a') === '1';
    booksParam = getQueryParam('b') === '1';
    creaturesParam = getQueryParam('c') === '1';
    achievementsParam = getQueryParam('ac') === '1';
    modeParam = getQueryParam('m');
    nameParam = String(getQueryParam('n'));
    locationParam = String(getQueryParam('l'));
    authorParam = String(getQueryParam('ar'));
    versionParam = String(getQueryParam('v'));
    infoParam = String(getQueryParam('i')); // 'info' is used as a shortcut for 'info'
    tabParam = String(getQueryParam('t'));

    return Promise.resolve();
}

const URL_PARAMS = new URLSearchParams(window.location.search);
const AVAILABLE_PARAMS_NAMES = ['s', 'a', 'b', 'c', 'ac', 'm', 'n', 'l', 'ar', 'v', 'i', 't'];
const DEFAULT_PARAMS_VALUES = ['', '1', '1', '1', '1', '1', 'All', 'All', 'All', 'All', 'i', 'Results'];

function getQueryParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName) || DEFAULT_PARAMS_VALUES[AVAILABLE_PARAMS_NAMES.indexOf(paramName)];
}

function validateParam(paramName, paramValue) {
    const INDEX = AVAILABLE_PARAMS_NAMES.indexOf(paramName);

    if (INDEX !== -1) {
        switch (paramName) {
            case 'm':
                if (!['1', '2'].includes(paramValue)) {
                    paramValue = DEFAULT_PARAMS_VALUES[INDEX];
                }
                break;
            case 'a':
            case 'b':
            case 'c':
            case 'ac':
                if (!['1', '0'].includes(paramValue)) {
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
    searchPhraseInBooksInput.checked = booksParam;
    searchPhraseInCreaturesInput.checked = creaturesParam;
    searchPhraseInAchievementsInput.checked = achievementsParam;

    for (const input of searchModeInput) {
        if (input.value === modeParam) {
            input.checked = true;
            break;
        }
    }

    for (const option of filterResultsByNameInput.options) {
        if (option.value === nameParam) {
            option.selected = true;
            break;
        }
    }

    for (const option of filterResultsByLocationInput.options) {
        if (option.value === locationParam) {
            option.selected = true;
            break;
        }
    }

    for (const option of filterResultsByAuthorInput.options) {
        if (option.value === authorParam) {
            option.selected = true;
            break;
        }
    }

    for (const option of filterResultsByVersionInput.options) {
        if (option.value === versionParam) {
            option.selected = true;
            break;
        }
    }

    if (infoParam !== '') {
        showInformation(infoParam);
    }

    return Promise.resolve();
}
// --- --- --- --- --- --- --- --- ---

// This function save the form input values to the appropriate variables.
let searchPhraseValue = '';
let autoSearchValue = true;
let searchPhraseInBooksValue = true;
let searchPhraseInCreaturesValue = true;
let searchPhraseInAchievementsValue = true;
let searchModeValue = 1;
let filterResultsByNameValue = 'All';
let filterResultsByLocationValue = 'All';
let filterResultsByAuthorValue = 'All';
let filterResultsByVersionValue = 'All';

function saveFormValues() {
    searchPhraseValue = String(searchPhraseInput.value);
    autoSearchValue = Boolean(autoSearchInput.checked);
    searchPhraseInBooksValue = Boolean(searchPhraseInBooksInput.checked);
    searchPhraseInCreaturesValue = Boolean(searchPhraseInCreaturesInput.checked);
    searchPhraseInAchievementsValue = Boolean(searchPhraseInAchievementsInput.checked);
    searchModeInput.forEach(radio => {
        if (radio.checked) {
            searchModeValue = Number(radio.value);
        }
    });
    filterResultsByNameValue = String(filterResultsByNameInput.value);
    filterResultsByLocationValue = String(filterResultsByLocationInput.value);
    filterResultsByAuthorValue = String(filterResultsByAuthorInput.value);
    filterResultsByVersionValue = String(filterResultsByVersionInput.value);

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
    s: searchPhraseValue,          
    a: autoSearchValue ? '1' : '0', 
    b: searchPhraseInBooksValue ? '1' : '0',   
    c: searchPhraseInCreaturesValue ? '1' : '0',  
    ac: searchPhraseInAchievementsValue ? '1' : '0',   
    m: searchModeValue,             
    n: filterResultsByNameValue,    
    l: filterResultsByLocationValue, 
    ar: filterResultsByAuthorValue,     
    v: filterResultsByVersionValue, 
    i: informations,               
    t: tabParam                    
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

    const BOOK_TEXTS_ARRAY = [];

    for (const obj of booksData) {
        const { name, locations, libraries, author, version, text} = obj;

        const FILTERED_BOOK_TEXTS = [obj].filter(book => {
            if (searchModeValue === 1 &&
                (
                    ((searchPhraseInBooksValue && obj.type === 'book') ||
                        (searchPhraseInCreaturesValue && obj.type === 'creature') ||
                        (searchPhraseInAchievementsValue && obj.type === 'spell')) &&
                    (
                        KEYWORD_REGEX.test((name.replace(/_/g, ' ') + ' ' + text))
                    )
                ) &&
                (
                    (libraries.some(libraries => String(libraries) === filterResultsByNameValue) || filterResultsByNameValue === 'All') &&
                    (locations.some(location => String(location) === filterResultsByLocationValue) || filterResultsByLocationValue === 'All') &&
                    (author === filterResultsByAuthorValue || filterResultsByAuthorValue === 'All') &&
                    (version === filterResultsByVersionValue || filterResultsByVersionValue === 'All')
                )
            ) {
                return true;
            } else if (searchModeValue === 2 &&
                (
                    ((searchPhraseInBooksValue && obj.type === 'book') ||
                        (searchPhraseInCreaturesValue && obj.type === 'creature') ||
                        (searchPhraseInAchievementsValue && obj.type === 'spell'))
                ) &&
                (
                    (libraries.some(libraries => String(libraries) === filterResultsByNameValue) || filterResultsByNameValue === 'All') &&
                    (locations.some(location => String(location) === filterResultsByLocationValue) || filterResultsByLocationValue === 'All') &&
                    (author === filterResultsByAuthorValue || filterResultsByAuthorValue === 'All') &&
                    (version === filterResultsByVersionValue || filterResultsByVersionValue === 'All')
                )
            ) {
                return true;
            } else {
                return false;
            }
        });

        BOOK_TEXTS_ARRAY.push(...FILTERED_BOOK_TEXTS);
    }

    let result = preparedKeyword.replace(/'(?!\w)|(?<!\w)'/g, '\\b').replace(/\(([^)]*)\)/g, '$1').replace(/[&|]/g, ',').trim();
    result = result.endsWith(',') ? result.slice(0, -1) : result;
    const keyWordsArray = result.split(',').map(word => word.trim());
    const KEYWORDS_REGEX = new RegExp(`\\b([a-zA-Z0-9'-]*(${keyWordsArray.join('|')})[a-zA-Z0-9'-]*)\\b`, 'igu');

    let BOOK_TEXTS_ARRAY_DIV_CONTENT = null;

    if (searchModeValue === 1) {
        BOOK_TEXTS_ARRAY_DIV_CONTENT = '<div style="column-count: 2; orphans: 1; widows: 1; column-gap: 1rem;">' + [...BOOK_TEXTS_ARRAY].map(obj => `
            <div class="bookBoxContent tibiaStyleBorderHigh2 bottomSpace10M">
                <div class="flexRow bookHeader" onClick="showSpecificObject(\`${obj.name}\`, false); showInformation(\`${obj.name}\`);">
                    <div style="background-image: url('https://s2ward.github.io/tibia/img/${obj.type}/${obj.img[0].replace(/ /g, '_').replace(/'/g, "\\'")}.png')"
                        class="bookImage"
                        >
                    </div>
                    <div class="bookName fullWidth rightSpace10P tibiaStyleTextLight">${obj.name.replace(/_/g, ' ')}</div>
                </div>

                <div class="bookText tibiaStyleBorderDeep1 spaceAround5P leftSpace10M rightSpace10M bottomSpace10M tibiaStyleTextLight">${searchModeValue === 1 ? obj.text.toString().replace(KEYWORDS_REGEX, '<a>$1</a>').replace(/\n/g, '<br/><br/>') : obj.text.toString().replace(/\n/g, '<br/><br/>')}</div>
            </div>
        `).join('') + '</div>';
    } else {
        BOOK_TEXTS_ARRAY_DIV_CONTENT = '<div class="allNpcBox">' + [...BOOK_TEXTS_ARRAY].map(obj => `
            <div class="npcBox" onClick="showSpecificObject(\`${obj.name}\`, false); showInformation(\`${obj.name}\`);">
                <div class="npcName npcNameColor">${obj.name.replace(/_/g, ' ')}</div>
                <div class="npcAppearance" style="background-image: url('https://s2ward.github.io/tibia/img/${obj.type}/${obj.img[0].replace(/ /g, '_').replace(/'/g, "\\'")}.png')">
                </div>
            </div>
        `).join('') + '</div>';
    }

    if (shouldActivateResultsTab()) { 
        mainTab.enterContent(BOOK_TEXTS_ARRAY_DIV_CONTENT);
        mainTab.setActive();
    } else {
        // Otherwise, display the content without setting the tab as active
        mainTab.enterContent(BOOK_TEXTS_ARRAY_DIV_CONTENT);
    }

    console.timeEnd('search');
}

function shouldActivateResultsTab() {
  // Get the 'tab' parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const specifiedTabName = urlParams.get('t');

  // If the 'tab' parameter is not specified or is 'Results', activate the Results tab
  if (!specifiedTabName || specifiedTabName === 'Results') {
      return true;
  }
  return false;
}

// --- --- --- --- --- --- --- --- ---

// A function that displays the player's dialogues with the NPC based on the name of the npc.
// eslint-disable-next-line no-unused-vars
function showSpecificObject(objName, closable) {
    const FOUND_OBJ = booksData.find(obj => obj.name === objName);
    if (!FOUND_OBJ) {
      return false;
    } 

    if (FOUND_OBJ) {
        const OBJ_DIV_CONTENT = `
            <div style="width: 29.75rem; margin: auto; display: block;" class="bookBoxContent tibiaStyleBorderHigh2">
                <div class="flexRow bookHeader" onClick="showInformation(\`${FOUND_OBJ.name}\`);">
                    <div
                        class="bookImage"
                        style="background-image: url('https://s2ward.github.io/tibia/img/${FOUND_OBJ.type}/${FOUND_OBJ.img[0].replace(/ /g, '_').replace(/'/g, "\\'")}.png')">
                    </div>
                    <div class="bookName fullWidth rightSpace10P tibiaStyleTextLight">${FOUND_OBJ.name.replace(/_/g, ' ')}</div>
                </div>

                <div>
                    <div class="bookText tibiaStyleBorderDeep1 spaceAround5P leftSpace10M rightSpace10M bottomSpace10M tibiaStyleTextLight">${FOUND_OBJ.text.toString().replace(/\n/g, '<br/><br/>')}</div>
                </div>
                ${FOUND_OBJ['previous-book'] !== '_NOPREV' || FOUND_OBJ['next-book'] !== '_NONEXT'
                ? `<div class="horizontalBar topSpace10M bottomSpace10M leftSpace10M rightSpace10M"></div>
                
                    <div class="flexRow topSpace10M bottomSpace10M leftSpace10M rightSpace10M">
                        <a 
                            onClick="showSpecificObject('${FOUND_OBJ['previous-book'].replace(/'/g, "\\'")}', true);"
                            class="tibiaStyleButtonType1 fullWidth rightSpace5M">
                            ${FOUND_OBJ['previous-book'] !== '_NOPREV' ? '⮜ PREV' : '⬤'}
                        </a>
                        <a 
                            onClick="showSpecificObject('${FOUND_OBJ['next-book'].replace(/'/g, "\\'")}', true);"
                            class="tibiaStyleButtonType1 fullWidth leftSpace5M">
                            ${FOUND_OBJ['next-book'] !== '_NONEXT' ? 'NEXT ⮞' : '⬤'}
                        </a>
                    </div>`
                : ''
            }
            </div>
        `;

        createNewTab(`${FOUND_OBJ.name.replace(/_/g, ' ')}`, true, true, 'tabContainer_1', false, OBJ_DIV_CONTENT);
    } else {
        return false;
    }
}
// --- --- --- --- --- --- --- --- ---

// --- --- --- --- --- --- --- --- ---
function createNewTab(name, active, closable, container, mobile, content) {
  const KEY = `${name}-${container}`;

  if (!Tab.existingTabs[KEY]) {
      Tab.existingTabs[KEY] = new Tab(name, active, closable, container, mobile, content);
  } else {
  }
  Tab.existingTabs[KEY].setActive();
}
// --- --- --- --- --- --- --- --- ---

// A function that displays informations.
function showInformation(objName) {
    const INFO_DIV = $('#npc-info');
    const FOUND_OBJ = booksData.find(obj => obj.name === objName);

    if (FOUND_OBJ) {
        const INFO_DIV_CONTENT = `
            <div class="npcName npcNameColor">${FOUND_OBJ.name.replace(/_/g, ' ')}</div>
            <div class="flexRow">${[...FOUND_OBJ.img].map(img => `
                <div class="npcAppearance" 
                style="background-image: url('https://s2ward.github.io/tibia/img/${FOUND_OBJ.type}/${img.replace(/ /g, '_').replace(/'/g, "\\'")}.png')"></div>
            `).join('')}
            </div>
            <div class="npcMonologues bottomSpace10M">
                <p class="npcMonologueFormat npcMonologueColor">${FOUND_OBJ.description}</p>
            </div>
            <div class="npcInformation bottomSpace10M">
                <table class="tibiaStyleTable userSelectLock">
                    <tbody class="tibiaStyleTbody">
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Author</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ.author === '?' ? '*' : FOUND_OBJ.author === '' ? '*' : FOUND_OBJ.author}</td>
                        </tr>
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Version</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ.version !== '_NOVER' ? FOUND_OBJ.version : '*'}</td>
                        </tr>
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Prev book</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ['previous-book'] !== '_NOPREV' ? FOUND_OBJ['previous-book'].replace(/_/g, ' ') : '*'}</td>
                        </tr>
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Next book</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ['next-book'] !== '_NONEXT' ? FOUND_OBJ['next-book'].replace(/_/g, ' ') : '*'}</td>
                        </tr>
                        <tr class="tibiaStyleTr">
                            <td class="tibiaStyleTd">Location</td>
                            <td class="tibiaStyleTd">${FOUND_OBJ.locations.join('<br/><br/>')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ${FOUND_OBJ.map[0] !== 'https://tibiamaps.io/map'
                ? `
                    <div class="npcLocation">
                        <a class="tibiaStyleButtonType1 bottomSpace10M" href="${FOUND_OBJ.map}" target="_blank">Location</a>
                    </div>
                `
                : ''}
            ${FOUND_OBJ['related-articles'][0] !== '_NOREL'
                ? `
                    <p class="tibiaStyleParagraph userSelectLock">Related Articles:</p>
                    <div class="npcQuests topSpace10M bottomSpace10M">
                        ${FOUND_OBJ['related-articles'].map(article => `<a class="tibiaStyleButtonType1 bottomSpace10M" href="${article['article-url']}" target="_blank">${article['article-name']}</a>`).join('')}
                        <div style="width: 100%; height: 1px;"></div>
                    </div>
                `
                : ''}
        `;

        informations = objName;
        
        INFO_DIV.empty().html(INFO_DIV_CONTENT);
        infoTab.enterContent(INFO_DIV_CONTENT);
        updateURLWithInfoParam(informations);
    } else {
        return false;
    }
}

function updateURLWithInfoParam(infoValue) {
  const url = new URL(window.location);
  url.searchParams.set('i', infoValue); // Set only the 'info' parameter
  window.history.replaceState({}, '', url);
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

// 254ms
// eslint-disable-next-line no-unused-vars
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
