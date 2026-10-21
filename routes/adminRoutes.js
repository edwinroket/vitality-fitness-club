const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const upload = require('../middlewares/upload');
const { isAuthenticated } = require('../middlewares/auth');

// Login & Auth
router.get('/login', (req, res) => {
    if (req.session && req.session.user) return res.redirect('/admin');
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (user && bcrypt.compareSync(password, user.password_hash)) {
            req.session.user = { id: user.id, username: user.username, role: user.role };
            return res.redirect('/admin');
        }
        res.render('login', { error: 'Credenciales inválidas' });
    } catch (err) {
        res.render('login', { error: 'Error en la base de datos' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/admin/login'));
});

// Panel Principal
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const settingsRows = await db.prepare('SELECT key, value FROM site_settings').all();
        const settings = {};
        settingsRows.forEach(r => { settings[r.key] = r.value; });

        const leads = await db.prepare('SELECT * FROM leads ORDER BY id DESC').all();
        const requirementTypes = await db.prepare('SELECT * FROM requirement_types ORDER BY id ASC').all();
        const specialties = await db.prepare('SELECT * FROM specialties ORDER BY id ASC').all();
        const projects = await db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
        const testimonials = await db.prepare('SELECT * FROM testimonials ORDER BY id ASC').all();

        res.render('admin/dashboard', {
            settings,
            leads: leads || [],
            requirementTypes: requirementTypes || [],
            specialties: specialties || [],
            projects: projects || [],
            testimonials: testimonials || [],
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error cargando el panel administrativo');
    }
});

// 1. Guardar Ajustes Globales (Marca, Hero, Estadísticas, Textos)
router.post('/settings', isAuthenticated, upload.single('logo'), async (req, res) => {
    try {
        const fields = [
            'business_name', 'brand_display', 'whatsapp_number', 'contact_email', 'address',
            'hero_eyebrow', 'hero_title', 'hero_subtitle',
            'stat_1_num', 'stat_1_label', 'stat_2_num', 'stat_2_label', 'stat_3_num', 'stat_3_label',
            'lead_badge', 'lead_title', 'lead_subtitle',
            'header_cta', 'hero_primary_cta', 'hero_secondary_cta', 'form_submit_label',
            'services_nav_label', 'projects_nav_label', 'testimonials_nav_label',
            'services_eyebrow', 'services_title', 'services_description',
            'projects_eyebrow', 'projects_title', 'projects_description',
            'testimonials_eyebrow', 'testimonials_title', 'footer_description'
        ];

        for (const f of fields) {
            if (req.body[f] !== undefined) {
                await db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)').run(f, req.body[f].trim());
            }
        }

        if (req.file) {
            const logoUrl = `/uploads/${req.file.filename}`;
            await db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)').run('logo_url', logoUrl);
        }

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error guardando ajustes');
    }
});

router.post('/settings/delete-logo', isAuthenticated, async (req, res) => {
    try {
        await db.prepare('DELETE FROM site_settings WHERE key = ?').run('logo_url');
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error al eliminar logo');
    }
});

// 2. Especialidades
router.post('/specialties', isAuthenticated, async (req, res) => {
    try {
        const { icon, title, description } = req.body;
        await db.prepare('INSERT INTO specialties (icon, title, description, is_active) VALUES (?, ?, ?, 1)').run(icon || '📐', title.trim(), description.trim());
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error agregando especialidad');
    }
});

router.post('/specialties/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { icon, title, description } = req.body;
        await db.prepare('UPDATE specialties SET icon = ?, title = ?, description = ? WHERE id = ?').run(icon, title.trim(), description.trim(), Number(req.params.id));
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error actualizando especialidad');
    }
});

