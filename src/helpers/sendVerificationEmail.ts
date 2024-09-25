import {resend} from '@/lib/resend';
import VerificationEmail from '../../emails/VerificationEmail';
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Mystery Message | Verification code',
            react: VerificationEmail({username, otp: verifyCode}),
          });
        return {success: true, message: 'Verification email send successfully'}
    } catch (emailError) {
        console.error("error while sending verification email")
        return {success: false, message: 'Failed to send verification email'}
    }
}