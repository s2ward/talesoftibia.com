fetch('./menu.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Error fetching menu');
    }
    return response.json();
  })
  .then(data => {
    $(document).ready(function () {
      const menuDiv = $('#menu');
      const menuItems = $(`
        ${data.map(obj => `
          <li>
            <a href="${obj.url}" title="${obj.title}">${obj.name}</a>
          </li>
        `).join('')}
      `);
      
      menuDiv.empty().html(menuItems);
    });
  })
  .catch(error => {
    console.error('Error fetching menu:', error);
  });

  $(document).ready(() => {
    const menuElement = $('#menu');
    const menuButtonElement = $('#menu-button');

    const handleWindowResize = () => {
        if ($(window).width() > 900) {
            menuElement.css({
                display: '',
            });
        }
    };

    const handleToggleButtonMenu = () => {
        if (menuElement.css('display') === 'none') {
            menuElement.css({
                display: 'block'
            });
        } else {
            menuElement.css('display', 'none');
        }
    };

    menuButtonElement.click((event) => {
        handleToggleButtonMenu();
        event.stopPropagation();
    });

    $(window).resize(handleWindowResize);
});