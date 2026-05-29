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
    // and generate mock sales transactions based on the file.
    setTimeout(() => {
      const parsedData = [];
      const today = new Date();

      // Sample customers (used when the file doesn't contain customer info)
      const sampleCustomers = [
        'ဦးအောင်ကျော်',
        'မစန္ဒီ',
        'ကိုမင်းလွင်',
        'Daw Mya Mya',
        'U Htet Aung',
        'Ko Zaw Lin'
      ];
      
      // Generate up to 30 days of history (as transactions)
      for (let i = 30; i >= 1; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        
        const date = d.toISOString().split('T')[0];

        // 2-6 transactions per day
        const txCount = Math.floor(Math.random() * 5) + 2;
        for (let t = 0; t < txCount; t++) {
          // Randomish sales data between 1000 and 5000
          const sales = Math.floor(Math.random() * 4000) + 1000;
          // Randomish expenses (not accurate per customer, but useful for demo)
          const expenses = Math.floor(sales * (Math.random() * 0.4 + 0.4)); // 40-80% of sales
          const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];

          parsedData.push({
            date,
            customer,
            sales,
            expenses
          });
        }
      }

      resolve(parsedData);
    }, 1500);
  });
};
