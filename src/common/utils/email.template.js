
export const emailTemplate = (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #eaeaea;
        }
        .email-header {
            background-color: #4f46e5;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .email-body {
            padding: 40px 30px;
            color: #333333;
            text-align: center;
        }
        .email-body p {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
            margin-bottom: 30px;
        }
        .otp-box {
            display: inline-block;
            background-color: #f3f4f6;
            color: #4f46e5;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 6px;
            padding: 15px 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            border: 1px dashed #4f46e5;
        }
        .email-footer {
            background-color: #f9fafb;
            text-align: center;
            padding: 20px;
            font-size: 13px;
            color: #888888;
            border-top: 1px solid #eaeaea;
        }
        .warning {
            font-size: 14px;
            color: #e11d48;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Verification Code</h1>
        </div>
        <div class="email-body">
            <p>Hello,<br>Please use the verification code below to complete your request:</p>
            <div class="otp-box">
                ${otp}
            </div>
            <p class="warning">⚠️ This code is valid for 10 minutes. Do not share this code with anyone for security purposes.</p>
        </div>
        <div class="email-footer">
            <p>All rights reserved &copy; Saraha App</p>
        </div>
    </div>
</body>
</html>`;
};