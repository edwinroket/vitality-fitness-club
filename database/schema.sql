-- 1. Configuración de Marca y Textos Globales
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES 
('business_name', 'Tu Marca'),
('brand_display', 'both'),
('whatsapp_number', '00000000000'),
('contact_email', 'hola@tumarca.com'),
('address', 'Tu ciudad, tu país'),
('hero_eyebrow', 'Una solución para tus clientes'),
('hero_title', 'Comunica el valor de tu negocio de forma clara.'),
('hero_subtitle', 'Presenta tu propuesta, genera confianza y convierte visitas en nuevas oportunidades.'),
('stat_1_num', '+100'),
('stat_1_label', 'Clientes atendidos'),
('stat_2_num', '+8'),
('stat_2_label', 'Años de experiencia'),
('stat_3_num', '99%'),
('stat_3_label', 'Recomendación'),
('lead_badge', 'HABLEMOS'),
('lead_title', 'Cuéntanos cómo podemos ayudarte'),
('lead_subtitle', 'Déjanos tus datos y nos pondremos en contacto contigo pronto.'),
('header_cta', 'Contáctanos'),
('hero_primary_cta', 'Conversemos'),
('hero_secondary_cta', 'Conoce más'),
('form_submit_label', 'Enviar mensaje'),
('services_nav_label', 'Servicios'),
('projects_nav_label', 'Casos'),
('testimonials_nav_label', 'Testimonios'),
('services_eyebrow', 'Lo que hacemos'),
('services_title', 'Soluciones pensadas para tus necesidades'),
('services_description', 'Explica las áreas, productos o servicios que hacen diferente a tu negocio.'),
('projects_eyebrow', 'Nuestro trabajo'),
('projects_title', 'Casos y resultados destacados'),
('projects_description', 'Muestra ejemplos reales de proyectos, productos o experiencias.'),
('testimonials_eyebrow', 'Confían en nosotros'),
('testimonials_title', 'Lo que dicen nuestros clientes'),
('footer_description', 'Una breve descripción de tu marca, propuesta de valor o servicio principal.');

-- 2. Opciones del selector de requerimientos
CREATE TABLE IF NOT EXISTS requirement_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Especialidades / Pilares
CREATE TABLE IF NOT EXISTS specialties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT DEFAULT '📐',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- 4. Portafolio de Proyectos / Casos
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    status_label TEXT DEFAULT 'Entregado',
    location TEXT,
    surface_area TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1
);

-- 5. Testimonios
CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    quote TEXT NOT NULL,
    initials TEXT,
    is_active INTEGER DEFAULT 1
);

-- 6. Prospectos / Leads
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'nuevo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Usuario Admin
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
);

-- Datos iniciales de Especialidades
INSERT OR IGNORE INTO specialties (id, icon, title, description, is_active) VALUES
(1, '✨', 'Servicio principal', 'Explica en pocas palabras el beneficio principal que entregas a tus clientes.', 1),
(2, '🤝', 'Atención personalizada', 'Describe cómo acompañas a cada persona durante su experiencia contigo.', 1),
(3, '🚀', 'Resultados que importan', 'Comparte el impacto o resultado que diferencia a tu negocio.', 1);

-- Datos iniciales de Proyectos
INSERT OR IGNORE INTO projects (id, title, category, summary, status_label, location, surface_area, is_active) VALUES
(1, 'Caso destacado 01', 'Categoría', 'Resume aquí un proyecto, producto o experiencia que represente bien tu trabajo.', 'Completado', 'Ubicación', 'Dato destacado', 1),
(2, 'Caso destacado 02', 'Categoría', 'Muestra otro resultado o solución relevante para tus potenciales clientes.', 'En curso', 'Ubicación', 'Dato destacado', 1),
(3, 'Caso destacado 03', 'Categoría', 'Utiliza este espacio para reforzar tu experiencia y propuesta de valor.', 'Completado', 'Ubicación', 'Dato destacado', 1);

-- Datos iniciales de Testimonios
INSERT OR IGNORE INTO testimonials (id, author_name, author_role, quote, initials, is_active) VALUES
(1, 'Nombre del cliente', 'Cargo o empresa', 'Comparte aquí una opinión real que ayude a generar confianza en tu marca.', 'NC', 1),
(2, 'Nombre del cliente', 'Cargo o empresa', 'Este espacio sirve para destacar una experiencia positiva y concreta.', 'NC', 1),
(3, 'Nombre del cliente', 'Cargo o empresa', 'Incluye un testimonio breve, claro y autorizado por tu cliente.', 'NC', 1);

-- Opciones por defecto de requerimientos
INSERT OR IGNORE INTO requirement_types (id, name, is_active) VALUES 
(1, 'Quiero conocer sus servicios', 1),
(2, 'Necesito una cotización', 1),
(3, 'Quiero agendar una reunión', 1),
(4, 'Otra consulta', 1);
