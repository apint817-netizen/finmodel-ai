const fs = require('fs');

console.log("--- DEBUG: CHECKING ENVIRONMENT VARIABLES ---");

const requiredVars = ['DATABASE_URL', 'SUPABASE_DIRECT_URL', 'DIRECT_URL'];

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName} is PRESENT. Length: ${value.length}`);
    } else {
        console.log(`❌ ${varName} is MISSING.`);
    }
});

console.log("--- DEBUG END ---");
