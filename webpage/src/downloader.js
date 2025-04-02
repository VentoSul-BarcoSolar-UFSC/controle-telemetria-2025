// JavaScript client for REST API with CSV download functionality

/**
 * Fetch data from the API
 * @param {string} endpoint - API endpoint (e.g., 'users', 'products')
 * @param {number|null} id - Optional ID for specific resource
 * @returns {Promise<Object>} - Promise with JSON response
 */
async function fetchData(endpoint, scope = null) {
    try {
      const url = id 
        ? `http://https://telemetria.teamventosul.com/api?scope=${scope}` 
        : `http://localhost/api/?scope=today`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
  
  /**
   * Convert JSON data to CSV format
   * @param {Array<Object>} data - Array of objects to convert
   * @returns {string} - CSV formatted string
   */
  function convertToCSV(data) {
    if (!data || !data.length) {
      return '';
    }
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const values = headers.map(header => {
        // Handle values with commas or quotes
        const value = item[header] === null ? '' : item[header].toString();
        const escaped = value.includes(',') || value.includes('"') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
        return escaped;
      });
      
      csvContent += values.join(',') + '\n';
    });
    
    return csvContent;
  }
  
  /**
   * Download data as CSV file
   * @param {string} csvContent - CSV content to download
   * @param {string} filename - Name for the download file
   */
  function downloadCSV(csvContent, filename) {
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Add link to document
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Fetch data from API and download as CSV
   * @param {string} endpoint - API endpoint (e.g., 'users', 'products')
   * @param {string} filename - Name for the download file
   */
  async function fetchAndDownloadCSV(endpoint, filename) {
    try {
      // Show loading indicator
      document.getElementById('status').textContent = 'Fetching data...';
      
      // Fetch data from API
      const data = await fetchData(endpoint);
      
      // Convert to CSV
      const csvContent = convertToCSV(data);
      
      if (!csvContent) {
        throw new Error('No data to download');
      }
      
      // Download the CSV file
      downloadCSV(csvContent, filename);
      
      // Update status
      document.getElementById('status').textContent = 'Download complete!';
      setTimeout(() => {
        document.getElementById('status').textContent = '';
      }, 3000);
      
    } catch (error) {
      document.getElementById('status').textContent = `Error: ${error.message}`;
      console.error('Download failed:', error);
    }
  }