$(document).ready(function () {
  const $achievementsTable = $('#achievements-table');

  $.getJSON('./achievements.json')
    .done(function (data) {
      $achievementsTable.find('tbody').empty();

      // Dodaj wiersze z danymi
      data.forEach(function (achievement) {
        const $row = $('<tr>');

        const $titleCell = $('<td>');
        const $titleA = $('<a>').attr({ href: achievement.url, target: '_blank', title: achievement.title }).text(achievement.title);
        $titleCell.append($titleA);
        $row.append($titleCell);

        const $gradeCell = $('<td>');
        const $imgimg = $('<img>').attr({ src: `img/grade${achievement.grade}.gif` });
        $gradeCell.append($imgimg);
        $row.append($gradeCell);

        const $pointsCell = $('<td>').addClass('gradePoints').text(achievement.points);
        $row.append($pointsCell);

        const $descriptionCell = $('<td>').text(achievement.description);
        $row.append($descriptionCell);

        const $spoilerCell = $('<td>').text(achievement.spoiler);
        $row.append($spoilerCell);

        $achievementsTable.find('tbody').append($row);
      });
    })
    .fail(function (error) {
      console.error('Error fetching achievements:', error);
    });
});