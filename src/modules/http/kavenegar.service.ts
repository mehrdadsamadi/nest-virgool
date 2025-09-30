import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import * as querystring from 'node:querystring';
import { SmsTemplate } from './enum/sms-template.enum';

@Injectable()
export class KavenegarService {
  constructor(private httpService: HttpService) {}

  async sendVerificationSms(receptor: string, code: string) {
    const { SEND_SMS_URL } = process.env;

    const params = querystring.stringify({
      receptor,
      token: code,
      template: SmsTemplate.Verify,
    });

    console.log('params', params);

    const result = await lastValueFrom(
      this.httpService
        .get(`${SEND_SMS_URL}?${params}`)
        .pipe(map((res) => res.data))
        .pipe(
          catchError((err) => {
            console.log(err);
            throw new InternalServerErrorException('kavenegar');
          }),
        ),
    );

    console.log('result', result);

    return result;
  }
}
