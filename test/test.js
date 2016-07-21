var should = require('chai').should();
var request = require('supertest');
var async = require('async');
var app = require('../server/server');

after(function (done) {
  return cleanModels(done);
});

describe('API', function () {
  var property;

  describe('properties', function () {

    it('create new property', function (done) {

      addItem('/api/properties', {
        address: 'Avd. Neptuno 22, 25'
      }, 200, function (err, res) {
        if (res.body && res.body.id) {
          property = res.body.id;
        }

        return done(err);

      });

    });

  });

  describe('period', function () {

    it('add period to a property', function (done) {

      addItem('/api/properties/' + property + '/periods', {
        start: '2016-06-01',
        end: '2017-02-01'
      }, 200, function (err) {

        return done(err);

      });

    });

    it('expect error creating period after end date', function (done) {

      addItem('/api/properties/' + property + '/periods', {
        start: '2017-06-01',
        end: '2016-02-01'
      }, 422, function (err) {

        return done(err);

      });

    });

    it('expect error creating period inside other period', function (done) {

      addItem('/api/properties/' + property + '/periods', {
        start: '2016-07-01',
        end: '2016-08-01'
      }, 422, function (err) {

        return done(err);

      });

    });

  });

  describe('booking', function () {

    it('add valid dates to a property', function (done) {

      var validDates = [
        {start: '2016-06-01', end: '2016-07-01'},
        {start: '2016-07-07', end: '2016-07-14'},
        {start: '2016-10-25', end: '2016-12-24'}
      ];

      async.each(validDates, function (dates, callback) {

        addItem('/api/properties/' + property + '/bookings', {
          start: dates.start,
          end: dates.end
        }, 200, function (err) {

          return callback(err);

        });

      }, function (err) {

        return done(err);

      });

    });

    it('error adding overlap date to a property', function (done) {

      addItem('/api/properties/' + property + '/bookings', {
        start: '2016-07-07',
        end: '2016-07-09'
      }, 422, function (err) {

        return done(err);

      });

    });

    it('error adding date out of period to a property', function (done) {

      addItem('/api/properties/' + property + '/bookings', {
        start: '2016-02-01',
        end: '2016-02-015'
      }, 422, function (err) {

        return done(err);

      });

    });

  });

});

////----------

/**
 * Clean Models
 * @param cb
 */

function cleanModels(cb) {
  async.parallel([
    function (done) {

      app.models.property.destroyAll(function () {
        return done();
      });

    }, function (done) {

      app.models.booking.destroyAll(function () {
        return done();
      });

    }, function (done) {

      app.models.period.destroyAll(function () {
        return done();
      });

    }], function (err) {

    return cb(err);

  });
}

/**
 * Create a item in the app
 *
 * @param url
 * @param data
 * @param callback
 */
function addItem(url, data, status, callback) {
  return request(app)
    .post(url)
    .expect(status || 200)
    .send(data)
    .expect('Content-Type', /json/)
    .end(callback);
}
