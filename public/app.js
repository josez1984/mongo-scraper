$(document).ready(function() {
  $(".collapse").collapse();

  $("#accordionExample").on("click", ".btn-new-message", function(e) {
    e.preventDefault();
    var articleId = $(this).attr("data-article-id");
    var userName = $(`#input-username-${articleId}`).val();
    if(!userName) {
      userName = 'Annonymos';
    }
    console.log(userName);
    var message = $(`#textarea-message-${articleId}`).val();
    if(!message) {
      return alert("Please enter a message.");
    }
    console.log(message);
    $.ajax({
      method: 'POST',
      url: '/comments',
      data: {
        userName: userName,
        message: message,
        articleId: articleId
      }
    }).then(function(res, status, obj) {
      console.log(res);
      console.log(status);
      console.log(obj);
      $(`#ul-comments-${articleId}`).append(`
        <li class="list-group-item">
          <h6>${res.userName}</h6>
          <p>${res.message}</p>
          <button data-comment-id="${res.id}" type="button" class="close delete-comment" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </li>
      `);
    }).catch(function(err) {
      console.log(err);
    });
  })
})