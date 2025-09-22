const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('leagues').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error.message);
    } else {
      console.log('Supabase connected successfully');
    }
  } catch (err) {
    console.error('Supabase connection test failed:', err.message);
  }
}

testConnection();

module.exports = {
  supabase,
  // Legacy compatibility methods (if needed)
  query: async (text, params) => {
    console.warn('Using legacy query method. Consider using supabase client directly.');
    // This is a basic implementation - you should use supabase client methods instead
    return { rows: [], error: null };
  },
  end: () => {
    console.log('Supabase client does not require explicit closing');
  }
};
