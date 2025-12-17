# ChariotAI Backend Documentation

> **Version:** 1.0.0  
> **Last Updated:** December 2024  
> **Platform:** Supabase (PostgreSQL + Edge Functions)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Environment Configuration](#environment-configuration)
4. [Database Schema](#database-schema)
5. [Edge Functions API Reference](#edge-functions-api-reference)
6. [Authentication & Authorization](#authentication--authorization)
7. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
8. [Database Functions & Triggers](#database-functions--triggers)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Deployment Guide](#deployment-guide)

---

## Project Overview

ChariotAI is an AI-powered marketing platform designed for African SMEs. The application provides:

- **AI Marketing Copy Generation** - Generate sales copy using legendary copywriter styles
- **AI Image Generation** - Create product marketing images
- **Content Marketing** - Platform-specific content for WhatsApp, Instagram, TikTok
- **AI Brainstorming** - Generate product, marketing, and content ideas
- **AI Chat Assistant** - Real-time marketing advice and support

### Target Market
- African SME business owners
- Mobile-first users (PWA implementation)
- Time-critical marketing needs

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL (Supabase) |
| Backend Runtime | Deno (Supabase Edge Functions) |
| AI Gateway | Lovable AI Gateway (Google Gemini 2.5 Flash) |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Frontend | React + TypeScript + Vite |

---

## Environment Configuration

### Required Secrets

These secrets must be configured in Supabase Edge Functions settings:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `LOVABLE_API_KEY` | API key for Lovable AI Gateway | ✅ Yes |
| `SUPABASE_URL` | Supabase project URL | ✅ Auto-provisioned |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ Auto-provisioned |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ Auto-provisioned |
| `OPENAI_API_KEY` | OpenAI API key (legacy/backup) | ⚪ Optional |

### Supabase Project Configuration

```
Project ID: eoazvnwiobtzzrdxjfzr
Region: [Your region]
```

---

## Database Schema

### Core Tables

#### `products`
Stores user products for marketing campaigns.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | - | Owner user ID |
| `name` | text | No | - | Product name |
| `description` | text | No | - | Product description |
| `image_url` | text | Yes | - | Product image URL |
| `ad_copy` | text | Yes | - | Generated ad copy |
| `status` | text | Yes | `'Draft'` | Product status |
| `deleted` | boolean | Yes | `false` | Soft delete flag |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

#### `generated_copy`
Stores AI-generated marketing copy.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | - | Owner user ID |
| `product_id` | uuid | Yes | - | Associated product |
| `product_name` | text | No | - | Product name |
| `product_description` | text | No | - | Product description |
| `copywriter_style` | text | No | - | Copywriter/framework used |
| `generated_content` | jsonb | No | - | Generated copy content |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |

#### `generated_images`
Stores AI-generated marketing images.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | - | Owner user ID |
| `product_id` | uuid | Yes | - | Associated product |
| `prompt` | text | No | - | Generation prompt |
| `image_url` | text | No | - | Generated image URL |
| `style` | text | Yes | - | Image style |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |

#### `user_profiles`
Extended user profile information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `user_id` | uuid | No | - | Primary key (references auth.users) |
| `full_name` | text | Yes | - | User's full name |
| `company` | text | Yes | - | Company name |
| `job_title` | text | Yes | - | Job title |
| `phone` | text | Yes | - | Phone number |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

#### `user_roles`
User role assignments for RBAC.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | - | User ID |
| `role` | app_role | No | - | Role enum (admin/moderator/user) |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |

#### `campaigns`
Marketing campaign management.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | - | Owner user ID |
| `product_id` | uuid | No | - | Associated product |
| `name` | text | No | - | Campaign name |
| `platform` | text | No | - | Target platform |
| `budget` | numeric | Yes | - | Campaign budget |
| `status` | text | Yes | `'Draft'` | Campaign status |
| `meta_data` | jsonb | Yes | `'{}'` | Additional metadata |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `updated_at` | timestamptz | No | `now()` | Last update timestamp |

#### `ai_chat_messages`
AI assistant chat history.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | Yes | - | User ID (nullable for anonymous) |
| `session_id` | text | No | - | Chat session identifier |
| `message` | text | No | - | Message content |
| `is_user` | boolean | No | `true` | True if user message, false if AI |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |

#### `platform_connections`
External platform integrations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | - | Owner user ID |
| `platform` | text | No | - | Platform name |
| `credentials` | jsonb | No | `'{}'` | Encrypted credentials |
| `connected` | boolean | No | `false` | Connection status |
| `created_at` | timestamptz | No | `now()` | Creation timestamp |
| `last_updated` | timestamptz | No | `now()` | Last update timestamp |

### Enums

#### `app_role`
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

---

## Edge Functions API Reference

### Base URL
```
https://eoazvnwiobtzzrdxjfzr.supabase.co/functions/v1
```

### Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <supabase_access_token>
```

### CORS Headers
All functions include:
```typescript
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}
```

---

### 1. Chat API

**Endpoint:** `POST /chat`  
**Authentication:** Required (JWT)  
**Streaming:** Yes (SSE)

#### Description
Real-time AI marketing assistant for chat interactions.

#### Request Body
```typescript
{
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>
}
```

#### Response
Server-Sent Events (SSE) stream with OpenAI-compatible format:
```
data: {"choices":[{"delta":{"content":"Hello"},"index":0}]}
data: {"choices":[{"delta":{"content":" there!"},"index":0}]}
data: [DONE]
```

#### Error Responses
| Status | Description |
|--------|-------------|
| 402 | Payment required - add funds to Lovable AI workspace |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

#### Example
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: "How do I improve my ad copy?" }]
  })
});
```

---

### 2. Generate Copy API

**Endpoint:** `POST /generate-copy`  
**Authentication:** Required (JWT)

#### Description
Generates marketing copy using various copywriter styles and frameworks.

#### Request Body
```typescript
{
  productName: string;        // Required
  productDescription: string; // Required
  mode?: "guided" | "kenny" | "expert"; // Default: "guided"
  copywriter?: string;        // Required for "expert" mode
  targetAudience?: string;    // Optional
  uniqueValue?: string;       // Optional
}
```

#### Copy Generation Modes

| Mode | Description |
|------|-------------|
| `guided` | Uses 5 proven frameworks (AIDA, PAS, Storytelling, Direct, Scarcity) |
| `kenny` | Emulates Kenny Nwokoye's Nigerian direct marketing style |
| `expert` | Emulates specified legendary copywriter's style |

#### Supported Frameworks (Guided Mode)
- **AIDA** - Attention, Interest, Desire, Action
- **PAS** - Problem, Agitate, Solution
- **Storytelling** - Narrative-driven approach
- **Direct Offer** - Straightforward value proposition
- **Scarcity & Authority** - Urgency and social proof

#### Response
```typescript
{
  content: string; // Generated marketing copy in markdown format
}
```

#### Example
```typescript
const response = await supabase.functions.invoke('generate-copy', {
  body: {
    productName: "Premium Coffee Blend",
    productDescription: "Single-origin Ethiopian coffee beans",
    mode: "expert",
    copywriter: "David Ogilvy",
    targetAudience: "Coffee enthusiasts aged 25-45"
  }
});
```

---

### 3. Generate Image API

**Endpoint:** `POST /generate-image`  
**Authentication:** Required (JWT)

#### Description
Generates or refines marketing images using AI.

#### Request Body
```typescript
{
  prompt: string;    // Required - image generation prompt
  imageUrl?: string; // Optional - base image URL for refinement
}
```

#### Response
```typescript
{
  imageUrl: string; // Base64 data URL of generated image
}
```

#### Example
```typescript
// Generate new image
const response = await supabase.functions.invoke('generate-image', {
  body: {
    prompt: "Professional product photo of coffee beans on marble surface, warm lighting"
  }
});

// Refine existing image
const response = await supabase.functions.invoke('generate-image', {
  body: {
    prompt: "Make the lighting warmer and add a steam effect",
    imageUrl: "https://example.com/existing-image.jpg"
  }
});
```

---

### 4. Generate Content Marketing API

**Endpoint:** `POST /generate-content-marketing`  
**Authentication:** Required (JWT)

#### Description
Generates platform-specific marketing content for social media.

#### Request Body
```typescript
{
  productDescription: string; // Required
  platform: "whatsapp" | "instagram" | "tiktok"; // Required
  targetAudience?: string;    // Optional
  contentGoal?: string;       // Optional
}
```

#### Platform Content Types

**WhatsApp:**
- Broadcast messages
- Follow-up message series
- Status updates
- Response templates

**Instagram:**
- Feed posts with hashtags
- Story sequences with engagement stickers
- Reel scripts
- Carousel post outlines

**TikTok:**
- Viral video scripts
- Content frameworks
- Engagement tactics

#### Response
```typescript
{
  content: string; // Generated content in markdown format
}
```

#### Example
```typescript
const response = await supabase.functions.invoke('generate-content-marketing', {
  body: {
    productDescription: "Organic skincare line for sensitive skin",
    platform: "instagram",
    targetAudience: "Women 25-40 interested in clean beauty",
    contentGoal: "Increase engagement and drive traffic to product page"
  }
});
```

---

### 5. Generate Brainstorm API

**Endpoint:** `POST /generate-brainstorm`  
**Authentication:** Required (JWT)

#### Description
Generates structured brainstorming ideas for products, marketing, or content.

#### Request Body
```typescript
{
  topic: string;       // Required - brainstorm topic
  context?: string;    // Optional - additional context
  brainstormType: "product" | "marketing" | "content"; // Required
}
```

#### Response
```typescript
{
  ideas: Array<{
    title: string;       // Idea title
    description: string; // Detailed description
    potential: string;   // Market viability/success factors
  }>
}
```

#### Example
```typescript
const response = await supabase.functions.invoke('generate-brainstorm', {
  body: {
    topic: "Sustainable packaging solutions for e-commerce",
    context: "Target market is eco-conscious millennials in urban areas",
    brainstormType: "product"
  }
});
```

---

## Authentication & Authorization

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. JWT token is issued and stored client-side
3. Token is included in all API requests
4. Edge functions validate token automatically

### User Registration Trigger
When a new user registers, the following happens automatically:
1. `handle_new_user()` trigger creates a `user_profiles` record
2. `handle_new_user_role()` trigger assigns default 'user' role

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| `user` | CRUD own data, access AI features |
| `moderator` | User permissions + moderate content |
| `admin` | Full access to all data and features |

### Helper Functions

#### `has_role(user_id, role)`
Checks if a user has a specific role.
```sql
SELECT public.has_role(auth.uid(), 'admin');
```

#### `is_admin()`
Shorthand to check if current user is admin.
```sql
SELECT public.is_admin();
```

---

## Row-Level Security (RLS) Policies

All tables have RLS enabled. Key policies:

### User-Owned Data (products, campaigns, generated_copy, etc.)
```sql
-- SELECT: Users can view their own data
USING (auth.uid() = user_id)

-- INSERT: Users can create their own data
WITH CHECK (auth.uid() = user_id)

-- UPDATE: Users can update their own data
USING (auth.uid() = user_id)

-- DELETE: Users can delete their own data
USING (auth.uid() = user_id)
```

### Admin Access (agent_templates, user_roles)
```sql
-- ALL: Admins can manage
USING (is_admin())
WITH CHECK (is_admin())
```

### Related Data (sales_letters)
```sql
-- Access through parent relationship
USING (EXISTS (
  SELECT 1 FROM products 
  WHERE products.id = sales_letters.product_id 
  AND products.user_id = auth.uid()
))
```

---

## Database Functions & Triggers

### `handle_new_user()`
**Trigger:** After INSERT on `auth.users`  
Creates user profile automatically on registration.

### `handle_new_user_role()`
**Trigger:** After INSERT on `auth.users`  
Assigns default 'user' role to new users.

### `update_updated_at_column()`
**Trigger:** Before UPDATE on various tables  
Automatically updates `updated_at` timestamp.

### `log_copy_generation()`
Logs copy generation to `sales_letters` table.

---

## Error Handling

### Standard Error Response
```typescript
{
  error: string; // Human-readable error message
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 402 | Payment Required - AI credits exhausted |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

### Error Handling Best Practices
```typescript
try {
  const { data, error } = await supabase.functions.invoke('function-name', {
    body: requestBody
  });
  
  if (error) {
    if (error.message.includes('Rate limit')) {
      // Handle rate limiting
    } else if (error.message.includes('Payment')) {
      // Handle payment required
    }
    throw error;
  }
  
  return data;
} catch (error) {
  console.error('Function error:', error);
  // Handle error appropriately
}
```

---

## Rate Limiting

### Lovable AI Gateway Limits
- Requests per minute: Workspace-dependent
- Upgrade path: Free → Paid plan for higher limits
- Contact support@lovable.dev for enterprise limits

### Handling Rate Limits
```typescript
if (response.status === 429) {
  // Implement exponential backoff
  await new Promise(r => setTimeout(r, retryDelay));
  retryDelay *= 2;
}
```

---

## Deployment Guide

### Edge Functions Deployment
Edge functions are automatically deployed when code is pushed to the repository.

### Configuration File
Location: `supabase/config.toml`

```toml
project_id = "eoazvnwiobtzzrdxjfzr"

[functions.chat]
verify_jwt = true

[functions.generate-image]
verify_jwt = true

[functions.generate-copy]
verify_jwt = true

[functions.generate-content-marketing]
verify_jwt = true

[functions.generate-brainstorm]
verify_jwt = true
```

### Monitoring & Logs

#### Edge Function Logs
Access via Supabase Dashboard:
```
https://supabase.com/dashboard/project/eoazvnwiobtzzrdxjfzr/functions/{function-name}/logs
```

#### Database Logs
```sql
SELECT * FROM postgres_logs ORDER BY timestamp DESC LIMIT 100;
```

---

## Appendix

### API Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/chat` | POST | ✅ | AI chat assistant (streaming) |
| `/generate-copy` | POST | ✅ | Generate marketing copy |
| `/generate-image` | POST | ✅ | Generate/refine images |
| `/generate-content-marketing` | POST | ✅ | Platform-specific content |
| `/generate-brainstorm` | POST | ✅ | Generate brainstorm ideas |

### Useful Links
- [Supabase Dashboard](https://supabase.com/dashboard/project/eoazvnwiobtzzrdxjfzr)
- [Edge Function Logs](https://supabase.com/dashboard/project/eoazvnwiobtzzrdxjfzr/functions)
- [Database Tables](https://supabase.com/dashboard/project/eoazvnwiobtzzrdxjfzr/editor)
- [Auth Users](https://supabase.com/dashboard/project/eoazvnwiobtzzrdxjfzr/auth/users)
- [Secrets Management](https://supabase.com/dashboard/project/eoazvnwiobtzzrdxjfzr/settings/functions)

---

*For support or questions, contact the development team.*
