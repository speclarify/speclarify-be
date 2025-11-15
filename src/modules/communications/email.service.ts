import { MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent('email.send')
  public async sendEmail(sendMailOptions: ISendMailOptions): Promise<void> {
    await this.mailerService.sendMail(sendMailOptions);
  }
}
