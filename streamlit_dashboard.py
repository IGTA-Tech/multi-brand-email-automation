"""
Multi-Brand Email Automation - Streamlit Dashboard
Quick dashboard for monitoring campaigns and creating new ones

Deploy to Streamlit Cloud in 5 minutes!
"""

import streamlit as st
import pandas as pd
import requests
from datetime import datetime, timedelta
import json

# Page config
st.set_page_config(
    page_title="Email Automation Dashboard",
    page_icon="📧",
    layout="wide"
)

# Title
st.title("📧 Multi-Brand Email Automation Dashboard")
st.markdown("---")

# Sidebar - Configuration
with st.sidebar:
    st.header("⚙️ Configuration")

    # n8n webhook URL
    n8n_webhook = st.text_input(
        "n8n Webhook URL",
        value="https://your-n8n.com/webhook/campaign-init",
        type="password"
    )

    # Google Sheets ID
    sheets_id = st.text_input(
        "Google Sheets ID",
        value="your-sheet-id",
        type="password"
    )

    st.markdown("---")
    st.caption("🔒 Credentials stored in session only")

# Tabs
tab1, tab2, tab3, tab4 = st.tabs(["📊 Dashboard", "🚀 Create Campaign", "📋 Campaigns", "👥 Contacts"])

# TAB 1: Dashboard
with tab1:
    st.header("Campaign Performance Overview")

    # Metrics row
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            label="📨 Emails Sent Today",
            value="127",
            delta="+15 from yesterday"
        )

    with col2:
        st.metric(
            label="📬 Open Rate",
            value="32.5%",
            delta="+2.3%"
        )

    with col3:
        st.metric(
            label="🖱️ Click Rate",
            value="4.8%",
            delta="+0.5%"
        )

    with col4:
        st.metric(
            label="💬 Reply Rate",
            value="2.1%",
            delta="+0.3%"
        )

    st.markdown("---")

    # Charts
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("📈 Emails Sent (Last 7 Days)")
        # Sample data
        chart_data = pd.DataFrame({
            'Date': pd.date_range(end=datetime.now(), periods=7),
            'Emails Sent': [45, 62, 58, 71, 83, 95, 127]
        })
        st.line_chart(chart_data.set_index('Date'))

    with col2:
        st.subheader("📊 Engagement by Brand")
        brand_data = pd.DataFrame({
            'Brand': ['Sherrod Sports', 'IGT', 'Aventus', 'Camino'],
            'Open Rate': [35, 42, 28, 31],
            'Click Rate': [5.2, 6.8, 3.9, 4.1]
        })
        st.bar_chart(brand_data.set_index('Brand'))

    # Recent activity
    st.markdown("---")
    st.subheader("📋 Recent Activity")

    recent_activity = pd.DataFrame({
        'Time': ['2 min ago', '15 min ago', '1 hour ago', '2 hours ago'],
        'Event': [
            '📬 Email opened',
            '🚀 Campaign started',
            '🖱️ Link clicked',
            '📨 Email sent'
        ],
        'Details': [
            'John Smith - Sherrod Sports',
            'October Follow-Up - 50 contacts',
            'Jane Doe - Payment link',
            'Mike Johnson - IGT'
        ]
    })
    st.dataframe(recent_activity, use_container_width=True, hide_index=True)

