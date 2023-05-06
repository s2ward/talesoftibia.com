function readygo() {
  $(".custom-select").each(function () {
    var $this = $(this);
    var select = $this.find("select");
    var options = select.find("option");
    var selected = options.filter(":selected");
    var divSelected = $("<div>", {
      class: "select-selected",
      html: selected.html(),
    });
    var divItems = $("<div>", {
      class: "select-items select-hide",
    });
    options.each(function () {
      var option = $(this);
      var divItem = $("<div>", {
        html: option.html(),
      });
      divItem.on("click", function () {
        select.val(option.val());
        divSelected.html(option.html());
        divItem.siblings().removeClass("same-as-selected");
        divItem.addClass("same-as-selected");
        divSelected.click();
      });
      divItems.append(divItem);
    });
    $this.append(divSelected).append(divItems);
    divSelected.on("click", function (event) {
      event.stopPropagation();
      closeAllSelect(divSelected);
      divItems.toggleClass("select-hide");
      $(this).toggleClass("select-arrow-active");
    });
  });
}

function closeAllSelect(current) {
  $(".select-items").not(current.next()).addClass("select-hide");
  $(".select-selected").not(current).removeClass("select-arrow-active");
}

$(document).on("click", function () {
  closeAllSelect($());
});