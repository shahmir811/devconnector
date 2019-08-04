import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Alert = props => {
  function showError() {
    const { alerts } = props;

    if (alerts !== null && alerts.length > 0) {
      return alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
          {alert.msg}
        </div>
      ));
    }
  }

  return <>{showError()}</>;
};

Alert.propTypes = {
  alerts: PropTypes.array.isRequired
};

const mapStateToProps = state => {
  return {
    alerts: state.alert
  };
};

export default connect(mapStateToProps)(Alert);
