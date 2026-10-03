import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://pppsnlkatcoifblavgxy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Kvxq1nuKQaXk00rvBzn9ug_kkmmDIti';

async function testConnection() {
  console.log('Testing connection to Supabase...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  const { data, error } = await supabase.from('profiles').select('*').limit(5);
  
  if (error) {
    console.error('❌ Error fetching profiles:', error.message);
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('The schema.sql has NOT been run yet.');
    }
  } else {
    console.log('✅ Success! Profiles found:', data.length);
    if (data.length > 0) {
      console.log('The seed.sql HAS been run successfully.');
      console.log('Sample user:', data[0].email);
    } else {
      console.log('⚠️ The schema is set up, but the tables are EMPTY. You need to run seed.sql.');
    }
  }
}

testConnection();
