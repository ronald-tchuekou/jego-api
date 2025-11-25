import { createReadStream } from 'node:fs';
import { sep } from 'node:path';
export default class DownloadFileController {
    async download({ response, request }) {
        const filePath = request.param('*').join(sep);
        const absolutePath = `storage/${filePath}`;
        return response.download(absolutePath, true);
    }
    async stream({ response, request }) {
        const filePath = request.param('*').join(sep);
        const absolutePath = `storage/${filePath}`;
        return response.stream(createReadStream(absolutePath), (error) => {
            return [error.message, 400];
        });
    }
}
//# sourceMappingURL=download_file_controller.js.map