// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"
import { corsHeaders } from "../_shared/cors.ts";
import type { Post } from "./types.ts";

// 상수 정의
const TABLE_NAME = 'post';

// .env 파일에 정의된 환경변수 이름에 맞게 수정
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
// service_role 키 사용
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const resourcePath = pathSegments.slice(pathSegments.indexOf('posts') + 1);
    const id = resourcePath.length > 0 ? resourcePath[0] : null;

    console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}${id ? ` (ID: ${id})` : ''}`);

    // 인증 체크 (선택적)
    // const authHeader = req.headers.get('Authorization');
    // 간단한 구현을 위해 인증 체크는 주석 처리

    switch (req.method) {
      case 'GET':
        if (id) {
          return handleGetPost(id);
        } else {
          const query = url.searchParams.get('q');
          return query ? handleSearchPosts(query) : handleGetPosts();
        }

      case 'POST':
        return handleCreatePost(req);

      case 'PUT':
        if (!id) {
          throw new Error('ID is required for PUT request');
        }
        return handleUpdatePost(id, req);

      case 'DELETE':
        if (!id) {
          throw new Error('ID is required for DELETE request');
        }
        return handleDeletePost(id);

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

async function handleGetPosts(): Promise<Response> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify(data || []),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /posts:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handleSearchPosts(query: string): Promise<Response> {
  try {
    console.log(`[${new Date().toISOString()}] Searching posts with query: ${query}`);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify(data || []),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /posts?q=${query}:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handleGetPost(id: string): Promise<Response> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /posts/${id}:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handleCreatePost(req: Request): Promise<Response> {
  try {
    const post = await req.json();
    console.log(`[${new Date().toISOString()}] Creating new post:`, post);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([post])
      .select();
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify(data[0]),
      { 
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /posts:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handleUpdatePost(id: string, req: Request): Promise<Response> {
  try {
    const updates = await req.json();
    console.log(`[${new Date().toISOString()}] Updating post ${id}:`, updates);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify(data[0]),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /posts/${id}:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handleDeletePost(id: string): Promise<Response> {
  try {
    console.log(`[${new Date().toISOString()}] Deleting post ${id}`);
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /posts/${id}:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/posts' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
