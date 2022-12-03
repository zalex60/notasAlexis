const helpers = {};

helpers.isAuthenticated = (request, response, next) => {
    if (request.isAuthenticated()) {
        return next();
    } else {
        request.flash('error_msg', 'No autorizado');
        response.redirect('/users/singin');
    }
}

module.exports = helpers;