# TAB 2: Create Campaign
with tab2:
    st.header("🚀 Create New Campaign")

    with st.form("create_campaign"):
        col1, col2 = st.columns(2)

        with col1:
            campaign_name = st.text_input(
                "Campaign Name",
                placeholder="e.g., October Follow-Up"
            )

            brand = st.selectbox(
                "Brand",
                options=[
                    "sherrod-sports-visas",
                    "innovative-global-talent",
                    "aventus-visa-agents",
                    "camino-immigration"
                ],
                format_func=lambda x: x.replace("-", " ").title()
            )

            message_mode = st.selectbox(
                "Message Generation",
                options=["claude_ai", "template", "manual"],
                format_func=lambda x: {
                    "claude_ai": "🤖 AI-Generated (Claude)",
                    "template": "📝 Template",
                    "manual": "✍️ Manual"
                }[x]
            )

        with col2:
            delivery_mode = st.selectbox(
                "Delivery Mode",
                options=["immediate", "scheduled", "drip"],
                format_func=lambda x: x.capitalize()
            )

            if delivery_mode == "scheduled":
                scheduled_time = st.datetime_input(
                    "Schedule For",
                    value=datetime.now() + timedelta(hours=1)
                )

            campaign_type = st.selectbox(
                "Campaign Type",
                options=["promotional", "follow_up", "educational", "transactional"]
            )

        # Contact selection
        st.markdown("---")
        st.subheader("👥 Select Contacts")

        # Filter options
        filter_col1, filter_col2, filter_col3 = st.columns(3)

        with filter_col1:
            lead_status = st.multiselect(
                "Lead Status",
                options=["Hot", "Warm", "Cold"],
                default=["Hot", "Warm"]
            )

        with filter_col2:
            min_score = st.slider(
                "Minimum Lead Score",
                min_value=0,
                max_value=10,
                value=5
            )

        with filter_col3:
            min_engagement = st.slider(
                "Minimum Engagement",
                min_value=0,
                max_value=100,
                value=30
            )

        # Preview
        st.info(f"📊 Estimated recipients: **45 contacts** matching criteria")

        # Manual override
        manual_contacts = st.text_area(
            "Or enter Contact IDs manually (comma-separated)",
            placeholder="CONT-001, CONT-002, CONT-003"
        )

        # Submit
        col1, col2, col3 = st.columns([1, 1, 2])
        with col1:
            submit = st.form_submit_button("🚀 Create Campaign", type="primary", use_container_width=True)
        with col2:
            preview = st.form_submit_button("👁️ Preview", use_container_width=True)

        if submit:
            with st.spinner("Creating campaign..."):
                # Prepare payload
                payload = {
                    "campaignName": campaign_name,
                    "brandId": brand,
                    "messageMode": message_mode,
                    "deliveryMode": delivery_mode,
                    "campaignType": campaign_type,
                    "contactIds": manual_contacts.split(",") if manual_contacts else [],
                    "createdBy": "streamlit-dashboard"
                }

                if delivery_mode == "scheduled":
                    payload["scheduledFor"] = scheduled_time.isoformat()

                # Call n8n webhook
                try:
                    # This would actually call your n8n webhook
                    # response = requests.post(n8n_webhook, json=payload)

                    # Simulated success
                    st.success(f"✅ Campaign '{campaign_name}' created successfully!")
                    st.json(payload)
                    st.balloons()
                except Exception as e:
                    st.error(f"❌ Error creating campaign: {str(e)}")

        if preview:
            st.info("👁️ Preview mode - showing what would be sent")
            st.json({
                "campaign": campaign_name,
                "brand": brand,
                "mode": message_mode,
                "delivery": delivery_mode,
                "type": campaign_type
            })

