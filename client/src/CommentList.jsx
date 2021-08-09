import React from "react";

const renderCommentContent = (comment) => {
  switch (comment.status) {
    case "pending":
      return "This comment is awaiting moderation";

    case "rejected":
      return "This comment has been rejected.";

    case "approved":
      return comment.content;

    default: 
      return comment.content
  }
};

const CommentList = ({ comments }) => {
  const renderedComments = comments.map((comment) => {
    return <li key={comment.id}>{renderCommentContent(comment)}</li>;
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
