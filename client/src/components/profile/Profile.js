import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getProfileById } from '../../actions/profile';
import Spinner from '../layout/Spinner';
import ProfileTop from './ProfileTop';
import ProfileAbout from './ProfileAbout';
import ProfileExperience from './ProfileExperience';
import ProfileEducation from './ProfileEducation';
import ProfileGithub from './ProfileGithub';

const Profile = ({
  match,
  getProfileById,
  profile: { profile, loading },
  auth
}) => {
  useEffect(() => {
    getProfileById(match.params.id);
  }, [getProfileById, match.params.id]);

  const renderExperience = () => {
    if (profile.experience.length > 0) {
      return profile.experience.map(exp => (
        <ProfileExperience key={exp._id} experience={exp} />
      ));
    } else {
      return <h4>No experience credentials</h4>;
    }
  };

  const renderEducation = () => {
    if (profile.education.length > 0) {
      return profile.education.map(edu => (
        <ProfileEducation key={edu._id} education={edu} />
      ));
    } else {
      return <h4>No education credentials</h4>;
    }
  };

  const renderGithubRepos = () => {
    if (profile.githubusername) {
      return <ProfileGithub username={profile.githubusername} />;
    }

    return null;
  };

  const renderContent = () => {
    if (profile === null || loading) {
      return <Spinner />;
    }

    return (
      <>
        <Link to='/profiles' className='btn btn-light'>
          Back to profiles
        </Link>
        {auth.isAuthenticated &&
          auth.loading === false &&
          auth.user._id === profile.user._id && (
            <Link to='/edit-profile' className='btn btn-dark'>
              Edit Profile
            </Link>
          )}
        <div className='profile-grid my-1'>
          <ProfileTop profile={profile} />
          <ProfileAbout profile={profile} />
          <div className='profile-exp bg-white p-2'>
            <h2 className='text-primary'>Experience</h2>
            {renderExperience()}
          </div>
          <div className='profile-edu bg-white p-2'>
            <h2 className='text-primary'>Education</h2>
            {renderEducation()}
          </div>
          {renderGithubRepos()}
        </div>
      </>
    );
  };

  return <>{renderContent()}</>;
};

Profile.propTypes = {
  getProfileById: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  getProfileById: id => dispatch(getProfileById(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
