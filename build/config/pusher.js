import Pusher from 'pusher';
import Env from '#start/env';
const pusher = new Pusher({
    appId: Env.get('PUSHER_APP_ID'),
    key: Env.get('PUSHER_KEY'),
    secret: Env.get('PUSHER_SECRET'),
    cluster: Env.get('PUSHER_CLUSTER'),
    useTLS: true,
});
export default pusher;
//# sourceMappingURL=pusher.js.map