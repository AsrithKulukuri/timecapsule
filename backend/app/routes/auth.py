from fastapi import APIRouter, Depends, HTTPException, status
from app.supabase_client import supabase, supabase_admin
from app.schemas import UserSignup, UserLogin, TokenResponse, OtpStartRequest, OtpVerifyRequest
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Register a new user with Supabase Auth.
    Also stores username in user metadata.
    """
    try:
        # Sign up user with Supabase
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "username": user_data.username
                }
            }
        })

        # Handle response - check for user in response
        user = getattr(response, 'user', None)
        session = getattr(response, 'session', None)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user. Email might already be registered."
            )

        # Get access token from session if available
        access_token = session.access_token if session else None

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to generate session token."
            )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user_data.username
            }
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


@router.post("/otp/start")
async def otp_start(payload: OtpStartRequest):
    """
    Send an OTP for login or recovery.
    """
    try:
        supabase.auth.sign_in_with_otp({
            "email": payload.email,
            "options": {
                "should_create_user": False
            }
        })
        return {"message": "OTP sent"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send OTP: {str(e)}"
        )


@router.post("/otp/verify")
async def otp_verify(payload: OtpVerifyRequest):
    """
    Verify an OTP for login or password recovery.
    """
    try:
        response = supabase.auth.verify_otp({
            "email": payload.email,
            "token": payload.token,
            "type": "email"
        })

        user = getattr(response, 'user', None)
        session = getattr(response, 'session', None)

        if payload.purpose == "recovery":
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid OTP"
                )
            if not payload.new_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="New password is required"
                )
            supabase_admin.auth.admin.update_user_by_id(
                user.id,
                {"password": payload.new_password}
            )
            return {"message": "Password updated"}

        if not user or not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP"
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
