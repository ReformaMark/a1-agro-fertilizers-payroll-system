'use server'

import twilio from 'twilio';

export async function sendSms(phone: string, message: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid,authToken);
    await client.messages.create({ to: phone, from: process.env.TWILIO_PHONE_NUMBER, body: message });
    console.log('SMS sent successfully');
}