let menuData = [];

fetch('./menu.json')
  .then(response => response.json())
  .then(data => {
    menuData = data;
    $(document).ready(function () {
      const menuDiv = document.getElementById('menu');
      menuDiv.innerHTML = '';
      for (const obj of menuData) {
        const menuBoxContentLi = document.createElement('li');
        const menuBoxContentA = document.createElement('a');
        menuBoxContentA.href = obj.url;
        menuBoxContentA.title = obj.title;
        menuBoxContentA.textContent = obj.name;
        menuBoxContentLi.appendChild(menuBoxContentA);
        menuDiv.appendChild(menuBoxContentLi);
      }
    });
  })
  .catch(error => {
    console.error('Error fetching menu:', error);
  });