router.post('/specialties/toggle/:id', isAuthenticated, async (req, res) => {
    try {
        const item = await db.prepare('SELECT is_active FROM specialties WHERE id = ?').get(req.params.id);
        if (item) {
            await db.prepare('UPDATE specialties SET is_active = ? WHERE id = ?').run(item.is_active === 1 ? 0 : 1, req.params.id);
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error');
    }
});

// 3. Proyectos / Casos
router.post('/projects', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { title, category, summary, status_label, location, surface_area } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        await db.prepare(`
            INSERT INTO projects (title, category, summary, status_label, location, surface_area, image_url, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `).run(title.trim(), category.trim(), summary.trim(), status_label || 'Entregado', location ? location.trim() : '', surface_area ? surface_area.trim() : '', imageUrl);

        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error guardando proyecto');
    }
});

router.post('/projects/update/:id', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { title, category, summary, status_label, location, surface_area } = req.body;
        const id = Number(req.params.id);

        const current = await db.prepare('SELECT image_url FROM projects WHERE id = ?').get(id);
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : (current ? current.image_url : null);

        await db.prepare(`
            UPDATE projects 
            SET title = ?, category = ?, summary = ?, status_label = ?, location = ?, surface_area = ?, image_url = ?
            WHERE id = ?
        `).run(title.trim(), category.trim(), summary.trim(), status_label, location ? location.trim() : '', surface_area ? surface_area.trim() : '', imageUrl, id);

        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error actualizando proyecto');
    }
});

router.post('/projects/toggle/:id', isAuthenticated, async (req, res) => {
    try {
        const item = await db.prepare('SELECT is_active FROM projects WHERE id = ?').get(req.params.id);
        if (item) {
            await db.prepare('UPDATE projects SET is_active = ? WHERE id = ?').run(item.is_active === 1 ? 0 : 1, req.params.id);
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error');
    }
});

// 4. Testimonios
router.post('/testimonials', isAuthenticated, async (req, res) => {
    try {
        const { author_name, author_role, quote, initials } = req.body;
        await db.prepare('INSERT INTO testimonials (author_name, author_role, quote, initials, is_active) VALUES (?, ?, ?, ?, 1)').run(author_name.trim(), author_role.trim(), quote.trim(), initials || author_name.slice(0, 2).toUpperCase());
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error guardando testimonio');
    }
});

router.post('/testimonials/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { author_name, author_role, quote, initials } = req.body;
        await db.prepare('UPDATE testimonials SET author_name = ?, author_role = ?, quote = ?, initials = ? WHERE id = ?').run(author_name.trim(), author_role.trim(), quote.trim(), initials || author_name.slice(0, 2).toUpperCase(), Number(req.params.id));
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error actualizando testimonio');
    }
});

router.post('/testimonials/toggle/:id', isAuthenticated, async (req, res) => {
    try {
        const item = await db.prepare('SELECT is_active FROM testimonials WHERE id = ?').get(req.params.id);
        if (item) {
            await db.prepare('UPDATE testimonials SET is_active = ? WHERE id = ?').run(item.is_active === 1 ? 0 : 1, req.params.id);
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error');
    }
});

// 5. Requerimientos del Formulario
router.post('/requirements', isAuthenticated, async (req, res) => {
    try {
        const { name } = req.body;
        if (name && name.trim()) {
            await db.prepare('INSERT INTO requirement_types (name, is_active) VALUES (?, 1)').run(name.trim());
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error');
    }
});

router.post('/requirements/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { name } = req.body;
        if (name && name.trim()) {
            await db.prepare('UPDATE requirement_types SET name = ? WHERE id = ?').run(name.trim(), Number(req.params.id));
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error');
    }
});

router.post('/requirements/toggle/:id', isAuthenticated, async (req, res) => {
    try {
        const item = await db.prepare('SELECT is_active FROM requirement_types WHERE id = ?').get(req.params.id);
        if (item) {
            await db.prepare('UPDATE requirement_types SET is_active = ? WHERE id = ?').run(item.is_active === 1 ? 0 : 1, req.params.id);
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error');
    }
});

// 6. Leads (Cambio de Estado)
router.post('/leads/status/:id', isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body;
        await db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, Number(req.params.id));
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error');
    }
});

module.exports = router;
