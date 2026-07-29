const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

(async () => {
  console.log('Starting Security RLS (Row Level Security) Guest Policy Test...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials not found in .env.local');
    process.exit(1);
  }

  // Create a standard client using the public anon key (representing a completely unauthenticated guest or malicious attacker)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const GUEST_UUID = "00000000-0000-0000-0000-000000000000";
    
    console.log(`[TEST 1] Attempting to select orders using the shared guest UUID (${GUEST_UUID})...`);
    
    // We try to fetch all orders for the guest UUID using the anon key.
    // If RLS is properly configured, it should return 0 rows (since unauthenticated users cannot read).
    // Or if they can, they can only read their own (but auth.uid() is null for them).
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, dream_content')
      .eq('user_id', GUEST_UUID);

    if (ordersError) {
       console.log(`✅ RLS explicitly blocked the query. Error: ${ordersError.message}`);
    } else {
       console.log(`Query succeeded. Checking rows returned...`);
       if (orders && orders.length > 0) {
         console.error(`❌ CRITICAL VULNERABILITY: Unauthenticated user fetched ${orders.length} orders belonging to the guest UUID!`);
         console.error(orders);
         process.exit(1);
       } else {
         console.log(`✅ Passed: 0 rows returned. RLS correctly prevented data leak for the shared Guest UUID.`);
       }
    }
    
    console.log(`\n[TEST 2] Attempting to select dream_results directly...`);
    const { data: results, error: resultsError } = await supabase
      .from('dream_results')
      .select('*')
      .limit(5);
      
    if (resultsError) {
       console.log(`✅ RLS explicitly blocked the query. Error: ${resultsError.message}`);
    } else {
       // Is_public might be readable depending on the schema, but private ones should be hidden.
       const privateResults = (results || []).filter(r => !r.is_public);
       if (privateResults.length > 0) {
         console.error(`❌ CRITICAL VULNERABILITY: Unauthenticated user fetched private dream results!`);
         process.exit(1);
       } else {
         console.log(`✅ Passed: No private dream results were leaked.`);
       }
    }

    console.log('\n🎉 E2E Security RLS (Guest) Test Passed Successfully!');
  } catch (e) {
    console.error(`❌ Failed Exception:`, e.message);
    process.exit(1);
  }
})();
