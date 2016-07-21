'use strict';

var util = require('../../server/boot/util');

module.exports = function (Period) {

  Period.validatesPresenceOf('propertyId');
  Period.validate('start', util.checkDates, {
    message: 'Start date is after end date.'
  });
  Period.validateAsync('start', _overlapValidator, {
    message: 'Property already has period in these dates.'
  });

  ////-----

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

    Period.app.models.period.find(criteria, function (error, periods) {

      if (periods.length > 0) {
        err();
      }

      return done();

    });

  }

};
