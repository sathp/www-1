const expect = require('chai').expect,
      path = require('path'),
      _ = require('underscore'),
      gravatar = require('gravatar');

exports = module.exports = function (config) {
  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    if (!(metadata.course)) {
      return done();
    }
    _.each(metadata.course.staff, function (staff) {
      var slug = staff.email.split('@')[0];
      var staffPath = path.join('people', slug, 'index.html');
      if (!(staffPath in files)) {
        return;
      }
      var staffBio = files[staffPath];
      if (files[staffPath].contents.toString().trim().length === 0) {
        delete(files[staffPath]);
      } else {
        staff.link = files[staffPath];
      }
      staff.photo = gravatar.url(staff.email, {
        s: '460',
        d: encodeURI('https://cs125.cs.illinois.edu/img/logos/cs125-460x460.png'),
      });
    });
    metadata.course.staffSorted = _.chain(metadata.course.staff)
      .sortBy(function (staff) {
        return staff.name;
      })
      .sortBy(function (staff) {
        if (staff.role === 'Instructor') {
          return 0;
        } else if (staff.role === 'TA') {
          return 1;
        } else if (staff.role === 'Doyen') {
          return 2;
        }
        return Infinity;
      });
    return done();
  }
};