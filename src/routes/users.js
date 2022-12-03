const express = require('express');
const router = express.Router();
const passport = require('passport');

const Usuario = require('../model/Usuarios')

router.get('/users/singin', (request, response) => {
    response.render('users/singin');
});

router.post('/users/singin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/singin',
    failureFlash: true
}));

router.get('/users/singup', (request, response) => {
    response.render('users/singup');
});

router.get('/users/logout', (request, response, next) => {
    request.logout(function (err) {
        if (err) { return next(err); }
        response.redirect('/');
    });
});

router.post('/users/singup', async (request, response) => {
    const { nombre, email, password, password_confirm } = request.body;
    const errores = [];
    if (!nombre) errores.push({ text: 'Por favor inserta el nombre' });
    if (!email) errores.push({ text: 'Por favor inserta el email' });
    if (!password) errores.push({ text: 'Por favor inserta el password' });
    if (password < 4) errores.push({ text: 'La contraseña debe tener al menos 4 caracteres' });
    if (password != password_confirm) errores.push({ text: 'El password no coinciden' });

    if (errores.length > 0) {
        response.render('users/singup', { errores, nombre, email, password, password_confirm });
    } else {
        const emailUser = await Usuario.findOne({ email: email });
        if (emailUser) {
            errores.push({ text: 'El email ya esta en uso, por favor elija uno nuevo' });
            response.render('users/singup', { errores, nombre, email, password, password_confirm });
        } else {
            const newUser = new Usuario({
                nombre, email, password
            });
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save()
                .then(() => {
                    request.flash('success_msg', 'Usuario registrado de manera exitosa');
                    response.redirect('/users/singin');
                })
                .catch((error) => {
                    console.log(error);
                    response.redirect('/error')
                })
        }
    }
});

module.exports = router;