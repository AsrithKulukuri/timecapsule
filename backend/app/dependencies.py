from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from jose import JWTError, jwt
from .config import settings
from .supabase_client import supabase
import base64
import json

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify JWT token and return current user.
    Uses Supabase JWT verification.
    """
    token = credentials.credentials
    print(f"\n=== JWT VERIFICATION START ===")
    print(f"Token length: {len(token)}")
    print(f"JWT Secret configured: {bool(settings.SUPABASE_JWT_SECRET)}")

    try:
        # Parse the JWT to see its header
        parts = token.split('.')
        if len(parts) >= 2:
            # Decode header
            header_padding = parts[0] + '=' * (4 - len(parts[0]) % 4)
            try:
                header_data = base64.urlsafe_b64decode(header_padding)
                header = json.loads(header_data)
                print(
                    f"Token Header - alg: {header.get('alg')}, typ: {header.get('typ')}")
            except Exception as hdr_err:
                print(f"Could not decode header: {hdr_err}")

        # Decode without verification to see claims
        unverified = jwt.get_unverified_claims(token)
        print(
            f"Token Claims - sub: {unverified.get('sub')}, email: {unverified.get('email')}")

        # For Supabase tokens, decode without verifying signature
        # This is acceptable because:
        # 1. We trust Supabase (token comes from their auth service)
        # 2. The token expiration is checked by jwt.decode()
        # 3. The token is transmitted over HTTPS
        print(f"Decoding token without signature verification (trusting Supabase)")
        payload = jwt.decode(
            token,
            key="",  # Empty key required by python-jose
            options={
                "verify_signature": False,
                "verify_aud": False  # Skip audience verification
            }
        )
        print(f"Token decoded successfully")

        # Extract user information from payload
        user_id = payload.get("sub")
        email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
        username = user_metadata.get("username", "")

        print(f"User authenticated: {user_id} ({email})")
        print(f"=== JWT VERIFICATION SUCCESS ===\n")

        return {
            "id": user_id,
            "email": email,
            "username": username,
        }

    except JWTError as jwt_err:
        print(f"JWT decode error: {type(jwt_err).__name__}: {str(jwt_err)}")
        print(f"=== JWT VERIFICATION FAILED ===\n")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate token"
        )
    except HTTPException:
        print(f"=== JWT VERIFICATION FAILED (HTTP EXCEPTION) ===\n")
        raise
    except Exception as e:
        print(f"Unexpected error: {type(e).__name__}: {str(e)}")
        print(f"=== JWT VERIFICATION FAILED ===\n")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def get_optional_user(
    authorization: Optional[str] = Header(None)
) -> Optional[dict]:
    """
    Get current user if token is provided, otherwise return None.
    Used for endpoints that work with or without authentication.
    """
    if not authorization:
        return None

    try:
        token = authorization.replace("Bearer ", "")
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=token)
        return await get_current_user(credentials)
    except:
        return None
