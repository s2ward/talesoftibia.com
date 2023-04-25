let conversationsData = [];
let npcData = [];
const outputDiv = document.getElementById('output');
const npcInfoDiv = document.getElementById('npc-info');

fetch('https://s2ward.github.io/tibia/api/conversations.json')
  .then(response => response.json())
  .then(data => {
    conversationsData = data;
  })
  .catch(error => {
    console.error('Error fetching conversations:', error);
  });

fetch('https://s2ward.github.io/tibia/api/npc_data.json')
  .then(response => response.json())
  .then(data => {
    npcData = data;
  })
  .catch(error => {
    console.error('Error fetching conversations:', error);
  });


  function searchConversation(query) {
    const queryLower = query.toLowerCase();
  
    for (const obj of conversationsData) {
      const filteredConversations = obj.conversation.filter(conv => {
        const { prompt, answer } = conv;
        const { name } = obj;
  
        const regex1 = new RegExp(`\\b${queryLower}\\b`, "igu");
        if (
          searchPhraseInPlayerDialogueValue && (
            (phraseComparisonValue === 'similar' && prompt.toLowerCase().includes(queryLower)) ||
            (phraseComparisonValue === 'same' && regex1.test(prompt.toLowerCase()))
          ) ||
          searchPhraseInNpcDialogueValue && (
            (phraseComparisonValue === 'similar' && answer.some(ans => ans.toLowerCase().includes(queryLower))) ||
            (phraseComparisonValue === 'same' && answer.some(ans => regex1.test(ans)))
          ) ||
          searchPhraseInNpcNameValue && (
            (phraseComparisonValue === 'similar' && name.toLowerCase().includes(queryLower)) ||
            (phraseComparisonValue === 'same' && regex1.test(name.toLowerCase()))
          )
        ) {
          return true;
        }
  
        return false;
      });
  
      if (filteredConversations.length === 0) continue;
  
      for (const conv of filteredConversations) {
        const npcBoxContentDiv = document.createElement('div');
        npcBoxContentDiv.classList.add('npcBoxContent', 'clearBoth');
  
        const npcImageDiv = document.createElement('div');
        npcImageDiv.classList.add('npcImage');
        npcImageDiv.style.backgroundImage = `url(../img/npcimg/${obj.name.replace(/ /g, "_")}.png)`;
        npcImageDiv.addEventListener('click', () => showInformation(obj.name));
  
        const npcDialogueDiv = document.createElement('div');
        npcDialogueDiv.classList.add('npcDialogue');
  
        const playerDialogueSpan = document.createElement('span');
        playerDialogueSpan.classList.add('playerDialogueColor');
        playerDialogueSpan.innerText = `Player: ${conv.prompt}`;
  
        npcDialogueDiv.appendChild(playerDialogueSpan);
        
        const regex = new RegExp(`\\b([a-zA-Z0-9'-]*${queryLower}[a-zA-Z0-9'-]*)\\b`, "igu");
  
        conv.answer.forEach(ans => {
          const npcDialogueFormatSpan = document.createElement('span');
          const result = ans.replace(regex, '<span class="npcTargetColor">$1</span>');
          npcDialogueFormatSpan.classList.add('npcDialogueFormat', 'npcDialogueColor');
          npcDialogueFormatSpan.innerHTML = `${obj.name}: ${result}`;
          npcDialogueDiv.appendChild(npcDialogueFormatSpan);
        });
  
        npcBoxContentDiv.appendChild(npcImageDiv);
        npcBoxContentDiv.appendChild(npcDialogueDiv);
  
        outputDiv.appendChild(npcBoxContentDiv);
      }
    }
  }
  
  function showInformation(npcName) {
    npcInfoDiv.innerHTML = '';
    const npc = npcData.find(obj => obj.name.toLowerCase() === npcName.toLowerCase());
    if (!npc) return;
  
    const npcAppearance = document.createElement('div');
    npcAppearance.classList.add('npcAppearance');
    npcAppearance.style.backgroundImage = `url(../img/npcimg/${npc.name.replace(/ /g, "_")}.png)`;
  
    const npcNameEl = document.createElement('div');
    npcNameEl.classList.add('npcName', 'npcNameColor');
    npcNameEl.textContent = npc.name;
  
    const npcMonologues = document.createElement('div');
    npcMonologues.classList.add('npcMonologues');
    for (const dialogue of npc.dialogues) {
      const dialogueEl = document.createElement('p');
      dialogueEl.classList.add('npcMonologueFormat', 'npcMonologueColor');
      dialogueEl.textContent = dialogue;
      npcMonologues.appendChild(dialogueEl);
    }
  
    const npcInformation = document.createElement('div');
    npcInformation.classList.add('npcInformation');
  
    const tibiaStyleTable = document.createElement('table');
    tibiaStyleTable.classList.add('tibiaStyleTable', 'userSelectLock');
  
    const tibiaStyleTbody = document.createElement('tbody');
    tibiaStyleTbody.classList.add('tibiaStyleTbody');
  
    const jobRow = createTableRow('Job', npc.job);
    const raceRow = createTableRow('Race', npc.race);
    const genderRow = createTableRow('Gender', npc.gender);
    const subarea = npc.subarea ? ` -> ${npc.subarea}` : '';
    const locationRow = createTableRow('Location', `${npc.location}${subarea}`);
    const versionRow = createTableRow('Version', npc.version);
  
    tibiaStyleTbody.appendChild(jobRow);
    tibiaStyleTbody.appendChild(raceRow);
    tibiaStyleTbody.appendChild(genderRow);
    tibiaStyleTbody.appendChild(locationRow);
    tibiaStyleTbody.appendChild(versionRow);
  
    tibiaStyleTable.appendChild(tibiaStyleTbody);
    npcInformation.appendChild(tibiaStyleTable);
  
    const npcLocation = document.createElement('div');
    npcLocation.classList.add('npcLocation');
  
    const npcLocationLink = document.createElement('a');
    npcLocationLink.classList.add('tibiaStyleButtonType1');
    npcLocationLink.href = npc.map;
    npcLocationLink.textContent = 'NPC Location';
  
    npcLocation.appendChild(npcLocationLink);
  
    const npcQuests = document.createElement('div');
    npcQuests.classList.add('npcQuests');
    for (const quest of npc.quests) {
      const questLink = document.createElement('a');
      questLink.classList.add('tibiaStyleButtonType1');
      questLink.href = quest['quest-url'];
      questLink.textContent = quest['quest-name'];
      npcQuests.appendChild(questLink);
    }
  
    npcInfoDiv.appendChild(npcAppearance);
    npcInfoDiv.appendChild(npcNameEl);
    npcInfoDiv.appendChild(npcMonologues);
    npcInfoDiv.appendChild(npcInformation);
    npcInfoDiv.appendChild(npcLocation);
    npcInfoDiv.appendChild(npcQuests);
  }
  
  function createTableRow(headerText, cellText) {
    const row = document.createElement('tr');
    row.classList.add('tibiaStyleTr');
  
    const headerCell = document.createElement('td');
    headerCell.classList.add('tibiaStyleTd');
    headerCell.textContent = headerText;
  
    const cell = document.createElement('td');
    cell.classList.add('tibiaStyleTd');
    cell.textContent = cellText;
  
    row.appendChild(headerCell);
    row.appendChild(cell);
  
    return row;
  }
  
  const searchOptionsForm = document.forms.searchOptionsForm;
  const searchPhraseInput = searchOptionsForm.elements.searchPhrase;
  const autoSearchInput = searchOptionsForm.elements.autoSearch;
  const phraseComparisonInputs = searchOptionsForm.elements.phraseComparison;
  const searchPhraseInNpcNameInput = searchOptionsForm.elements.searchPhraseInNpcName;
  const searchPhraseInNpcDialogueInput = searchOptionsForm.elements.searchPhraseInNpcDialogue;
  const searchPhraseInPlayerDialogueInput = searchOptionsForm.elements.searchPhraseInPlayerDialogue;
  
  let searchPhraseValue = '';
  let autoSearchValue = false;
  let phraseComparisonValue = 'similar';
  let searchPhraseInNpcNameValue = true;
  let searchPhraseInNpcDialogueValue = true;
  let searchPhraseInPlayerDialogueValue = true;
  
  function saveFormValues() {
    searchPhraseValue = searchPhraseInput.value;
    autoSearchValue = autoSearchInput.checked;
    phraseComparisonInputs.forEach(radio => {
      if (radio.checked) {
        phraseComparisonValue = radio.value;
      }
    });
    searchPhraseInNpcNameValue = searchPhraseInNpcNameInput.checked;
    searchPhraseInNpcDialogueValue = searchPhraseInNpcDialogueInput.checked;
    searchPhraseInPlayerDialogueValue = searchPhraseInPlayerDialogueInput.checked;
  
    if (searchPhraseValue.length > 3) {
      outputDiv.innerHTML = '';
      searchConversation(searchPhraseValue);
    } else {
      outputDiv.innerHTML = '';
    }
  /*
    console.log('Search phrase:', searchPhraseValue);
    console.log('Auto search:', autoSearchValue);
    console.log('Phrase comparison:', phraseComparisonValue);
    console.log('Search phrase in NPC name:', searchPhraseInNpcNameValue);
    console.log('Search phrase in NPC dialogue:', searchPhraseInNpcDialogueValue);
    console.log('Search phrase in player dialogue:', searchPhraseInPlayerDialogueValue);
  */
  }
  
  searchOptionsForm.addEventListener('submit', event => {
    event.preventDefault();
    saveFormValues();
  });
  
  searchOptionsForm.addEventListener('change', () => {
    if (autoSearchInput.checked) {
      saveFormValues();
    }
  });
  
  searchPhraseInput.addEventListener('input', () => {
    if (autoSearchInput.checked) {
      saveFormValues();
    }
  });