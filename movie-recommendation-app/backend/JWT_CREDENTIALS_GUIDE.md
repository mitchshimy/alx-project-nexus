# JWT Credentials Guide

## 🔐 What are JWT Credentials?

JWT (JSON Web Tokens) credentials are used for:
- **Authentication**: Verifying user identity
- **Authorization**: Controlling access to resources
- **Session Management**: Maintaining user sessions

## 📋 Your Generated Credentials

### **For Local Development:**
```bash
SECRET_KEY=$tNyCD0WlD=G8zFo&5jpGEqjw@TaAe@3Rs#V@x(MKvtL9NEETb1bL@4@^Zfv@WzZ
JWT_SECRET_KEY=h&#0mpGPgj^wXdTf$EsR&#Umd=OyNIODywDLm_2J8@_T6A#OcIC-fJ*YJN*Z@*SE
```

### **For Production (Render):**
You'll need to generate new credentials for production:
```bash
python generate_jwt_secret.py
```

## 🚀 How to Use These Credentials

### **1. Local Development**
Your credentials are already in `env.local`:
- ✅ `SECRET_KEY` - Django's main secret key
- ✅ `JWT_SECRET_KEY` - For JWT token signing
- ✅ `JWT_ACCESS_TOKEN_LIFETIME=5` - 5 minutes
- ✅ `JWT_REFRESH_TOKEN_LIFETIME=1` - 1 day

### **2. Production (Render)**
When deploying to Render, add these environment variables:

```bash
# Django Settings
SECRET_KEY=your-production-secret-key
DEBUG=False

# JWT Settings
JWT_SECRET_KEY=your-production-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1
```

## 🔧 How JWT Works in Your App

### **Token Flow:**
1. **User Login** → Backend validates credentials
2. **Backend Issues** → Access token (5 min) + Refresh token (1 day)
3. **Frontend Stores** → Tokens in localStorage
4. **API Requests** → Include access token in Authorization header
5. **Token Expires** → Frontend uses refresh token to get new access token

### **Security Features:**
- ✅ **Short-lived access tokens** (5 minutes)
- ✅ **Longer refresh tokens** (1 day)
- ✅ **Automatic token refresh** on frontend
- ✅ **Secure token storage** in localStorage
- ✅ **HTTPS required** in production

## 🛡️ Security Best Practices

### **✅ Do:**
- Use different keys for development and production
- Keep keys secret and secure
- Use HTTPS in production
- Rotate keys periodically
- Monitor for suspicious activity

### **❌ Don't:**
- Commit keys to version control
- Share keys publicly
- Use the same keys everywhere
- Store keys in plain text files
- Use weak/guessable keys

## 🔄 Generating New Credentials

### **For Development:**
```bash
python generate_jwt_secret.py
```

### **For Production:**
1. Run the script on a secure machine
2. Copy the generated keys
3. Add them to Render environment variables
4. Never use development keys in production

## 📊 Token Configuration

### **Current Settings:**
- **Access Token**: 5 minutes (for API calls)
- **Refresh Token**: 1 day (for getting new access tokens)
- **Algorithm**: HS256 (HMAC with SHA-256)

### **Customization:**
You can adjust these in your environment variables:
```bash
JWT_ACCESS_TOKEN_LIFETIME=5    # 5 minutes
JWT_REFRESH_TOKEN_LIFETIME=1   # 1 day
```

## 🎯 Next Steps

1. **Test locally** with your current credentials
2. **Deploy to Render** with new production credentials
3. **Update frontend** to use the new API URL
4. **Test authentication** flow end-to-end

## 🔍 Troubleshooting

### **Common Issues:**

1. **"Invalid token" errors**
   - Check if JWT_SECRET_KEY is set correctly
   - Verify token hasn't expired
   - Check if using correct environment

2. **"Token expired" errors**
   - Frontend should automatically refresh
   - Check refresh token logic
   - Verify token lifetime settings

3. **CORS errors with authentication**
   - Check CORS_ALLOWED_ORIGINS includes your frontend domain
   - Verify Authorization header is being sent
   - Check browser console for errors

Your JWT authentication system is now properly configured! 🎉 