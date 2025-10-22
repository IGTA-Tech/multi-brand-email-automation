# Deploy Streamlit Dashboard in 10 Minutes

## 🚀 Quick Deploy to Streamlit Cloud (FREE)

### Step 1: Test Locally (2 minutes)

```bash
cd /home/innovativeautomations/multi-brand-email-automation

# Install Streamlit
pip install streamlit pandas requests

# Run the dashboard
streamlit run streamlit_dashboard.py
```

Open your browser to `http://localhost:8501` - you should see the dashboard!

### Step 2: Create requirements.txt

```bash
cat > requirements.txt << EOF
streamlit==1.28.0
pandas==2.1.0
requests==2.31.0
EOF
```

### Step 3: Push to GitHub (3 minutes)

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Add Streamlit dashboard"

# Create GitHub repo and push
gh repo create multi-brand-email-automation --public
git remote add origin https://github.com/YOUR_USERNAME/multi-brand-email-automation.git
git push -u origin main
```

### Step 4: Deploy to Streamlit Cloud (5 minutes)

1. Go to https://streamlit.io/cloud
2. Sign in with GitHub
3. Click "New app"
4. Select:
   - Repository: `multi-brand-email-automation`
   - Branch: `main`
   - Main file: `streamlit_dashboard.py`
5. Click "Deploy!"

**That's it!** Your dashboard will be live at: `https://your-app-name.streamlit.app`

---

## 🔗 Connect to Your n8n Instance

Once deployed, update these in the dashboard sidebar:
- n8n Webhook URL: Your n8n campaign creation webhook
- Google Sheets ID: Your master spreadsheet ID

---

## 📊 What the Dashboard Includes

✅ **Dashboard Tab**: Campaign metrics, charts, recent activity
✅ **Create Campaign Tab**: Full campaign creation form
✅ **Campaigns Tab**: List all campaigns with filters
✅ **Contacts Tab**: Contact management and search

---

## 🎨 Customize for Your Brands

Edit `streamlit_dashboard.py`:

```python
# Line 95: Update brand list
brand = st.selectbox(
    "Brand",
    options=[
        "your-brand-1",
        "your-brand-2",
        # Add your brands here
    ]
)
```

---

## 🔒 Security Note

For production:
1. Use Streamlit secrets for sensitive data
2. Add authentication (Streamlit has built-in auth)
3. Restrict access to specific users

Create `.streamlit/secrets.toml`:
```toml
n8n_webhook = "https://your-n8n.com/webhook/campaign-init"
sheets_id = "your-sheet-id"
```

---

## 💡 Next Steps

1. Deploy core n8n automation first
2. Deploy this Streamlit dashboard
3. Connect them via webhooks
4. Start creating campaigns!

**Total cost: $0** (Streamlit Cloud free tier)
