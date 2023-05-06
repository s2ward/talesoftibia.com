$(document).ready(function () {
  const $articlesDiv = $('#articles');

  $.getJSON('./articles.json', function (data) {
    $articlesDiv.empty();

    $.each(data.sections, function (_, section) {
      const $articleBoxContentHeader = $('<header>').addClass('talesoftibia').text(section.header);
      const $articleBoxContentDiv = $('<div>').addClass('scroll-box');

      $.each(section.articles, function (_, article) {
        const $articleBoxContentDiv1 = $('<div>').addClass('box');
        const $articleBoxContentA = $('<a>').attr({ href: article.url, target: '_blank' });
        const $articleBoxContentDiv2 = $('<div>').addClass('article-image');
        let $articleBoxContentImg = null;
        if (article.hasOwnProperty('video')) {
          $articleBoxContentImg = $('<iframe>').attr({ src: article.video, frameborder: "0", allowfullscreen: true }).css({ width: '128px', height: '128px' });
        } else if (article.hasOwnProperty('image')) {
          $articleBoxContentImg = $('<img>').attr({ src: article.image, alt: article.title }).css({ width: '128px', height: '128px' });
        }
        const $articleBoxContentH3 = $('<h3>').text(article.title);
        const $articleBoxContentP = $('<p>').text(article.author);

        $articleBoxContentDiv2.append($articleBoxContentImg, $articleBoxContentH3, $articleBoxContentP);
        $articleBoxContentA.append($articleBoxContentDiv2);
        $articleBoxContentDiv1.append($articleBoxContentA);
        $articleBoxContentDiv.append($articleBoxContentDiv1);
      });

      $articlesDiv.append($articleBoxContentHeader, $articleBoxContentDiv);
    });
  })
    .fail(function (error) {
      console.error('Error fetching articles:', error);
    });
});