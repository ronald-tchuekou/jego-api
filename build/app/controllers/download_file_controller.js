import app from '@adonisjs/core/services/app';
import { sep } from 'node:path';
export default class DownloadFileController {
    async download({ response, request }) {
        const filePath = request.param('*').join(sep);
        const absolutePath = app.makePath(`storage/${filePath}`);
        const allowedDir = app.makePath('storage');
        if (!absolutePath.startsWith(allowedDir)) {
            return response.status(403).send('Forbidden');
        }
        return response.download(absolutePath, true);
    }
}
//# sourceMappingURL=download_file_controller.js.map