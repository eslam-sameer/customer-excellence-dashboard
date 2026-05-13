class DataProcessor {
  constructor() {
    this.allData = {};
  }

  async processCSVFile(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const fileName = file.name.toLowerCase();
            let dataType = 'unknown';
            let storeName = null;

            if (fileName.includes('total_calls') || fileName.includes('calls')) {
              dataType = 'Call Center';
              storeName = 'callCenterData';
              await this.processCallCenterData(results.data, storeName);
            } else if (fileName.includes('business_drivers')) {
              dataType = 'Business Categories';
              storeName = 'businessCategories';
              await this.processBusinessData(results.data, storeName);
            } else if (fileName.includes('individual_drivers')) {
              dataType = 'Individual Categories';
              storeName = 'individualCategories';
              await this.processIndividualData(results.data, storeName);
            } else if (fileName.includes('agent_interactions')) {
              dataType = 'Agent Performance';
              storeName = 'agentData';
              await this.processAgentData(results.data, storeName);
            } else if (fileName.includes('overall_performance')) {
              dataType = 'Overall Performance';
              storeName = 'performanceMetrics';
              await this.processPerformanceMetricsData(results.data, storeName);
            } else if (fileName.includes('csat_volume')) {
              dataType = 'CSAT Volume';
              storeName = 'csatData';
              await this.processCSATVolumeData(results.data, storeName);
            }

            await storage.addData('uploadHistory', {
              uploadDate: new Date().toISOString(),
              fileName: file.name,
              recordsCount: results.data.length,
              dataType: dataType,
              size: file.size
            });

            resolve({
              success: true,
              message: `Successfully processed ${dataType}`,
              recordsCount: results.data.length
            });
          } catch (error) {
            reject(error);
          }
        },
        error: reject
      });
    });
  }

  async processCallCenterData(data, storeName) {
    for (const row of data) {
      if (row.Day) {
        await storage.addData(storeName, {
          date: row.Day,
          inboundCalls: parseInt(row['Inbound Calls']) || 0,
          outboundCalls: parseInt(row['Outbound Calls']) || 0,
          abandonedCalls: parseInt(row['Abandoned Calls']) || 0,
          sla: parseFloat(row.SLA) || 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async processBusinessData(data, storeName) {
    for (const row of data) {
      if (row['Business Case Type']) {
        await storage.addData(storeName, {
          category: row['Business Case Type'],
          subCategory: row['Business : Sub-Category'],
          totalTickets: parseInt(row['Total Tickets']) || 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async processIndividualData(data, storeName) {
    for (const row of data) {
      if (row['Individual Case Type']) {
        await storage.addData(storeName, {
          caseType: row['Individual Case Type'],
          subCategory: row['Individual : Sub-Category'],
          totalTickets: parseInt(row['Total Tickets']) || 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async processAgentData(data, storeName) {
    for (const row of data) {
      if (row['Agent name']) {
        await storage.addData(storeName, {
          agentName: row['Agent name'],
          totalInteractions: parseInt(row['Total Agent interaction']) || 0,
          privateNotes: parseInt(row['Total Private notes by agent']) || 0,
          responses: parseInt(row['Total Agent responses']) || 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async processPerformanceMetricsData(data, storeName) {
    for (const row of data) {
      if (row.Conversations) {
        await storage.addData(storeName, {
          conversations: parseInt(row.Conversations) || 0,
          avgWaitTime: this.parseTimeToSeconds(row['Average wait time']) || 0,
          avgFirstResponseTime: this.parseTimeToSeconds(row['Average first response time']) || 0,
          avgResponseTime: this.parseTimeToSeconds(row['Average response time']) || 0,
          avgInteractionTime: this.parseTimeToSeconds(row['Average interaction time']) || 0,
          avgResolutionTime: this.parseTimeToSeconds(row['Average resolution time']) || 0,
          csatScore: parseFloat(row['Average CSAT score']) || 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async processCSATVolumeData(data, storeName) {
    for (const row of data) {
      if (row.Conversations) {
        await storage.addData(storeName, {
          conversations: parseInt(row.Conversations) || 0,
          satisfactory: parseInt(row['Satisfactory conversations']) || 0,
          unsatisfactory: parseInt(row['Unsatisfactory conversations']) || 0,
          starRatingsProvided: parseInt(row['Star ratings provided']) || 0,
          avgStarRating: parseFloat(row['Average star rating']) || 0,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    
    let seconds = 0;
    const hourMatch = timeStr.match(/(\d+)h/);
    const minMatch = timeStr.match(/(\d+)m/);
    const secMatch = timeStr.match(/(\d+)s/);
    
    if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600;
    if (minMatch) seconds += parseInt(minMatch[1]) * 60;
    if (secMatch) seconds += parseInt(secMatch[1]);
    
    return seconds;
  }

  async analyzeAllData(filters = {}) {
    const callData = await storage.getAllData('callCenterData');
    const csatData = await storage.getAllData('csatData');
    const ticketData = await storage.getAllData('ticketData');
    const perfData = await storage.getAllData('performanceMetrics');
    const agentData = await storage.getAllData('agentData');
    const businessData = await storage.getAllData('businessCategories');
    const individualData = await storage.getAllData('individualCategories');

    return {
      callData: this.filterByDate(callData, filters),
      csatData: this.filterByDate(csatData, filters),
      ticketData: this.filterByDate(ticketData, filters),
      perfData: this.filterByDate(perfData, filters),
      agentData: this.filterByAgent(agentData, filters),
      businessData,
      individualData
    };
  }

  filterByDate(data, filters) {
    if (!filters.startDate || !filters.endDate) return data;

    const start = new Date(filters.startDate).getTime();
    const end = new Date(filters.endDate).getTime();

    return data.filter(item => {
      if (!item.date && !item.timestamp) return true;
      const itemDate = new Date(item.date || item.timestamp).getTime();
      return itemDate >= start && itemDate <= end;
    });
  }

  filterByAgent(data, filters) {
    if (!filters.agent) return data;
    return data.filter(item => item.agentName === filters.agent);
  }

  calculateMetrics(data) {
    return {
      totalConversations: data.csatData.reduce((sum, item) => sum + (item.conversations || 0), 0),
      satisfactory: data.csatData.reduce((sum, item) => sum + (item.satisfactory || 0), 0),
      unsatisfactory: data.csatData.reduce((sum, item) => sum + (item.unsatisfactory || 0), 0),
      avgStarRating: this.calculateAverage(data.csatData.map(item => item.avgStarRating || 0)),
      totalCalls: (data.callData.reduce((sum, item) => sum + (item.inboundCalls || 0), 0)) + (data.callData.reduce((sum, item) => sum + (item.outboundCalls || 0), 0)),
      inboundCalls: data.callData.reduce((sum, item) => sum + (item.inboundCalls || 0), 0),
      outboundCalls: data.callData.reduce((sum, item) => sum + (item.outboundCalls || 0), 0),
      abandonedCalls: data.callData.reduce((sum, item) => sum + (item.abandonedCalls || 0), 0),
      avgSLA: this.calculateAverage(data.callData.map(item => item.sla || 0)),
      avgResponseTime: this.calculateAverage(data.perfData.map(item => item.avgResponseTime || 0)),
      avgFirstResponseTime: this.calculateAverage(data.perfData.map(item => item.avgFirstResponseTime || 0)),
      avgWaitTime: this.calculateAverage(data.perfData.map(item => item.avgWaitTime || 0)),
      avgInteractionTime: this.calculateAverage(data.perfData.map(item => item.avgInteractionTime || 0)),
      avgResolutionTime: this.calculateAverage(data.perfData.map(item => item.avgResolutionTime || 0)),
      csatScore: this.calculateAverage(data.perfData.map(item => item.csatScore || 0)),
      totalTickets: data.ticketData.reduce((sum, item) => sum + (item.totalTickets || 0), 0),
      unresolvedTickets: data.ticketData.reduce((sum, item) => sum + (item.unresolvedTickets || 0), 0),
      resolvedTickets: data.ticketData.reduce((sum, item) => sum + (item.resolvedTickets || 0), 0),
      resolvedFCR: data.ticketData.reduce((sum, item) => sum + (item.resolvedFCR || 0), 0),
      reopenedTickets: data.ticketData.reduce((sum, item) => sum + (item.reopenedTickets || 0), 0),
      positiveSurveys: data.ticketData.reduce((sum, item) => sum + (item.positiveSurveys || 0), 0)
    };
  }

  calculateAverage(values) {
    const filtered = values.filter(v => v > 0);
    if (filtered.length === 0) return 0;
    return filtered.reduce((a, b) => a + b, 0) / filtered.length;
  }

  secondsToTimeFormat(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  }
}
