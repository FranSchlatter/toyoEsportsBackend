// server/src/models/News.js
const pool = require('../db');
const slugify = require('slugify');

class News {
  static async create({ type, title, body, images }) {
    const slug = slugify(title, { lower: true, strict: true });
    const query = `
      INSERT INTO news (type, title, slug, body, images)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [type, title, slug, body, JSON.stringify(images)];
    const [result] = await pool.query(query, values);
    
    // Retornar la noticia creada
    const newNews = await this.findBySlug(slug);
    return newNews;
  }

  static async findAll({ page = 1, limit = 4, type = null }) { // Cambiado a 4 items por página
    const offset = (page - 1) * limit;
    let query = `
      SELECT *, 
      JSON_UNQUOTE(images) as images 
      FROM news
      ${type ? 'WHERE type = ?' : ''}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM news
      ${type ? 'WHERE type = ?' : ''}
    `;
    
    const values = type ? [type, limit, offset] : [limit, offset];
    const countValues = type ? [type] : [];
    
    const [rows] = await pool.query(query, values);
    const [countRows] = await pool.query(countQuery, countValues);
    
    // Parse images JSON string back to array
    const news = rows.map(row => ({
      ...row,
      images: JSON.parse(row.images)
    }));

    return {
      news,
      total: countRows[0].count,
      pages: Math.ceil(countRows[0].count / limit)
    };
  }

  static async findBySlug(slug) {
    const query = 'SELECT *, JSON_UNQUOTE(images) as images FROM news WHERE slug = ?';
    const [rows] = await pool.query(query, [slug]);
    if (rows.length === 0) return null;
    
    // Parse images JSON string back to array
    const news = {
      ...rows[0],
      images: JSON.parse(rows[0].images)
    };
    
    return news;
  }
  
  static async update(slug, { type, title, body, images }) {
    const newSlug = title ? slugify(title, { lower: true, strict: true }) : slug;
    
    let query = 'UPDATE news SET ';
    const values = [];
    const updates = [];

    if (type) {
      updates.push('type = ?');
      values.push(type);
    }
    if (title) {
      updates.push('title = ?');
      values.push(title);
      updates.push('slug = ?');
      values.push(newSlug);
    }
    if (body) {
      updates.push('body = ?');
      values.push(body);
    }
    if (images) {
      updates.push('images = ?');
      values.push(JSON.stringify(images));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    query += updates.join(', ');
    query += ' WHERE slug = ?';
    values.push(slug);

    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) return null;

    return this.findBySlug(newSlug);
  }

  static async delete(slug) {
    const query = 'DELETE FROM news WHERE slug = ?';
    const [result] = await pool.query(query, [slug]);
    return result.affectedRows > 0;
  }
}

module.exports = News;