import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Configure nodemailer with your email service (e.g., Gmail, SendGrid)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

export const sendInvitationEmail = functions.firestore
  .document('invitations/{invitationId}')
  .onCreate(async (snap, context) => {
    const invitation = snap.data();
    const registrationLink = `${functions.config().app.url}/register?token=${invitation.token}`;

    const mailOptions = {
      from: functions.config().email.user,
      to: invitation.email,
      subject: 'Invitation to Join MyAppHub',
      html: `
        <h2>Welcome to MyAppHub!</h2>
        <p>You have been invited to join MyAppHub with the role of ${invitation.role}.</p>
        <p>Click the link below to complete your registration:</p>
        <a href="${registrationLink}">${registrationLink}</a>
        <p>This invitation will expire in 7 days.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Invitation email sent to ${invitation.email}`);
      return null;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new functions.https.HttpsError('internal', 'Error sending invitation email');
    }
  });