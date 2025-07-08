import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
  role?: 'client' | 'hotelier'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    if (path === 'login') {
      const { email, password }: LoginRequest = await req.json()

      // First check if user exists in our users table
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        return new Response(
          JSON.stringify({ error: 'Identifiants invalides' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // For demo purposes, we'll use simple password validation
      // In production, you should use proper password hashing
      const validPasswords: Record<string, string> = {
        'adminwonderpick@gmail.com': 'admin0000',
        'hotelPark@gmail.com': 'hotelPark0000',
        'hotelOcean@gmail.com': 'hotelOcean0000',
        'client1@test.com': 'client123',
        'client2@test.com': 'client123',
        'client3@test.com': 'client123'
      }

      if (validPasswords[email] !== password) {
        return new Response(
          JSON.stringify({ error: 'Identifiants invalides' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          message: 'Connexion réussie',
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === 'register') {
      const { email, password, name, phone, role = 'client' }: RegisterRequest = await req.json()

      // Check if user already exists
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Un compte existe déjà avec cet email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create new user
      const { data: newUser, error } = await supabaseClient
        .from('users')
        .insert({
          email,
          name,
          phone,
          role
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création du compte' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          message: 'Inscription réussie',
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint non trouvé' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})