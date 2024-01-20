fetch('./articles.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Error fetching articles');
    }
    return response.json();
  })
  .then(data => {
    $(document).ready(function () {
      const articlesDiv = $('#articles');
      const articlesDivHTML = $(`
        ${data.sections.map(section => `
          <header class="talesoftibia">${section.header}</header>
          <div class="scroll-box">
            ${section.articles.map(article => `
              <div class="box">
                <a href="${article.url}" target="_blank">
                  <div class="article-image">
                  ${Object.prototype.hasOwnProperty.call(article, 'video') ? `<iframe src="${article.video}" frameborder="0" allowfullscreen="true" style="width: 128px; height: 128px;"></iframe>` : `<img src="${article.image}" alt="${article.title}" style="width: 128px; height: 128px;"></img>`}
                    <h3>${article.title}</h3>
                    <p>${article.author}</p>
                  </div>
                </a>
              </div>
            `).join('')}
          </div>
        `).join('')}
      `);

      articlesDiv.empty().html(articlesDivHTML);
    });
  })
  .catch(error => {
    console.error('Error fetching articles:', error);
  });
// dummy
