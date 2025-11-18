import { sep } from 'node:path';
export default class DownloadFileController {
    async download({ response, request }) {
        const filePath = request.param('*').join(sep);
        const absolutePath = `storage/${filePath}`;
        return response.download(absolutePath, true);
    }
}
//# sourceMappingURL=download_file_controller.js.map