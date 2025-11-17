# 🚀 Quick Hosting Setup Examples

## Option 1: GitHub Pages + jsDelivr (FREE)

### Step 1: Create GitHub Repository

```bash
# Create new repo
mkdir swap-bridge-widget-cdn
cd swap-bridge-widget-cdn
git init

# Copy your files
cp ../widget-distribution/* .
git add .
git commit -m "Initial widget release"

# Push to GitHub
git remote add origin https://github.com/YOURUSERNAME/swap-bridge-widget-cdn.git
git push -u origin main

# Create a release tag
git tag v1.0.0
git push --tags
```

### Step 2: Access via CDN

Your widget will be available at:

```
https://cdn.jsdelivr.net/gh/YOURUSERNAME/swap-bridge-widget-cdn@v1.0.0/swap-bridge-widget.js
https://cdn.jsdelivr.net/gh/YOURUSERNAME/swap-bridge-widget-cdn@v1.0.0/swap-bridge-widget.css
```

---

## Option 2: Netlify (FREE)

### Step 1: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag your `widget-distribution` folder to the deploy area
3. Your site gets a URL like `https://amazing-widget-123.netlify.app`

### Step 2: Access Your Widget

```
https://amazing-widget-123.netlify.app/swap-bridge-widget.js
https://amazing-widget-123.netlify.app/swap-bridge-widget.css
```

---

## Option 3: Vercel (FREE)

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd widget-distribution
vercel

# Follow prompts, get URL like: https://swap-bridge-widget-abc123.vercel.app
```

### Step 2: Access Your Widget

```
https://swap-bridge-widget-abc123.vercel.app/swap-bridge-widget.js
https://swap-bridge-widget-abc123.vercel.app/swap-bridge-widget.css
```

---

## Option 4: AWS S3 + CloudFront

### Step 1: Upload to S3

```bash
# Create S3 bucket
aws s3 mb s3://your-widget-bucket

# Upload files
aws s3 cp widget-distribution/ s3://your-widget-bucket/ --recursive

# Make public
aws s3api put-bucket-policy --bucket your-widget-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-widget-bucket/*"
    }
  ]
}'
```

### Step 2: Set up CloudFront

1. Create CloudFront distribution
2. Set origin to your S3 bucket
3. Enable CORS headers

---

## Option 5: Self-Hosting

### Apache (.htaccess)

```apache
# Add CORS headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type"

# Cache static files
<FilesMatch "\.(js|css)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</FilesMatch>
```

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /widgets/ {
        root /var/www/html;

        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'Content-Type';

        # Cache headers
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🌍 Integration Example

Once hosted, anyone can use your widget:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website with Swap Widget</title>
    <link rel="stylesheet" href="https://YOUR-CDN-URL/swap-bridge-widget.css" />
  </head>
  <body>
    <h1>My DeFi Website</h1>

    <!-- Your widget here -->
    <div id="swap-widget" style="max-width: 400px; margin: 20px auto;"></div>

    <!-- React Dependencies -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <!-- Your Widget -->
    <script src="https://YOUR-CDN-URL/swap-bridge-widget.js"></script>

    <script>
      ReactDOM.render(
        SwapBridgeWidget.default({
          initialTab: "swap",
          theme: {
            container: {
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            },
          },
        }),
        document.getElementById("swap-widget")
      );
    </script>
  </body>
</html>
```

## 📋 Quick Start Checklist

- [ ] ✅ Files prepared in `widget-distribution/`
- [ ] 🌐 Choose hosting platform
- [ ] 📤 Upload widget files
- [ ] 🔗 Get CDN URLs
- [ ] 🧪 Test integration on sample page
- [ ] 📚 Share integration docs with users
- [ ] 🎯 Ready for production!

## 🔄 Updating Your Widget

When you update your widget:

1. **Build new version:** `npm run build`
2. **Prepare files:** `./prepare-deployment.sh`
3. **Upload to hosting:** Replace the files
4. **Version tags:** Create new Git tags for CDN caching

Your widget is now globally accessible! 🌟
