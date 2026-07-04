#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.resolve(__dirname, '../public/blog');
const distDir = path.resolve(__dirname, '../dist');
const baseUrl = 'https://simulateur-maprimeadapt.fr';

function generateSitemap() {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');
    const date = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog/</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    for (const file of blogFiles) {
        const slug = file.replace('.html', '');
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/${file}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    sitemap += '\n</urlset>';

    // Write to public (for dev) and dist (for production)
    fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
    if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
    }

    console.log('✅ Sitemap généré avec succès !');
}

generateSitemap();
