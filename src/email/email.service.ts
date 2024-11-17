import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: Transporter;
    
    constructor(private configService: ConfigService) {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        this.transporter = createTransport({
            host: this.configService.get('nodemailer_host'),
            port: this.configService.get('nodemailer_port'),
            secure: true,
            auth: {
                user: this.configService.get('nodemailer_auth_user'),
                pass: this.configService.get('nodemailer_auth_pass')
            }
        });
    }

    async sendMail({to, subject, html}) {
        return await true
        await this.transporter.sendMail({
            from: {
                address: this.configService.get('nodemailer_auth_user'),
                name: '小黄鸭'
            },
            to,
            subject,
            html
        })
    }
}
