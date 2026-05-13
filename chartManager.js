class ChartManager {
  constructor() {
    this.charts = {};
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  }

  createOrUpdateChart(ctx, chartType, data, options = {}) {
    if (this.charts[ctx.canvas.id]) {
      this.charts[ctx.canvas.id].destroy();
    }

    this.charts[ctx.canvas.id] = new Chart(ctx, {
      type: chartType,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        ...options
      }
    });
  }

  updateAllCharts(analysisData) {
    this.updateCSATTrendChart(analysisData);
    this.updateCallActivityChart(analysisData);
    this.updateSLAChart(analysisData);
    this.updateTicketStatusChart(analysisData);
    this.updateBusinessCategoryChart(analysisData);
    this.updateIndividualCategoryChart(analysisData);
    this.updateAgentPerformanceChart(analysisData);
    this.updateResponseTimeChart(analysisData);
  }

  updateCSATTrendChart(data) {
    const grouped = this.groupByDate(data.callData);
    const dates = Object.keys(grouped).sort();
    const inbound = dates.map(date => grouped[date].reduce((sum, item) => sum + (item.inboundCalls || 0), 0));
    const outbound = dates.map(date => grouped[date].reduce((sum, item) => sum + (item.outboundCalls || 0), 0));

    const ctx = document.getElementById('csatTrendChart')?.getContext('2d');
    if (ctx) {
      this.createOrUpdateChart(ctx, 'line', {
        labels: dates,
        datasets: [
          {
            label: 'Inbound Calls',
            data: inbound,
            borderColor: '#0066cc',
            backgroundColor: 'rgba(0, 102, 204, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Outbound Calls',
            data: outbound,
            borderColor: '#00a8e8',
            backgroundColor: 'rgba(0, 168, 232, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      }, {
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      });
    }
  }

  updateCallActivityChart(data) {
    const total = {
      inbound: data.callData.reduce((sum, item) => sum + (item.inboundCalls || 0), 0),
      outbound: data.callData.reduce((sum, item) => sum + (item.outboundCalls || 0), 0),
      abandoned: data.callData.reduce((sum, item) => sum + (item.abandonedCalls || 0), 0)
    };

    const ctx = document.getElementById('callActivityChart')?.getContext('2d');
    if (ctx) {
      this.createOrUpdateChart(ctx, 'doughnut', {
        labels: ['Inbound', 'Outbound', 'Abandoned'],
        datasets: [{
          data: [total.inbound, total.outbound, total.abandoned],
          backgroundColor: ['#06a77d', '#ffa502', '#d32f2f'],
          borderColor: '#fff'
        }]
      });
    }
  }

  updateSLAChart(data) {
    const grouped = this.groupByDate(data.callData);
    const dates = Object.keys(grouped).sort();
    const slaValues = dates.map(date => {
      const items = grouped[date];
      return items.reduce((sum, item) => sum + (item.sla || 0), 0) / items.length;
    });

    const ctx = document.getElementById('slaChart')?.getContext('2d');
    if (ctx) {
      this.createOrUpdateChart(ctx, 'line', {
        labels: dates,
        datasets: [{
          label: 'SLA Compliance %',
          data: slaValues,
          borderColor: '#06a77d',
          backgroundColor: 'rgba(6, 168, 125, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#06a77d'
        }]
      }, {
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      });
    }
  }

  updateTicketStatusChart(data) {
    const total = {
      resolved: data.ticketData.reduce((sum, item) => sum + (item.resolvedTickets || 0), 0),
      unresolved: data.ticketData.reduce((sum, item) => sum + (item.unresolvedTickets || 0), 0),
      reopened: data.ticketData.reduce((sum, item) => sum + (item.reopenedTickets || 0), 0)
    };

    const ctx = document.getElementById('ticketStatusChart')?.getContext('2d');
    if (ctx) {
      this.createOrUpdateChart(ctx, 'bar', {
        labels: ['Resolved', 'Unresolved', 'Reopened'],
        datasets: [{
          label: 'Number of Tickets',
          data: [total.resolved, total.unresolved, total.reopened],
          backgroundColor: ['#06a77d', '#ffa502', '#d32f2f']
        }]
      });
    }
  }

  updateBusinessCategoryChart(data) {
    const grouped = {};
    data.businessData.forEach(item => {
      grouped[item.category] = (grouped[item.category] || 0) + (item.totalTickets || 0);
    });

    const ctx = document.getElementById('businessCategoryChart')?.getContext('2d');
    if (ctx) {
      this.createOrUpdateChart(ctx, 'pie', {
        labels: Object.keys(grouped),
        datasets: [{
          data: Object.values(grouped),
          backgroundColor: this.getColors(Object.keys(grouped).length)
        }]
      });
    }
  }

  updateIndividualCategoryChart(data) {
    const grouped = {};
    data.individualData.forEach(item => {
      grouped[item.caseType] = (grouped[item.caseType] || 0) + (item.totalTickets || 0);
    });

    const ctx = document.getElementById('individualCategoryChart')?.getContext('2d');
    if (ctx) {
      this.createOrUpdateChart(ctx, 'pie', {
        labels: Object.keys(grouped),
        datasets: [{
          data: Object.values(grouped),
          backgroundColor: this.getColors(Object.keys(grouped).length)
        }]
      });
    }
  }

  updateAgentPerformanceChart(data) {
    const topAgents = data.agentData.slice(0, 10).sort((a, b) => b.totalInteractions - a.totalInteractions);
    const ctx = document.getElementById('agentPerformanceChart')?.getContext('2d');

    if (ctx) {
      this.createOrUpdateChart(ctx, 'bar', {
        labels: topAgents.map(a => a.agentName),
        datasets: [{
          label: 'Total Interactions',
          data: topAgents.map(a => a.totalInteractions),
          backgroundColor: '#0066cc'
        }]
      });
    }
  }

  updateResponseTimeChart(data) {
    const avgData = [
      Math.round(data.perfData.reduce((sum, item) => sum + (item.avgWaitTime || 0), 0) / Math.max(data.perfData.length, 1) / 3600),
      Math.round(data.perfData.reduce((sum, item) => sum + (item.avgFirstResponseTime || 0), 0) / Math.max(data.perfData.length, 1) / 3600),
      Math.round(data.perfData.reduce((sum, item) => sum + (item.avgResponseTime || 0), 0) / Math.max(data.perfData.length, 1) / 3600),
      Math.round(data.perfData.reduce((sum, item) => sum + (item.avgInteractionTime || 0), 0) / Math.max(data.perfData.length, 1) / 3600)
    ];

    const ctx = document.getElementById('responseTimeChart')?.getContext('2d');
    if (ctx) {
      this.createOrUpdateChart(ctx, 'bar', {
        labels: ['Avg Wait Time', '1st Response', 'Avg Response', 'Interaction'],
        datasets: [{
          label: 'Time (Hours)',
          data: avgData,
          backgroundColor: ['#0066cc', '#00a8e8', '#06a77d', '#ffa502']
        }]
      });
    }
  }

  groupByDate(data) {
    const grouped = {};
    data.forEach(item => {
      const date = item.date || 'Unknown';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    });
    return grouped;
  }

  getColors(count) {
    const colors = [
      '#0066cc', '#00a8e8', '#06a77d', '#ffa502', '#d32f2f',
      '#7c3aed', '#ec4899', '#06b6d4', '#8b5cf6', '#f43f5e'
    ];
    return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
  }
}

const chartManager = new ChartManager();