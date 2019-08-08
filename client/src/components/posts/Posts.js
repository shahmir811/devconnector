import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getPosts } from '../../actions/post';
import Spinner from '../layout/Spinner';
import PostItem from './PostItem';
import PostForm from './PostForm';

const Posts = ({ getPosts, post: { posts, loading } }) => {
  useEffect(() => {
    getPosts();
  }, [getPosts]);

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    return (
      <>
        <h1 className='large text-primary'>Posts</h1>
        <p className='lead'>
          <i className='fas fa-user' /> Welcome to the community!
        </p>
        <PostForm />
        {posts.map(post => (
          <PostItem key={post._id} post={post} />
        ))}
      </>
    );
  };

  return <>{renderContent()}</>;
};

Posts.propTypes = {
  getPosts: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  post: state.post
});

const mapDispatchToProps = dispatch => ({
  getPosts: () => dispatch(getPosts())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Posts);
