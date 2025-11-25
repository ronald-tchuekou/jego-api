import app from '@adonisjs/core/services/app';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, sep } from 'node:path';
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
    async stream({ response, request }) {
        const filePath = request.param('*').join(sep);
        const absolutePath = app.makePath(`storage/${filePath}`);
        const allowedDir = app.makePath('storage');
        if (!absolutePath.startsWith(allowedDir)) {
            return response.status(403).send('Forbidden');
        }
        try {
            const stats = await stat(absolutePath);
            const fileSize = stats.size;
            const range = request.header('range');
            const contentType = extname(absolutePath).replace('.', '');
            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = Number.parseInt(parts[0], 10);
                const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;
                const chunkSize = end - start + 1;
                const fileStream = createReadStream(absolutePath, { start, end });
                response.status(206);
                response.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
                response.header('Accept-Ranges', 'bytes');
                response.header('Content-Length', chunkSize);
                response.type(contentType);
                return response.stream(fileStream);
            }
            else {
                response.header('Content-Length', fileSize);
                response.header('Accept-Ranges', 'bytes');
                response.type(contentType);
                return response.stream(createReadStream(absolutePath));
            }
        }
        catch (error) {
            return response.status(404).send('File not found');
        }
    }
}
//# sourceMappingURL=download_file_controller.js.map