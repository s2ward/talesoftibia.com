fetch('./achievements.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Error fetching achievements');
    }
    return response.json();
  })
  .then(data => {
    $(document).ready(function () {
      const achievementsTable = $('#achievements-table').find('tbody');
      const achievementsTableHtml = $(`
        ${data.map(achievement => `
          <tr>
            <td><a href="${achievement.url}" target="_blank" title="${achievement.title}">${achievement.title}</a></td>
            <td><img src="img/grade${achievement.grade}.gif"></td>
            <td class="gradePoints">${achievement.points}</td>
            <td>${achievement.description}</td>
            <td>${achievement.spoiler}</td>
          </tr>
        `).join('')}
      `);
      
      achievementsTable.empty().html(achievementsTableHtml);
    });
  })
  .catch(error => {
    console.error('Error fetching achievements:', error);
  });