# 🛠️ Admin Setup Guide - Math Mastery

## 📋 Step-by-Step Admin Account Creation

### Step 1: Update Database Schema
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your Math Mastery project
3. Navigate to **SQL Editor** (in the left sidebar)
4. Copy the entire content from `database_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute all the SQL commands

### Step 2: Create Your Admin Account
1. Go to your deployed Math Mastery website
2. Click **"Créer un compte"** (Create Account)
3. Fill in your details and register normally
4. Verify your email if required

### Step 3: Promote User to Admin
1. Go back to your Supabase dashboard
2. Navigate to **Authentication** → **Users** (in the left sidebar)
3. Find your user account in the list
4. Click the **"..."** (three dots) button next to your user
5. Select **"Edit user"**
6. In the **User Metadata** section, add this JSON:

```json
{
  "role": "admin"
}
```

7. Click **Save**

### Step 4: Verify Admin Access
1. Go back to your Math Mastery website
2. Log out and log back in
3. You should now see an **"Admin"** button in the header
4. Click it to access the admin panel

## 🔍 Troubleshooting

### Problem: "Admin" button doesn't appear
**Solution:**
1. Make sure you added the exact JSON: `{"role": "admin"}`
2. Log out completely and log back in
3. Check browser console for any errors

### Problem: Can't access admin panel
**Solution:**
1. Verify the user metadata was saved correctly in Supabase
2. Make sure you're logged in with the correct account
3. Clear browser cache and try again

### Problem: Page keeps loading after refresh
**Solution:**
1. This is now fixed in the updated code
2. Make sure you've deployed the latest version
3. Clear browser cache

## 📊 Admin Panel Features

Once you have admin access, you can:

### Chapters Management
- ➕ Create new chapters
- ✏️ Edit existing chapters
- 🎨 Change colors and icons
- 🗑️ Delete chapters
- 📋 Reorder chapters

### Lessons Management
- 📝 Create lessons with LaTeX support
- 👁️ Live preview of LaTeX formulas
- ✏️ Edit lesson content
- 🗑️ Delete lessons
- 📚 Organize by chapters

### Exercises Management
- 🎯 Create exercises with different difficulty levels
- 📐 Add LaTeX mathematical problems and solutions
- 👁️ Preview LaTeX rendering
- ✏️ Edit exercises
- 🗑️ Delete exercises

## 🔧 LaTeX Examples for Content

### Basic Math
```latex
$f(x) = x^2 + 2x + 1$
```

### Fractions
```latex
$\frac{a}{b} = \frac{c}{d}$
```

### Complex Formulas
```latex
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
```

### Limits
```latex
$$\lim_{x \to 0} \frac{\sin x}{x} = 1$$
```

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase database setup
3. Ensure your user has the correct admin role
4. Try logging out and back in

## 🔐 Security Notes

- Only users with `"role": "admin"` in their metadata can access admin features
- Regular students cannot see or access admin functionality
- All admin actions are protected by Row Level Security policies