import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getCurrentProfile, deleteAccount } from '../../actions/profile';
import Spinner from '../layout/Spinner';
import DashboardActions from './DashboardActions';
import Experience from './Experience';
import Education from './Education';

const Dashboard = ({
  getCurrentProfile,
  auth: { user },
  profile: { profile, loading },
  deleteAccount
}) => {
  useEffect(() => {
    getCurrentProfile();
  }, [getCurrentProfile]);

  function renderComponent() {
    if (loading && profile === null) {
      return <Spinner />;
    } else {
      return (
        <>
          <h1 className='large text-primary'>Dashboard</h1>
          <p className='lead'>
            <i className='fas fa-user' /> Welcome {user && user.name}
          </p>
          {profile !== null ? (
            <>
              <DashboardActions />
              <Experience experience={profile.experience} />
              <Education education={profile.education} />

              <div className='my-2'>
                <button
                  className='btn btn-danger'
                  onClick={() => deleteAccount()}
                >
                  <i className='fa fa-user-minus' /> Delete My Account
                </button>
              </div>
            </>
          ) : (
            <>
              <p>You have not setup your profile yet, please add some info</p>
              <Link to='/create-profile' className='btn btn-primary my-1'>
                Create Profile
              </Link>
            </>
          )}
        </>
      );
    }
  }

  return <div>{renderComponent()}</div>;
};

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  deleteAccount: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  profile: state.profile
});

const mapDispatchToProps = dispatch => ({
  getCurrentProfile: () => dispatch(getCurrentProfile()),
  deleteAccount: () => dispatch(deleteAccount())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
