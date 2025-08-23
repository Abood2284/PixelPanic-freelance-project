# Development Setup Guide

## Multi-Role Development Environment

This project supports development across multiple user roles (Technician, Admin, User) without requiring separate login sessions.

### Quick Setup

1. **Create `.env.local` file:**

```bash
# Copy from .env.local.example or create manually
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_DEV_ROLE=technician
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```

2. **Available Roles:**

- `technician` - Access technician dashboard and gig management
- `admin` - Access admin dashboard and system management
- `user` - Access customer-facing features

3. **Switch Roles:**

- Use the role switcher component (bottom-right corner in dev mode)
- Or change `NEXT_PUBLIC_DEV_ROLE` in `.env.local` and restart dev server

### Development Workflow

#### For Technician Development:

```bash
NEXT_PUBLIC_DEV_ROLE=technician
# Access: /technician
```

#### For Admin Development:

```bash
NEXT_PUBLIC_DEV_ROLE=admin
# Access: /admin
```

#### For User/Customer Development:

```bash
NEXT_PUBLIC_DEV_ROLE=user
# Access: / (main landing page)
```

### Features

- **Role Switcher**: Visual component to switch between roles
- **Auth Middleware**: Handles both dev and production auth
- **Mock Data**: Pre-configured user data for each role
- **No Login Required**: Skip authentication during development

### Production Deployment

When deploying to production:

1. Set `NEXT_PUBLIC_DEV_MODE=false`
2. Remove or comment out `NEXT_PUBLIC_DEV_ROLE`
3. Ensure proper authentication is in place

### Troubleshooting

- **Role switcher not visible**: Check `NEXT_PUBLIC_DEV_MODE=true`
- **Auth errors**: Verify `NEXT_PUBLIC_DEV_ROLE` is set correctly
- **API calls failing**: Ensure `NEXT_PUBLIC_API_BASE_URL` points to your worker
