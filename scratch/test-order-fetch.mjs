import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uswuuiipztaixmsmbywd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzd3V1aWlwenRhaXhtc21ieXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODg3ODIsImV4cCI6MjA5NTI2NDc4Mn0.SURmEVQNTlAPWLsL-Eeh5W8nG7an4g5VIJren2ZYspo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const orderId = "DT_1784646002132_P51TW";
  console.log("Testing query for orderId:", orderId);

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      dream_results (
        id,
        analysis_status,
        analysis_title,
        analysis_content,
        image_url,
        is_public,
        created_at
      )
    `)
    .eq("order_number", orderId)
    .maybeSingle();

  console.log("Result data:", JSON.stringify(data, null, 2));
  console.log("Result error:", error);
}

testQuery();
