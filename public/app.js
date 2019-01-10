$(document).ready(function() {
  $(".collapse").collapse();
  
  $("#accordionExample").on("click", ".btn-delete-comment", function(e) {
    e.preventDefault();
    let commentId = $(this).attr("data-comment-id");
    let articleId = $(this).attr("data-article-id");
    $.ajax({
      method: "DELETE",
      url: '/comments',
      data: {
        commentId: commentId,
        articleId: articleId
      }
    }).then((res)=>{
      if(res.nModified == 1) {
        $(`#li-comment-${commentId}`).remove();
      }
    }).catch((e)=>{
      alert("There was a DB error while removing the comment.");
    });
  });

  $("#accordionExample").on("click", ".btn-new-message", function(e) {
    e.preventDefault();
    var articleId = $(this).attr("data-article-id");
    var userName = $(`#input-username-${articleId}`).val();
    if(!userName) {
      userName = 'Annonymos';
    }
    var message = $(`#textarea-message-${articleId}`).val();
    if(!message) {
      return alert("Please enter a message.");
    }
    $.ajax({
      method: 'POST',
      url: '/comments',
      data: {
        userName: userName,
        message: message,
        articleId: articleId
      }
    }).then(function(res, status, obj) {      
      $(`#ul-comments-${articleId}`).append(`
        <li id="li-comment-${res.id}" class="list-group-item">
          <h6>${res.userName}</h6>
          <p>${res.message}</p>
          <button data-article-id="${res.articleId}" data-comment-id="${res.id}" type="button" class="close btn-delete-comment" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </li>
      `);

      $(`#input-username-${articleId}`).val('');
      $(`#textarea-message-${articleId}`).val('');
    }).catch(function(err) {
      alert("There was an error posting the comment");
    });
  })
})