import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getPost } from '../../actions/post';
import Spinner from '../layout/Spinner';
import PostItem from '../posts/PostItem';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const Post = ({ getPost, post: { post, loading }, match }) => {
  useEffect(() => {
    getPost(match.params.id);
  }, [getPost, match.params.id]);

  const renderContent = () => {
    if (post === null || loading) {
      return <Spinner />;
    }

    return (
      <>
        <Link to='/posts' className='btn'>
          Back to posts
        </Link>
        <PostItem post={post} showActions={false} />
        <CommentForm postId={post._id} />
        {post.comments.map(comment => (
          <CommentItem key={comment._id} comment={comment} postId={post._id} />
        ))}
      </>
    );
  };

  return <>{renderContent()}</>;
};

Post.propTypes = {
  getPost: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  post: state.post
});

const mapDispatchToProps = dispatch => ({
  getPost: id => dispatch(getPost(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Post);