# TAB 3: Campaigns
with tab3:
    st.header("📋 Campaign List")

    # Filters
    filter_col1, filter_col2, filter_col3 = st.columns(3)

    with filter_col1:
        status_filter = st.multiselect(
            "Status",
            options=["Scheduled", "Running", "Completed", "Paused"],
            default=["Running", "Scheduled"]
        )

    with filter_col2:
        brand_filter = st.multiselect(
            "Brand",
            options=["Sherrod Sports", "IGT", "Aventus", "Camino"]
        )

    with filter_col3:
        date_range = st.date_input(
            "Date Range",
            value=(datetime.now() - timedelta(days=7), datetime.now())
        )

    # Sample campaigns data
    campaigns = pd.DataFrame({
        'Campaign': [
            'October Follow-Up',
            'New Lead Welcome',
            'Payment Reminder',
            'Case Update',
            'Consultation Invite'
        ],
        'Brand': [
            'Sherrod Sports',
            'IGT',
            'Aventus',
            'Camino',
            'Sherrod Sports'
        ],
        'Status': [
            'Running',
            'Completed',
            'Scheduled',
            'Completed',
            'Running'
        ],
        'Recipients': [50, 120, 35, 89, 42],
        'Sent': [23, 120, 0, 89, 18],
        'Opens': [12, 87, 0, 62, 9],
        'Clicks': [3, 24, 0, 15, 2],
        'Created': [
            '2024-10-22',
            '2024-10-20',
            '2024-10-23',
            '2024-10-19',
            '2024-10-22'
        ]
    })

    # Add calculated columns
    campaigns['Open Rate'] = (campaigns['Opens'] / campaigns['Sent'].replace(0, 1) * 100).round(1).astype(str) + '%'
    campaigns['Click Rate'] = (campaigns['Clicks'] / campaigns['Sent'].replace(0, 1) * 100).round(1).astype(str) + '%'

    st.dataframe(
        campaigns,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Status": st.column_config.SelectboxColumn(
                "Status",
                options=["Scheduled", "Running", "Completed", "Paused"]
            )
        }
    )

    # Campaign actions
    st.markdown("---")
    selected_campaign = st.selectbox(
        "Select campaign for actions",
        options=campaigns['Campaign'].tolist()
    )

    action_col1, action_col2, action_col3, action_col4 = st.columns(4)

    with action_col1:
        if st.button("▶️ Resume", use_container_width=True):
            st.success(f"Resumed: {selected_campaign}")

    with action_col2:
        if st.button("⏸️ Pause", use_container_width=True):
            st.warning(f"Paused: {selected_campaign}")

    with action_col3:
        if st.button("📊 Analytics", use_container_width=True):
            st.info(f"Showing analytics for: {selected_campaign}")

    with action_col4:
        if st.button("🗑️ Delete", use_container_width=True):
            st.error(f"Deleted: {selected_campaign}")

# TAB 4: Contacts
with tab4:
    st.header("👥 Contact Management")

    # Summary metrics
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Total Contacts", "1,247")

    with col2:
        st.metric("Hot Leads", "89", "+12")

    with col3:
        st.metric("Avg Engagement", "45%", "+3%")

    with col4:
        st.metric("Opt-Outs", "23", "-2")

    st.markdown("---")

    # Filters
    filter_col1, filter_col2, filter_col3 = st.columns(3)

    with filter_col1:
        search = st.text_input("🔍 Search", placeholder="Name or email...")

    with filter_col2:
        lead_filter = st.multiselect(
            "Lead Status",
            options=["Hot", "Warm", "Cold", "Inactive"]
        )

    with filter_col3:
        brand_filter = st.multiselect(
            "Associated Brand",
            options=["Sherrod Sports", "IGT", "Aventus", "Camino"]
        )

    # Sample contacts
    contacts = pd.DataFrame({
        'Name': ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'Tom Brown'],
        'Email': ['john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com', 'tom@example.com'],
        'Lead Status': ['Hot', 'Warm', 'Hot', 'Cold', 'Warm'],
        'Lead Score': [8, 6, 9, 3, 7],
        'Engagement': ['75%', '52%', '88%', '15%', '61%'],
        'Last Contact': ['2 days ago', '5 days ago', '1 day ago', '30 days ago', '7 days ago'],
        'Total Emails': [12, 8, 15, 23, 10],
        'Opens': [9, 5, 14, 2, 7]
    })

    st.dataframe(
        contacts,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Lead Status": st.column_config.SelectboxColumn(
                "Lead Status",
                options=["Hot", "Warm", "Cold", "Inactive"]
            ),
            "Lead Score": st.column_config.ProgressColumn(
                "Lead Score",
                min_value=0,
                max_value=10
            )
        }
    )

    # Contact actions
    st.markdown("---")
    st.subheader("Quick Actions")

    action_col1, action_col2, action_col3 = st.columns(3)

    with action_col1:
        if st.button("➕ Add Contact", use_container_width=True):
            st.info("Add contact form would appear here")

    with action_col2:
        if st.button("📤 Export CSV", use_container_width=True):
            st.success("Contacts exported!")

    with action_col3:
        if st.button("📥 Import CSV", use_container_width=True):
            st.info("Import dialog would appear here")

# Footer
st.markdown("---")
st.caption("📧 Multi-Brand Email Automation System | Built with Claude & Streamlit | [Documentation](./docs)")
