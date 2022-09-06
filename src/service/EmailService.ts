import * as nodemailer from 'nodemailer';
import * as jobQueue from '../job-queue';
import * as entity from '../entity';
import { Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

export class EmailService {
    private static instance: EmailService;
    private static hasAddedWorker = false;
    private static transporter: nodemailer.Transporter;
    private constructor() {}

    //follows singleton pattern
    public static getInstance(): EmailService {

        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }

        if (!EmailService.hasAddedWorker) {
            jobQueue.addEmailWorker(EmailService.instance.job);
            EmailService.hasAddedWorker = true;
        }

        if (process.env.NODE_ENV === 'production') {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PWD
                }
            });
        } else {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PWD
                }
            });
        }

        return EmailService.instance;
    }

    public sendEmail(email: entity.Email) {

        const jobId = `email-${uuidv4()}`;
        jobQueue.addEmailJob(jobId, email);
    }

    private job = async (job: Job) => {
        
        try {
            const data: entity.Email = job.data;
            const transporter = EmailService.transporter;
            await transporter.sendMail({
                from: process.env.EMAIL,
                bcc: data.to,
                subject: data.subject,
                text: data.content
            });
        } catch (err) {
            throw err;
        }
    }
}