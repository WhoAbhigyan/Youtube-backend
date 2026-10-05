import transporter from "./mailer.js";

const sendWelcomeEmail = async (email, fullName, username) => {

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Welcome to TubeVideo 🎉",

        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #120B2A;
                font-family: Arial, sans-serif;
                color: #F7F0E3;
            ">

                <div style="
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #1F1548;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.35);
                ">

                    <div style="
                        padding: 35px;
                        text-align: center;
                        background: linear-gradient(
                            135deg,
                            #1F1548,
                            #2b1d64
                        );
                    ">

                        <h1 style="
                            margin: 0;
                            font-size: 32px;
                            color: #FFD23F;
                        ">
                            Welcome to TubeVideo
                        </h1>

                        <p style="
                            margin-top: 12px;
                            font-size: 16px;
                            color: #8F87BF;
                        ">
                            Your account is officially ready.
                        </p>

                    </div>

                    <div style="padding: 35px;">

                        <h2 style="
                            margin-top: 0;
                            color: #F7F0E3;
                        ">
                            Hey ${fullName} 👋
                        </h2>

                        <p style="
                            font-size: 16px;
                            line-height: 1.7;
                            color: #d8d2e8;
                        ">
                            Welcome to TubeVideo. We're really happy to
                            have you here.
                        </p>

                        <div style="
                            margin: 25px 0;
                            padding: 20px;
                            border: 1px solid #3FE3FF;
                            border-radius: 15px;
                            background-color: #171034;
                        ">

                            <p style="
                                margin: 0 0 10px;
                                color: #8F87BF;
                                font-size: 13px;
                                text-transform: uppercase;
                            ">
                                Your TubeVideo Profile
                            </p>

                            <p style="
                                margin: 6px 0;
                                font-size: 18px;
                                color: #F7F0E3;
                            ">
                                <strong>Name:</strong> ${fullName}
                            </p>

                            <p style="
                                margin: 6px 0;
                                font-size: 18px;
                                color: #F7F0E3;
                            ">
                                <strong>Username:</strong> @${username}
                            </p>

                        </div>

                        <p style="
                            font-size: 15px;
                            line-height: 1.7;
                            color: #d8d2e8;
                        ">
                            Start discovering videos, build playlists,
                            like your favorite content, subscribe to
                            channels and make TubeVideo your own.
                        </p>

                        <div style="
                            margin-top: 30px;
                            text-align: center;
                        ">

                            <a href="http://localhost:5173"
                               style="
                                display: inline-block;
                                padding: 14px 28px;
                                background-color: #FFD23F;
                                color: #120B2A;
                                text-decoration: none;
                                border-radius: 10px;
                                font-weight: bold;
                            ">
                                Start Exploring
                            </a>

                        </div>

                    </div>

                    <div style="
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #30245c;
                    ">

                        <p style="
                            margin: 0;
                            font-size: 12px;
                            color: #8F87BF;
                        ">
                            Welcome aboard. See you inside TubeVideo.
                        </p>

                    </div>

                </div>

            </body>
            </html>
        `
    });
};

export default sendWelcomeEmail;