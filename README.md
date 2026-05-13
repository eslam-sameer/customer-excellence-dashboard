# Customer Excellence Dashboard

## Overview
An interactive, real-time analytics dashboard for monitoring customer service performance metrics including CSAT, call center operations, ticket management, and agent performance.

## Features

### 📊 Data Management
- **File Upload**: Upload CSV/Excel files (Call Center, CSAT, Ticket, Agent data)
- **Manual Entry**: Enter data directly via form
- **Persistent Storage**: Uses IndexedDB to save all data locally
- **Historical Data**: Retains all historical data with cumulative updates

### 🎯 Analytics & Metrics
- **CSAT Analysis**: Conversations, satisfaction rates, star ratings
- **Call Operations**: Inbound/outbound calls, abandonment tracking, SLA compliance
- **Ticket Management**: Resolution rates, FCR, ticket age, survey metrics
- **Agent Performance**: Interaction volume, response quality, efficiency scores
- **Category Analysis**: Business and individual case breakdowns

### 📈 Visualizations
- CSAT volume trends
- Call activity distribution
- SLA compliance tracking
- Ticket status breakdown
- Category performance charts
- Agent leaderboard
- Response time analysis

### 🔍 Filtering & Analysis
- Date range selection
- Agent filtering
- Category filtering
- Status filtering
- Real-time metric recalculation

## Getting Started

1. **Open the Dashboard**: Open `index.html` in any modern web browser
2. **Upload Data**: Click "📤 Upload Data" to add CSV files or enter data manually
3. **Filter**: Use date range, agent, and category filters to analyze specific data
4. **View Metrics**: KPIs and detailed metrics update in real-time
5. **Charts**: 8 interactive charts visualize your performance data

## Data Formats Supported

### Call Center CSV
```csv
Day,Inbound Calls,Outbound Calls,Abandoned Calls,SLA
5/8/2026,25,20,0,84.60%
5/9/2026,15,39,0,100%
```

### Business Categories CSV
```csv
Business Case Type,Business : Sub-Category,Total Tickets
Business Profile Related,My Whizmo IBAN,1
General Questions/ Feedback,General Enquiry/ Feedback,1
```

### Individual Categories CSV
```csv
Individual Case Type,Individual : Sub-Category,Total Tickets
International Transfers,Transaction Related,35
Transfer to Bank,Transaction Related,25
```

### Agent Performance CSV
```csv
Agent name,Total Agent interaction,Total Private notes by agent,Total Agent responses
Abdallah Alhaddad,73,46,27
Abdul Cheriya,122,98,24
```

## Key Metrics Displayed

**KPI Cards:**
- Total Conversations
- Satisfactory Conversations
- Unsatisfactory Conversations
- Average Star Rating
- CSAT Score
- Total Calls

**Performance Metrics:**
- Ticket Management (Total, Resolved, Unresolved, FCR, Reopened)
- Response Times (Wait, First Response, Response, Interaction, Resolution)
- Call Operations (Inbound, Outbound, Abandoned, SLA, Abandonment Rate)

**Agent Performance:**
- Top 10 agents by interaction volume
- Response rates
- Efficiency scores

## Browser Requirements
- Chrome, Firefox, Safari, Edge (latest versions)
- JavaScript enabled
- IndexedDB support (for data persistence)

## Data Storage
✅ All data is stored locally in your browser using IndexedDB
✅ Data persists between sessions
✅ Data accumulates without overwriting historical records
✅ No data is sent to external servers

## Features
- ✅ Interactive charts (8 visualizations)
- ✅ Real-time KPI calculations
- ✅ Agent leaderboard
- ✅ Multi-filter capability
- ✅ Persistent local storage
- ✅ Responsive design (mobile-friendly)
- ✅ Upload history tracking
- ⏳ Export to PDF/Excel (coming soon)

## How to Use

### Uploading Data
1. Click **"📤 Upload Data"** button
2. Choose **"File Upload"** or **"Manual Entry"** tab
3. For files: Drag & drop CSV files or click to browse
4. For manual entry: Fill in the form fields and click "Save Data"
5. Dashboard updates automatically

### Filtering Data
1. Select a **Date Range** using the date pickers
2. (Optional) Filter by **Agent**, **Category**, or **Status**
3. Click **"🔄 Reset"** to clear all filters
4. Charts and metrics update in real-time

### Viewing Reports
- **KPI Cards**: Quick overview of key metrics
- **Charts**: 8 interactive visualizations
- **Detailed Metrics**: Ticket management, response times, call operations
- **Agent Table**: Performance leaderboard
- **Upload History**: Track data imports

## Supported File Types
- CSV (*.csv)
- Excel (*.xlsx, *.xls)

## Support
For issues or feature requests, please contact the development team.

---

© 2026 Customer Excellence Dashboard | Built with ❤️ for Customer Service Excellence