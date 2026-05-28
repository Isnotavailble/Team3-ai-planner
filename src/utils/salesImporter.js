export const importSalesFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCsv && !isExcel) {
      return reject(new Error('Invalid file format. Please upload an Excel (.xlsx) or CSV (.csv) file.'));
    }

    // Since this is a prototype, we will simulate the parsing delay 
    // and generate 30 days of mock sales history based on the file.
    setTimeout(() => {
      const parsedData = [];
      const today = new Date();
      
      // Generate 30 days of history
      for (let i = 30; i >= 1; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        
        // Randomish sales data between 1000 and 5000
        const sales = Math.floor(Math.random() * 4000) + 1000;
        // Randomish expenses
        const expenses = Math.floor(sales * (Math.random() * 0.4 + 0.4)); // 40-80% of sales

        parsedData.push({
          date: d.toISOString().split('T')[0],
          sales,
          expenses
        });
      }

      resolve(parsedData);
    }, 1500);
  });
};
