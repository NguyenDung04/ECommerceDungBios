import viewRoutes from './view/index.js';
import apiRoutes from './api/index.js';

function route(app) {
    viewRoutes(app);   
    apiRoutes(app);   
}

export default route;