from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
import secrets
from jose import jwt
from ..supabase_client import supabase, supabase_admin
from ..schemas import UserSignup, UserLogin, TokenResponse, OtpStartRequest, OtpVerifyRequest, EmailVerificationRequest, EmailVerifyRequest
from ..dependencies import get_current_user
from ..services.email_service import EmailService
from ..config import settings

router = APIRouter()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Register a new user with Supabase Auth.
    Also sends verification email and stores username in user metadata.
    """
    try:
        # Sign up user with Supabase
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "username": user_data.username,
                    "email_verified": False
                }
            }
        })

        # Handle response - check for user in response
        user = getattr(response, 'user', None)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user. Email might already be registered."
            )

        # Generate verification code
        verification_code = "".join(
            secrets.choice("0123456789") for _ in range(6))

        # Store verification code in user metadata
        verification_data = {
            "email_verified": False,
            "username": user_data.username,
            "verification_code": verification_code,
            "verification_expires_at": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        }

        supabase_admin.auth.admin.update_user_by_id(
            user.id,
            {"user_metadata": verification_data}
        )

        # Send verification email
        email_sent = EmailService.send_verification_email(
            user_data.email, verification_code)

        return {
            "message": "User created. Please verify your email.",
            "email": user_data.email,
            "verification_code_sent": email_sent,
            "expires_in_minutes": 15
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """
    Login with email and password using Supabase Auth.
    Requires email to be verified.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })

        # Handle response
        user = getattr(response, 'user', None)
        session = getattr(response, 'session', None)

        if not user or not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Check if email is verified
        email_verified = user.user_metadata.get(
            "email_verified", False) if hasattr(user, 'user_metadata') else False

        if not email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in"
            )

        username = user.user_metadata.get(
            "username", "") if hasattr(user, 'user_metadata') else ""

        return {
            "access_token": session.access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": username
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


@router.post("/email/verify-request")
async def request_email_verification(payload: EmailVerificationRequest):
    """
    Send verification email with code to unverified user.
    """
    try:
        # Get user by email
        try:
            user_response = supabase_admin.auth.admin.list_users()
            user = None
            for u in user_response:
                if u.email == payload.email:
                    user = u
                    break
        except:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if already verified
        email_verified = user.user_metadata.get(
            "email_verified", False) if hasattr(user, 'user_metadata') else False

        if email_verified:
            return {"message": "Email already verified"}

        # Generate new verification code
        verification_code = "".join(
            secrets.choice("0123456789") for _ in range(6))

        # Update user metadata
        metadata = user.user_metadata.copy() if hasattr(user, 'user_metadata') else {}
        metadata.update({
            "verification_code": verification_code,
            "verification_expires_at": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        })

        supabase_admin.auth.admin.update_user_by_id(
            user.id, {"user_metadata": metadata})

        # Send verification email
        email_sent = EmailService.send_verification_email(
            payload.email, verification_code)

        return {
            "message": "Verification email sent",
            "email_sent": email_sent,
            "expires_in_minutes": 15
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send verification: {str(e)}"
        )


@router.post("/email/verify")
async def verify_email(payload: EmailVerifyRequest):
    """
    Verify email with code.
    """
    try:
        # Get user by email
        try:
            user_response = supabase_admin.auth.admin.list_users()
            user = None
            for u in user_response:
                if u.email == payload.email:
                    user = u
                    break
        except:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get verification code from metadata
        metadata = user.user_metadata if hasattr(user, 'user_metadata') else {}
        stored_code = metadata.get("verification_code")
        expires_at = metadata.get("verification_expires_at")

        if not stored_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No verification code found"
            )

        # Check if code matches
        if stored_code != payload.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )

        # Check if code expired
        if expires_at:
            expires_dt = datetime.fromisoformat(expires_at)
            if datetime.now(timezone.utc) > expires_dt:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification code expired"
                )

        # Mark email as verified
        metadata["email_verified"] = True
        metadata.pop("verification_code", None)
        metadata.pop("verification_expires_at", None)

        supabase_admin.auth.admin.update_user_by_id(
            user.id, {"user_metadata": metadata})

        return {"message": "Email verified successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email verification failed: {str(e)}"
        )


