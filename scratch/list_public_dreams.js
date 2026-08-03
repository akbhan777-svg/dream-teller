import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from("dream_results")
    .select(`
      id,
      is_public,
      created_at,
      analysis_status,
      order_id,
      orders (
        id,
        dream_content,
        expert_field,
        user_id,
        users (
          nickname
        )
      )
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Total public dreams:", data.length);
  data.forEach((d, i) => {
    const order = Array.isArray(d.orders) ? d.orders[0] : d.orders;
    const user = order?.users ? (Array.isArray(order.users) ? order.users[0] : order.users) : null;
    console.log(`[${i}] ID: ${d.id}`);
    console.log(`    Order ID: ${d.order_id}`);
    console.log(`    Nickname: ${user?.nickname || '비회원'}`);
    console.log(`    Dream Content: ${order?.dream_content?.substring(0, 50)}...`);
    console.log('--------------------------------------------------');
  });
}

main();
