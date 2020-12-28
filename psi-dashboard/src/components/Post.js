import React, {useContext} from 'react';
import {PostStatusIndicatorContext} from "../contexts/PostStatusIndicatorContext";
import { titleCase } from "@Utils/utils";

const Post = (props) => {
  const { post } = props;
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;
  const colors = settings['colors'] || [];
  const chosenColor = colors.find(({name}) => name === post.post_status);
  let color;
  if(chosenColor) {
    color = chosenColor.value
  }
  const statusStyle = {
    backgroundColor: color,
  };
  const StateStyle = {
    fontWeight: 600,
    color: "#555"
  }
  return (
    <tr id={`post-${post.ID}`} className={`status-${post.post_status}`}>
      <th className={"check-column"} style={statusStyle}>
        <input type={"checkbox"}/>
      </th>
      <td className="post">
        <a className="row-title" href="#">
          {post.post_title}</a> <span style={StateStyle}> - {titleCase(post.post_status)}</span>
      </td>
        <td>Post Author</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
  );
}

export default Post;