@router.post("/otp/start")
async def otp_start(payload: OtpStartRequest):
    """
    Send an OTP via Resend for login or recovery.
    """
    try:
        # Generate OTP code
        otp_code = "".join(secrets.choice("0123456789") for _ in range(6))

        # Store OTP in a file/redis (for now using simple in-memory, but production should use Redis/DB)
        # We'll store it in user metadata temporarily
        try:
            user_response = supabase_admin.auth.admin.list_users()
            user = None
            for u in user_response:
                if u.email == payload.email:
                    user = u
                    break
        except:
            # User doesn't exist yet, which is fine for OTP login (can be new user)
            user = None

        if user:
            # Update user metadata with OTP
            metadata = user.user_metadata.copy() if hasattr(user, 'user_metadata') else {}
            metadata.update({
                "otp_code": otp_code,
                "otp_expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
                "otp_purpose": payload.purpose
            })
            supabase_admin.auth.admin.update_user_by_id(
                user.id, {"user_metadata": metadata})

        # Send OTP via Resend
        email_sent = EmailService.send_otp_email(payload.email, otp_code)

        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email. Please try again."
            )

        return {"message": "OTP sent successfully", "email": payload.email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send OTP: {str(e)}"
        )


@router.post("/otp/verify", response_model=TokenResponse)
async def otp_verify(payload: OtpVerifyRequest):
    """
    Verify an OTP for login or password recovery.
    """
    try:
        # Find user by email
        user_list = supabase_admin.auth.admin.list_users()
        user = None
        for u in user_list:
            if u.email == payload.email:
                user = u
                break

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Validate OTP code from user metadata
        metadata = user.user_metadata if hasattr(
            user, 'user_metadata') and user.user_metadata else {}
        stored_code = metadata.get("otp_code")
        expires_at_str = metadata.get("otp_expires_at")

        if not stored_code or stored_code != payload.token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )

        # Check if OTP is expired
        if expires_at_str:
            try:
                expires_at = datetime.fromisoformat(expires_at_str)
                if datetime.now(timezone.utc) > expires_at:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="OTP expired"
                    )
            except ValueError:
                pass

        # Handle password recovery
        if payload.purpose == "recovery":
            if not payload.new_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="New password is required"
                )
            supabase_admin.auth.admin.update_user_by_id(
                user.id,
                {"password": payload.new_password}
            )
            # Clear OTP from metadata
            metadata.pop("otp_code", None)
            metadata.pop("otp_expires_at", None)
            supabase_admin.auth.admin.update_user_by_id(
                user.id,
                {"user_metadata": metadata}
            )
            return {
                "message": "Password updated successfully",
                "access_token": "",
                "token_type": "bearer",
                "user": {"id": user.id, "email": user.email}
            }

        # OTP login - create access token
        username = metadata.get("username", "")
        metadata.pop("otp_code", None)
        metadata.pop("otp_expires_at", None)
        supabase_admin.auth.admin.update_user_by_id(
            user.id,
            {"user_metadata": metadata}
        )

        # Generate JWT access token
        now = datetime.now(timezone.utc)
        expires_at = now + \
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        token_payload = {
            "sub": user.id,  # subject (user ID)
            "email": user.email,
            "user_metadata": {
                "username": username,
                "email_verified": metadata.get("email_verified", False)
            },
            "iat": int(now.timestamp()),  # issued at
            "exp": int(expires_at.timestamp()),  # expiration
            "aud": "authenticated",
            "iss": "supabase"
        }

        access_token = jwt.encode(
            token_payload,
            settings.SUPABASE_JWT_SECRET,
            algorithm=settings.ALGORITHM
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": username
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"OTP verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OTP verification failed: {str(e)}"
        )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout the current user.
    Note: With JWT, logout is mainly client-side (remove token).
    """
    try:
        supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    """
    print(f"GET /me called, returning user: {current_user}")
    return current_user
