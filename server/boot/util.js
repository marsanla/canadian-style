'use strict';

module.exports = {
  /**
   * Check if start date is before end date
   *
   * @param err
   */

  checkDates: function checkDates(err) {
    var start = new Date(this.start);
    var end = new Date(this.end);

    if (start.getTime() > end.getTime()) {
      return err();
    }
  }
};
