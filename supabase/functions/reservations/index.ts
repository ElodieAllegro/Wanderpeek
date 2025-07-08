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

    // POST /reservations - Create reservation
    if (req.method === 'POST' && pathSegments.length === 2) {
      const reservationData = await req.json()

      const { data, error } = await supabaseClient
        .from('reservations')
        .insert({
          hotel_id: reservationData.hotelId,
          client_id: reservationData.clientId,
          checkin_date: reservationData.checkinDate,
          checkout_date: reservationData.checkoutDate,
          guests: parseInt(reservationData.guests),
          rooms: parseInt(reservationData.rooms),
          total_price: parseFloat(reservationData.totalPrice),
          message: reservationData.message,
          status: 'en_attente'
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création de la réservation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          message: 'Réservation créée avec succès',
          id: data.id
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /reservations/client/{clientId} - Get client reservations
    if (req.method === 'GET' && pathSegments.includes('client')) {
      const clientId = pathSegments[pathSegments.indexOf('client') + 1]

      const { data, error } = await supabaseClient
        .from('reservations')
        .select(`
          *,
          hotels (
            id,
            name,
            city,
            image
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la récupération des réservations' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /reservations/hotel/{hotelId} - Get hotel reservations
    if (req.method === 'GET' && pathSegments.includes('hotel')) {
      const hotelId = pathSegments[pathSegments.indexOf('hotel') + 1]

      const { data, error } = await supabaseClient
        .from('reservations')
        .select(`
          *,
          users (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la récupération des réservations' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /reservations/{id}/status - Update reservation status
    if (req.method === 'PUT' && pathSegments.includes('status')) {
      const reservationId = pathSegments[pathSegments.indexOf('reservations') + 1]
      const { status } = await req.json()

      const validStatuses = ['en_attente', 'confirmee', 'annulee', 'terminee']
      if (!validStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ error: 'Statut invalide' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabaseClient
        .from('reservations')
        .update({ status })
        .eq('id', reservationId)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la mise à jour du statut' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Statut mis à jour avec succès' }),
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