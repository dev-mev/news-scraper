// Grab the news as a json
$.getJSON("/news", function (data) {
  for (let i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $(".news").append(
      $("<div class='carousel-item" + (i === 0 ? " active" : "") + "'>"),
      $("<img class='d-block w-100'>").attr("src", data[i].image),
      $("<div class='carousel-caption d-none d-md-block'>"),
      $("<h5 id='carousel-title'>").attr("data-id", data[i]._id),
      $("<a target='_blank'>").attr("href", data[i].url).text(data[i].headline),
      $("<p id='carousel-text'>").text(data[i].blurb),
      $("<button type='button' class='btn btn-info btn-sm commentBtn'>Comment</button>")
        .attr("data-id", data[i]._id)
    );
  }
  $("#newsCarousel").carousel();
});

$(document).on("click", ".commentBtn", function () {
  $("#comments").empty();
  $("#commentsModal").modal("toggle");

  const thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/news/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      $("#comments").append(
        $("<h2>").text(data.headline),
        $("<input id='titleinput' name='title' placeholder='enter title'>"),
        $("<textarea id='bodyinput' name='body'>"),
        $("<div class='modal-footer'>"),
        $("<button id='savenote' type='submit' class='btn btn-primary'>Save changes</button>")
          .attr("data-id", data._id)
          .click(saveNote)
      );

      // If there's a note in the article
      if (data.comment) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.comment.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.comment.body);
      }
    });
});

function saveNote() {
  // Grab the id associated with the article from the submit button
  const thisId = $(this).attr("data-id");
  console.log("BUTTON!");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/news/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#comments").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
}
