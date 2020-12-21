import React, {useContext} from 'react';
import Post from "./Post";
import {PostStatusIndicatorContext} from "../contexts/PostStatusIndicatorContext";
import { titleCase } from '../utils';

function SamplePostsTable(props) {
  const { posts } = props;
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;

  const BreadCrumbs = () => { // check settings to see if we should color these
    return Object.keys(psi_config.stati).map( (status, index) => {
    	if ('publish' !== status) { // determine whether we need this - perhaps someone wants do color published items
        const colors = settings['colors'];
        const c = colors.find(({name}) => name === status);
        let color;
        if(c) {
          color = c.value
        }
        if (undefined !== color) {
          const statusStyle = {
            backgroundColor: color,
            padding: "0.5rem",
            marginRight: "0.5rem"
          };
          const anchorStyle = {
            color: "#fff"
          };
          return (
            <li key={`${index}-${status}`} className={status} style={statusStyle}>
              <a href={'#'} style={anchorStyle}>{titleCase(status)}</a>
            </li>
          )
        }
      }
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
          <th scope="col" id="title" className="manage-column column-title column-primary sortable desc"><a
            href="http://trunk.wordpress.test/wp-admin/edit.php?orderby=title&amp;order=asc"><span>Title</span><span
            className="sorting-indicator"></span></a></th>
          <th scope="col" id="author" className="manage-column column-author">Author</th>
          <th scope="col" id="categories" className="manage-column column-categories">Categories</th>
          <th scope="col" id="tags" className="manage-column column-tags">Tags</th>
          <th scope="col" id="comments" className="manage-column column-comments num sortable desc"><a
            href="http://trunk.wordpress.test/wp-admin/edit.php?orderby=comment_count&amp;order=asc"><span><span
            className="vers comment-grey-bubble" title="Comments"><span
            className="screen-reader-text">Comments</span></span></span><span className="sorting-indicator"></span></a>
          </th>
          <th scope="col" id="date" className="manage-column column-date sortable asc"><a
            href="http://trunk.wordpress.test/wp-admin/edit.php?orderby=date&amp;order=desc"><span>Date</span><span
            className="sorting-indicator"></span></a></th>
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
