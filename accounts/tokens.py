"""
Token utilities for email verification and password reset.
Uses Django's built-in token generator for security.
"""
from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """
    Custom token generator for email verification.
    Creates a hash based on user's pk, timestamp, and is_email_verified status.
    """

    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk)
            + str(timestamp)
            + str(user.is_email_verified)
        )


email_verification_token = EmailVerificationTokenGenerator()
password_reset_token = PasswordResetTokenGenerator()
