export function signInEmailHtml({ url, host }: { url: string; host: string }): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Sign in to The One Dollar Digest</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ebe3;font-family:Georgia,'Times New Roman',serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f0ebe3;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:520px;background-color:#faf7f3;border:1px solid #d6cfc6;">

          <!-- Masthead -->
          <tr>
            <td style="padding:36px 40px 28px;border-bottom:1px solid #d6cfc6;text-align:center;">
              <p style="margin:0 0 6px;font-family:'Courier New',Courier,monospace;font-size:9px;
                letter-spacing:0.12em;text-transform:uppercase;color:#9c8e82;">
                ${host}
              </p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;
                font-size:28px;font-weight:400;color:#1a1816;line-height:1.2;">
                The One Dollar Digest
              </h1>
              <div style="margin:14px auto 0;width:32px;height:1px;background-color:#b0a898;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;font-size:9px;
                letter-spacing:0.1em;text-transform:uppercase;color:#9c8e82;">
                Sign-in request
              </p>

              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#2e2a26;">
                Click the button below to sign in. No password needed — this link is valid for
                <strong style="color:#1a1816;">24 hours</strong> and can only be used once.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#3d6b5c;border:1px solid #3d6b5c;">
                    <a href="${url}"
                      style="display:inline-block;padding:14px 28px;font-family:'Courier New',Courier,monospace;
                        font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;
                        text-decoration:none;font-weight:500;">
                      Sign in to The One Dollar Digest
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:9px;
                letter-spacing:0.08em;text-transform:uppercase;color:#9c8e82;">
                Or copy this link into your browser
              </p>
              <p style="margin:0;font-size:11px;line-height:1.5;word-break:break-all;color:#6a6460;
                font-family:'Courier New',Courier,monospace;padding:12px;background-color:#eee9e2;
                border:1px solid #d6cfc6;">
                ${url}
              </p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#d6cfc6;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;">
              <p style="margin:0 0 6px;font-family:'Courier New',Courier,monospace;font-size:9px;
                letter-spacing:0.06em;color:#b0a898;line-height:1.6;">
                If you did not request this email, you can safely ignore it. No account will be
                created and no action is required.
              </p>
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:9px;
                letter-spacing:0.06em;color:#c4bcb2;">
                © ${new Date().getFullYear()} The One Dollar Digest &mdash; AI-curated daily news for $1/month
              </p>
            </td>
          </tr>

        </table>
        <!-- / Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

export function signInEmailText({ url, host }: { url: string; host: string }): string {
  return [
    `Sign in to The One Dollar Digest (${host})`,
    ``,
    `Click the link below to sign in. This link is valid for 24 hours and can only be used once.`,
    ``,
    url,
    ``,
    `If you did not request this email, you can safely ignore it.`,
    ``,
    `© ${new Date().getFullYear()} The One Dollar Digest`,
  ].join("\n");
}
