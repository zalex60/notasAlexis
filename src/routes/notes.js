const express = require('express');
const router = express.Router();

const Nota = require('../model/Notes');
const { isAuthenticated } = require('../helpers/auth');
const faker = require('faker');

router.get('/notes/search', isAuthenticated, (req, res) => {
    res.render('notes/buscar-notas');
});

router.post('/notes/search', isAuthenticated, async (req, res) => {
    const { search } = req.body;
    const { _id } = req.user;

    await Nota.find({ usuario_id: _id, $text: { $search: search, $caseSensitive: false } })
        .sort({ fecha: 'desc' })
        .exec((err, notes) => {
            res.render('notes/buscar-notas', {
                notes,
                search
            })
        })
});

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/nueva-nota');
});

router.get('/notes/edit:id', isAuthenticated, async (req, res) => {
    try {
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1, len);

        const nota = await Nota.findById(_id);
        _id = nota._id;
        titulo = nota.titulo;
        descripcion = nota.descripcion
        res.render('notes/editar-nota', { _id, titulo, descripcion });
    } catch (err) {
        res.send(404);
        res.redirect('/error');
    }
});

router.get('/notes', isAuthenticated, async (req, res) => {
    res.redirect('/notes/1');
    await Nota.find({ usuario_id: req.user._id }).lean().sort({ fecha: 'desc' })
        .then((notas) => {
            res.render('notes/consulta-notas', { notas });
        })
        .catch(err => {
            console.log(err)
            res.redirect('/error')
        });
});

router.put('/notes/editar-nota/:id', isAuthenticated, async (req, res) => {
    const { titulo, descripcion } = req.body;
    const _id = req.params.id;
    const errores = [];

    if (!titulo) {
        errores.push({ text: 'Por favor insertar el nombre' })
    }

    if (!descripcion) {
        errores.push({ text: 'Por favor insertar la descripción' })
    }

    if (errores.length > 0) {
        res.render('notes/editar-nota', {
            errores,
            titulo,
            descripcion,
            _id
        });
    } else {
        await Nota.findByIdAndUpdate(_id, { titulo, descripcion })
            .then(() => {
                req.flash('success_msg', 'Nota actualizada correctamente');
                res.redirect('/notes');
            })
            .catch(error => {
                console.log(err);
                res.redirect('/error')
            });
    }
});

router.get('/notes/delete:id', isAuthenticated, async (req, res) => {
    try {
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1, len);

        const nota = await Nota.findByIdAndDelete(_id);
        req.flash('success_msg', 'Nota eliminada correctamente');
        res.redirect('/notes/');
    } catch (err) {
        res.send(404);
    }
});

router.post('/notes/nueva-nota', isAuthenticated, async (req, res) => {
    const { titulo, descripcion } = req.body;
    const errores = [];

    if (!titulo) {
        errores.push({ text: 'Por favor insertar el nombre' })
    }

    if (!descripcion) {
        errores.push({ text: 'Por favor insertar la descripción' })
    }

    if (errores.length > 0) {
        res.render('notes/nueva-nota', {
            errores,
            titulo,
            descripcion
        });
    } else {
        const nuevaNota = new Nota({ titulo, descripcion });
        nuevaNota.usuario_id = req.user._id
        await nuevaNota.save()
            .then(() => {
                req.flash('success_msg', 'Nota agregada de manera exitosa');
                res.redirect('/notes');
            })
            .catch(err => {
                console.log(err);
                res.redirect('/error')
            })
        //console.log(nuevaNota)
        //res.send('ok')
    }
});

router.get('/generate-fake-data', isAuthenticated, async (req, res) => {
    for (let i = 0; i < 30; i++) {
        const newNote = new Nota();

        newNote.titulo = faker.random.word();
        newNote.descripcion = faker.random.words();
        newNote.usuario_id = req.user._id
        await newNote.save();
    }
    res.redirect('/notes')
});

router.get('/notes/:page', isAuthenticated, async (req, res) => {
    let perPage = 6;
    let page = req.params.page || 1;
    let numNota = (perPage * page) - perPage;

    await Nota.find({ usuario_id: req.user._id })
        .sort({ date: 'desc' })
        .skip(numNota)
        .limit(perPage)
        .exec((err, notas) => {
            Nota.countDocuments({ usuario_id: req.user._id }, (err, total) => {
                if (err)
                    return next(err);
                if (total == 0)
                    pages = null;
                else
                    pages = Math.ceil(total / perPage);

                res.render('notes/consulta-notas', {
                    notas,
                    current: page,
                    pages: pages
                });
            });
        });
});

module.exports = router;