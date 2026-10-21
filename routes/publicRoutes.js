const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Vista de la Landing Page
router.get('/', async (req, res) => {
    try {
        const settingsRows = await db.prepare('SELECT key, value FROM site_settings').all();
        const settings = {};
        settingsRows.forEach(r => { settings[r.key] = r.value; });

        const requirementTypes = await db.prepare('SELECT * FROM requirement_types WHERE is_active = 1 ORDER BY id ASC').all();
        const specialties = await db.prepare('SELECT * FROM specialties WHERE is_active = 1 ORDER BY id ASC').all();
        const projects = await db.prepare('SELECT * FROM projects WHERE is_active = 1 ORDER BY id DESC').all();
        const testimonials = await db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY id ASC').all();

        res.render('index', {
            settings,
            requirementTypes: requirementTypes || [],
            specialties: specialties || [],
            projects: projects || [],
            testimonials: testimonials || [],
            sent: req.query.sent === 'true'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error cargando la landing');
    }
});

// Captura de Leads
router.post('/contacto', async (req, res) => {
    try {
        const { name, company, phone, email, requirement_type, message } = req.body;

        if (!name || !phone || !email || !requirement_type) {
            return res.status(400).send('Faltan campos obligatorios');
        }

        await db.prepare(`
            INSERT INTO leads (name, company, phone, email, requirement_type, message, status)
            VALUES (?, ?, ?, ?, ?, ?, 'nuevo')
        `).run(
            name.trim(),
            company ? company.trim() : null,
            phone.trim(),
            email.trim(),
            requirement_type.trim(),
            message ? message.trim() : null
        );

        res.redirect('/?sent=true#contacto');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registrando solicitud');
    }
});

module.exports = router;