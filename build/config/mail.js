import env from '#start/env';
import { defineConfig, transports } from '@adonisjs/mail';
const mailConfig = defineConfig({
    default: 'smtp',
    from: {
        address: env.get('SMTP_FROM'),
        name: env.get('SMTP_FROM_NAME'),
    },
    replyTo: {
        address: env.get('SMTP_FROM'),
        name: env.get('SMTP_FROM_NAME'),
    },
    mailers: {
        smtp: transports.smtp({
            host: env.get('SMTP_HOST'),
            port: env.get('SMTP_PORT'),
            tls: {
                rejectUnauthorized: false,
            },
            auth: {
                type: 'login',
                user: env.get('SMTP_USER'),
                pass: env.get('SMTP_PASSWORD'),
            },
        }),
    },
});
export default mailConfig;
//# sourceMappingURL=mail.js.map