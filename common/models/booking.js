'use strict';

var util = require('../../server/boot/util');

module.exports = function (Booking) {

  Booking.validatesPresenceOf('propertyId');
  Booking.validate('start', util.checkDates, {
    message: 'Start date is after end date.'
  });
  Booking.validateAsync('start', _validPeriodValidator, {
    message: 'Property is not available in this period'
  });
  Booking.validateAsync('start', _overlapValidator, {
    message: 'Property booked in this period'
  });

  ////-----

  /**
   * Check valid booking period for the property
   *
   * @param err
   * @param done
   * @private
   */

  function _validPeriodValidator(err, done) {

    var criteria = {
      where: {
        and: [{
          propertyId: this.propertyId
        }, {
          start: {
            lte: this.start
          }
        }, {
          end: {
            gte: this.end
          }
        }]
      }
    };

    Booking.app.models.period.find(criteria, function (error, periods) {

      if (periods.length == 0) {
        err();
      }

      return done();

    });

  }

  /**
   * Check overlap period for the property
   *
   * @param err
   * @param done
   * @private
   */

  function _overlapValidator(err, done) {

    var criteria = {
      where: {
        and: [{
          propertyId: this.propertyId
        }, {
          or: [{
            start: {
              between: [this.start, this.end]
            }
          }, {
            end: {between: [this.start, this.end]}
          }, {
            and: [{
              end: {
                gte: this.end
              }
            }, {
              start: {
                lte: this.start
              }
            }]
          }]
        }]
      }
    };

    Booking.app.models.booking.find(criteria, function (error, bookings) {

      if (bookings.length > 0) {
        err();
      }

      return done();

    });

  }

};
