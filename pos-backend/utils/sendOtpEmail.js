const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Restro POS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Restro POS OTP Verification Code",
      html: `
        <div style="margin:0;padding:0;background:#111111;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="background:#1a1a1a;border:1px solid #2e2e2e;border-radius:18px;padding:40px 30px;color:#f5f5f5;">
              
              <div style="text-align:center;margin-bottom:30px;">
                <h1 style="margin:0;font-size:30px;color:#f6b100;">Restro POS</h1>
                <p style="margin-top:10px;color:#ababab;font-size:14px;">
                  Employee Email Verification
                </p>
              </div>

              <h2 style="margin:0 0 15px 0;font-size:24px;color:#ffffff;text-align:center;">
                Verify Your Email Address
              </h2>

              <p style="font-size:15px;line-height:1.7;color:#d1d1d1;text-align:center;margin-bottom:25px;">
                Use the verification code below to complete your account registration.
                This OTP is valid for 5 minutes.
              </p>

              <div style="text-align:center;margin:30px 0;">
                <div style="
                  display:inline-block;
                  background:#111111;
                  border:2px dashed #f6b100;
                  color:#f6b100;
                  padding:18px 30px;
                  border-radius:14px;
                  font-size:34px;
                  font-weight:bold;
                  letter-spacing:10px;
                ">
                  ${otp}
                </div>
              </div>

              <p style="font-size:14px;line-height:1.7;color:#bcbcbc;text-align:center;margin-top:30px;">
                If you did not create an account in Restro POS, you may ignore this email.
              </p>

              <hr style="border:none;border-top:1px solid #2f2f2f;margin:30px 0;" />

              <p style="font-size:12px;color:#7e7e7e;text-align:center;margin:0;">
                This is an automated message from Restro POS. Please do not reply.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("✅ OTP email sent to:", email);
  } catch (error) {
    console.log("❌ Email Error:", error);
    throw error;
  }
};

module.exports = sendOtpEmail;