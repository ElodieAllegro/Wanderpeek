import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    const pathSegments = url.pathname.split('/').filter(Boolean)

    // GET /hotelier/dashboard/{userId} - Hotelier dashboard
    if (req.method === 'GET' && pathSegments.includes('dashboard')) {
      const userId = pathSegments[pathSegments.indexOf('dashboard') + 1]

      // Get hotelier's hotels
      const { data: hotels } = await supabaseClient
        .from('hotels')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      // Get reservations for hotelier's hotels
      const hotelIds = hotels?.map(h => h.id) || []
      let reservations = []
      
      if (hotelIds.length > 0) {
        const { data: reservationData } = await supabaseClient
          .from('reservations')
          .select(`
            *,
            hotels (name),
            users (name, email)
          `)
          .in('hotel_id', hotelIds)
          .order('created_at', { ascending: false })
        
        reservations = reservationData || []
      }

      const stats = {
        totalHotels: hotels?.length || 0,
        totalReservations: reservations.length,
        approvedHotels: hotels?.filter(h => h.status === 'valide').length || 0
      }

      return new Response(
        JSON.stringify({
          hotels: hotels || [],
          reservations,
          stats
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /hotelier/hotels/{hotelId}/availability - Get hotel availability
    if (req.method === 'GET' && pathSegments.includes('availability')) {
      const hotelId = pathSegments[pathSegments.indexOf('hotels') + 1]
      const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0]
      const endDate = url.searchParams.get('endDate') || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabaseClient
        .from('availabilities')
        .select('*')
        .eq('hotel_id', hotelId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la récupération des disponibilités' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /hotelier/hotels/{hotelId}/availability - Update hotel availability
    if (req.method === 'POST' && pathSegments.includes('availability')) {
      const hotelId = pathSegments[pathSegments.indexOf('hotels') + 1]
      const availabilityData = await req.json()

      // Process each availability update
      const updates = []
      for (const item of availabilityData) {
        const { error } = await supabaseClient
          .from('availabilities')
          .upsert({
            hotel_id: hotelId,
            date: item.date,
            is_available: item.isAvailable,
            price_override: item.priceOverride || null,
            notes: item.notes || null
          })

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Erreur lors de la mise à jour des disponibilités' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({ message: 'Disponibilités mises à jour avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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