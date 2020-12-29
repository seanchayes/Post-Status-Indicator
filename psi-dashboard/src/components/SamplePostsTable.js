import React, {useContext} from 'react';
import Post from "@Components/Post";
import {PostStatusIndicatorContext} from "@Contexts/PostStatusIndicatorContext";
import { titleCase } from '@Utils/utils';

function SamplePostsTable(props) {
  const { posts } = props;
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;

  const BreadCrumbs = () => {
    return Object.keys(psi_config.stati).map( (status, index) => {
      const colors = settings['colors'];
      const chosenColor = colors.find(({name}) => name === status); // See if we have a custom color for this status
      let color = 'transparent';

      if(chosenColor) {
        color = chosenColor.value
      }
      const statusStyle = {
        backgroundColor: color,
        marginRight: "0.5rem"
      };
      return (
        <li key={`${index}-${status}`} className={status} style={statusStyle}>
          <a href={'#'}>{titleCase(status)}</a>
        </li>
      )
    });
  }
  return (
    <>
      {settings.color_post_labels && (
        <ul className="subsubsub" style={{marginBottom: "0.5rem"}}>
          <BreadCrumbs />
        </ul>
      )
      }
      <table className={"wp-list-table widefat fixed striped table-view-list posts"}>
        <thead>
        <tr>
          <td id="cb" className="manage-column column-cb check-column"><label className="screen-reader-text"
                                                                              htmlFor="cb-select-all-1">Select
            All</label><input id="cb-select-all-1" type="checkbox" /></td>
          <th scope="col" id="title" className="manage-column column-title column-primary sortable desc">Title</th>
          <th scope="col" id="author" className="manage-column column-author">Author</th>
          <th scope="col" id="categories" className="manage-column column-categories">Categories</th>
          <th scope="col" id="tags" className="manage-column column-tags">Tags</th>
          <th scope="col" id="comments" className="manage-column column-comments num sortable desc">Comments</th>
          <th scope="col" id="date" className="manage-column column-date sortable asc">Date</th>
        </tr>
        </thead>
        <tbody>
        {posts.map(post => (
          <Post key={post.ID} post={post} />
        ))}
        </tbody>
      </table>
    </>
  );
}

export default SamplePostsTable;
