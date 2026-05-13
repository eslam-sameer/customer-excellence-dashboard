class Dashboard {
  constructor() {
    this.dataProcessor = new DataProcessor();
    this.filters = {};
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadInitialData();
    this.setDefaultDateRange();
  }

  attachEventListeners() {
    document.getElementById('uploadBtn').addEventListener('click', () => {
      document.getElementById('uploadModal').classList.add('active');
    });

    document.getElementById('closeUploadModal').addEventListener('click', () => {
      document.getElementById('uploadModal').classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
      });
    });

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.backgroundColor = 'rgba(0, 102, 204, 0.1)';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.backgroundColor = '';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.backgroundColor = '';
      this.handleFileUpload(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));

    document.getElementById('manualDataForm').addEventListener('submit', (e) => this.handleManualEntry(e));

    document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());
    document.getElementById('startDate').addEventListener('change', () => this.applyFilters());
    document.getElementById('endDate').addEventListener('change', () => this.applyFilters());
    document.getElementById('agentFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());

    document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
  }

  setDefaultDateRange() {
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1));

    document.getElementById('endDate').valueAsDate = new Date();
    document.getElementById('startDate').valueAsDate = lastMonth;
  }

  async handleFileUpload(files) {
    for (const file of files) {
      try {
        const result = await this.dataProcessor.processCSVFile(file);
        alert(`✅ ${result.message}\n${result.recordsCount} records processed`);
        this.loadInitialData();
      } catch (error) {
        alert(`❌ Error processing file: ${error.message}`);
      }
    }
  }

  async handleManualEntry(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      const storeName = this.determineDataStore(data);
      await storage.addData(storeName, {
        ...data,
        timestamp: new Date().toISOString()
      });

      await storage.addData('uploadHistory', {
        uploadDate: new Date().toISOString(),
        fileName: 'Manual Entry',
        recordsCount: 1,
        dataType: storeName,
        size: 0
      });

      form.reset();
      document.getElementById('uploadModal').classList.remove('active');
      alert('✅ Data saved successfully!');
      this.loadInitialData();
    } catch (error) {
      alert(`❌ Error saving data: ${error.message}`);
    }
  }

  determineDataStore(data) {
    if (data.callDate) return 'callCenterData';
    if (data.conversations) return 'csatData';
    if (data.totalTickets) return 'ticketData';
    if (data.avgWaitTime) return 'performanceMetrics';
    return 'performanceMetrics';
  }

  async applyFilters() {
    this.filters = {
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      agent: document.getElementById('agentFilter').value,
      category: document.getElementById('categoryFilter').value,
      status: document.getElementById('statusFilter').value
    };

    await this.updateDashboard();
  }

  resetFilters() {
    this.filters = {};
    document.getElementById('agentFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    this.setDefaultDateRange();
    this.updateDashboard();
  }

  async loadInitialData() {
    this.setDefaultDateRange();
    this.populateAgentFilter();
    await this.updateDashboard();
    this.updateUploadHistory();
  }

  async updateDashboard() {
    try {
      const analysisData = await this.dataProcessor.analyzeAllData(this.filters);
      const metrics = this.dataProcessor.calculateMetrics(analysisData);

      this.updateKPIs(metrics);
      this.updateMetricsDisplay(metrics);
      this.updateAgentTable(analysisData.agentData);
      chartManager.updateAllCharts(analysisData);

      this.updateLastUpdated();
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  }

  updateKPIs(metrics) {
    document.getElementById('totalConversations').textContent = this.formatNumber(metrics.totalConversations);
    document.getElementById('satisfactoryConv').textContent = this.formatNumber(metrics.satisfactory);
    document.getElementById('unsatisfactoryConv').textContent = this.formatNumber(metrics.unsatisfactory);
    document.getElementById('avgStarRating').textContent = metrics.avgStarRating.toFixed(2);
    document.getElementById('csatScore').textContent = metrics.csatScore.toFixed(2);
    document.getElementById('totalCalls').textContent = this.formatNumber(metrics.totalCalls);
  }

  updateMetricsDisplay(metrics) {
    document.getElementById('totalTickets').textContent = this.formatNumber(metrics.totalTickets);
    document.getElementById('unresolvedTickets').textContent = this.formatNumber(metrics.unresolvedTickets);
    document.getElementById('resolvedTickets').textContent = this.formatNumber(metrics.resolvedTickets);
    document.getElementById('resolvedFCR').textContent = this.formatNumber(metrics.resolvedFCR);
    document.getElementById('reopenedTickets').textContent = this.formatNumber(metrics.reopenedTickets);
    document.getElementById('positiveSurveys').textContent = this.formatNumber(metrics.positiveSurveys);

    const fcrPercentage = metrics.resolvedTickets > 0 ? ((metrics.resolvedFCR / metrics.resolvedTickets) * 100).toFixed(1) : 0;
    document.getElementById('fcrPercentage').textContent = `${fcrPercentage}%`;

    document.getElementById('avgFirstResponseDisplay').textContent = this.dataProcessor.secondsToTimeFormat(metrics.avgFirstResponseTime);
    document.getElementById('avgResponseDisplay').textContent = this.dataProcessor.secondsToTimeFormat(metrics.avgResponseTime);
    document.getElementById('avgWaitDisplay').textContent = this.dataProcessor.secondsToTimeFormat(metrics.avgWaitTime);
    document.getElementById('avgInteractionDisplay').textContent = this.dataProcessor.secondsToTimeFormat(metrics.avgInteractionTime);
    document.getElementById('avgResolutionDisplay').textContent = this.dataProcessor.secondsToTimeFormat(metrics.avgResolutionTime);

    document.getElementById('totalInboundCalls').textContent = this.formatNumber(metrics.inboundCalls);
    document.getElementById('totalOutboundCalls').textContent = this.formatNumber(metrics.outboundCalls);
    document.getElementById('totalAbandonedCalls').textContent = this.formatNumber(metrics.abandonedCalls);
    document.getElementById('avgSLA').textContent = `${metrics.avgSLA.toFixed(2)}%`;

    const abandonmentRate = metrics.totalCalls > 0 ? ((metrics.abandonedCalls / metrics.totalCalls) * 100).toFixed(2) : 0;
    document.getElementById('abandonmentRate').textContent = `${abandonmentRate}%`;
  }

  async updateAgentTable(agentData) {
    const tbody = document.querySelector('#agentTable tbody');
    tbody.innerHTML = '';

    agentData.forEach(agent => {
      const responseRate = agent.totalInteractions > 0 ? ((agent.responses / agent.totalInteractions) * 100).toFixed(1) : 0;
      const efficiencyScore = ((agent.responses + agent.privateNotes) / Math.max(agent.totalInteractions, 1) * 100).toFixed(1);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${agent.agentName}</td>
        <td>${this.formatNumber(agent.totalInteractions)}</td>
        <td>${this.formatNumber(agent.privateNotes)}</td>
        <td>${this.formatNumber(agent.responses)}</td>
        <td>${responseRate}%</td>
        <td>${efficiencyScore}%</td>
      `;
      tbody.appendChild(row);
    });
  }

  async populateAgentFilter() {
    const agentData = await storage.getAllData('agentData');
    const select = document.getElementById('agentFilter');
    const existingOptions = Array.from(select.options).map(opt => opt.value);
    const agents = [...new Set(agentData.map(item => item.agentName))];

    agents.forEach(agent => {
      if (!existingOptions.includes(agent)) {
        const option = document.createElement('option');
        option.value = agent;
        option.textContent = agent;
        select.appendChild(option);
      }
    });
  }

  async updateUploadHistory() {
    const history = await storage.getAllData('uploadHistory');
    const tbody = document.querySelector('#dataHistoryTable tbody');
    tbody.innerHTML = '';

    history.reverse().slice(0, 10).forEach(item => {
      const row = document.createElement('tr');
      const uploadDate = new Date(item.uploadDate).toLocaleDateString();
      row.innerHTML = `
        <td>${uploadDate}</td>
        <td>${item.fileName}</td>
        <td>${item.recordsCount}</td>
        <td>${item.dataType}</td>
        <td><button class="btn btn-tertiary">View</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  updateLastUpdated() {
    const now = new Date().toLocaleString();
    document.getElementById('lastUpdated').textContent = now;
  }

  exportData() {
    alert('📥 Export functionality coming soon!');
  }

  formatNumber(num) {
    return Math.round(num).toLocaleString();
  }
}

let dashboard;
window.addEventListener('DOMContentLoaded', async () => {
  await storage.init();
  dashboard = new Dashboard();
});