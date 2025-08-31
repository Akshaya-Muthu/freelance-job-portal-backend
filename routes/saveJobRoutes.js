import express from 'express';
import { saveJob, getSaveJob ,unsaveJob} from '../controllers/saveJobController.js';
import { protect}  from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/save',protect,saveJob);
router.post('/unsave',protect,unsaveJob);
router.get('/',protect,getSaveJob);

export default router;