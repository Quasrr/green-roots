import emailjs from "@emailjs/nodejs";

emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY!,
    privateKey: process.env.EMAILJS_PRIVATE_KEY!,
});

export async function sendResetEmail(to: string, resetUrl: string): Promise<void> {
    await emailjs.send(
        process.env.EMAILJS_SERVICE_ID!,
        process.env.EMAILJS_TEMPLATE_ID!,
        {
            to_email: to,
            reset_url: resetUrl,
            app_name: "GreenRoots",
        }
    );
};