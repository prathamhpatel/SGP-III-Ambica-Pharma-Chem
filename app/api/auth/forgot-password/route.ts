import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateResetToken, hashToken, sendEmail, getPasswordResetEmailHTML } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Please provide email address' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Save hashed token and expiry to database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Ambica Pharma Chem',
      html: getPasswordResetEmailHTML(resetUrl, user.name)
    });

    if (!emailSent) {
      // Clear reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      // Check if email is configured
      const isEmailConfigured = process.env.EMAIL_USER && 
                                process.env.EMAIL_PASSWORD && 
                                process.env.EMAIL_USER !== 'your-email@gmail.com';

      return NextResponse.json(
        { 
          success: false, 
          error: isEmailConfigured 
            ? 'Error sending email. Please check your email configuration and try again.' 
            : 'Email service not configured. Please contact your administrator or configure email settings in .env.local file.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.'
    });
    
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

