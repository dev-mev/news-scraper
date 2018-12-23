function saveNote() {
  // Grab the id associated with the article from the submit button
  const thisId = $(this).attr("data-id");
  $("#commentsModal").modal("toggle");

  // Run a POST request to change the comment, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/comment/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  });
}

function deleteNote() {
  // Grab the id associated with the article from the submit button
  const thisId = $(this).attr("data-comment-id");
  $("#commentsModal").modal("toggle");

  // Run a POST request to delete the comment
  $.ajax({
    method: "DELETE",
    url: "/comment/" + encodeURIComponent(thisId)
  });
}

// Grab news as a json
$.getJSON("/news", function (data) {
  for (let i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $(".news").append(
      $("<div class='carousel-item" + (i === 0 ? " active" : "") + "'>").append(
        $("<img class='d-block w-100'>").attr("src", data[i].image),
        $("<div class='carousel-caption d-none d-md-block'>").append(
          $("<h3 class='carousel-title'>").append(
            $("<a class='headline' target='_blank'>").attr("href", data[i].url).text(data[i].headline)
          ),
          $("<p class='carousel-text'>").text(data[i].blurb),
          $("<button type='button' class='btn btn-info btn-sm commentBtn'>Comment</button>")
            .attr("data-id", data[i]._id)
        )
      )
    );
  }
  $("#newsCarousel").carousel();
});

$(document).on("click", ".commentBtn", function () {
  $("#comments").empty();
  $("#commentsModal").modal("toggle");

  const thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/news/" + encodeURIComponent(thisId)
  })
    // Add the comment modal to the page
    .then(function (data) {
      $("#comments").append(
        $("<h5>").text(data.headline),
        $("<input id='titleinput' name='title' placeholder='enter title'>"),
        $("<textarea id='bodyinput' name='body'>"),
        $("<div class='modal-footer'>").append(
          $("<button id='saveNote' type='submit' class='btn btn-primary'>Save changes</button>")
            .attr("data-id", data._id)
            .click(saveNote)
        )
      );

      // If there's a comment, add title and body
      if (data.comment) {
        $("#titleinput").val(data.comment.title);
        $("#bodyinput").val(data.comment.body);
        $(".modal-footer").append(
          $("<button id='deleteNote' type='submit' class='btn btn-primary'>Delete Comment</button>")
            .attr("data-comment-id", data.comment._id)
            .click(deleteNote)
        );
      }
    });
});
