import express from 'express';
import siteController from '../../app/controllers/view/SiteController.js';

const router = express.Router();

// GET /search
router.get('/search', siteController.search);

// GET /
router.get('/', siteController.index);

export default router;
