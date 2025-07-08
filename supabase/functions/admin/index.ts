import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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

    // GET /admin/dashboard - Admin dashboard stats
    if (req.method === 'GET' && pathSegments.includes('dashboard')) {
      // Get pending hotels
      const { data: pendingHotels } = await supabaseClient
        .from('hotels')
        .select('*')
        .eq('status', 'en_attente')
        .order('created_at', { ascending: true })

      // Get total counts
      const { count: totalHotels } = await supabaseClient
        .from('hotels')
        .select('*', { count: 'exact', head: true })

      const { count: totalReservations } = await supabaseClient
        .from('reservations')
        .select('*', { count: 'exact', head: true })

      const { count: totalUsers } = await supabaseClient
        .from('users')
        .select('*', { count: 'exact', head: true })

      return new Response(
        JSON.stringify({
          stats: {
            pendingHotels: pendingHotels?.length || 0,
            totalHotels: totalHotels || 0,
            totalReservations: totalReservations || 0,
            totalUsers: totalUsers || 0
          },
          pendingHotels: pendingHotels || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /admin/hotels/pending - Get pending hotels
    if (req.method === 'GET' && pathSegments.includes('pending')) {
      const { data, error } = await supabaseClient
        .from('hotels')
        .select('*')
        .eq('status', 'en_attente')
        .order('created_at', { ascending: true })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la récupération' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /admin/hotels - Get all hotels
    if (req.method === 'GET' && pathSegments.includes('hotels') && !pathSegments.includes('pending')) {
      const { data: hotels, error } = await supabaseClient
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la récupération' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Ajouter les images pour chaque hôtel
      const hotelsWithImages = await Promise.all(
        (hotels || []).map(async (hotel) => {
          const { data: images } = await supabaseClient
            .from('hotel_images')
            .select('*')
            .eq('hotel_id', hotel.id)
            .order('display_order', { ascending: true })

          return {
            ...hotel,
            images: images || [],
            image: images && images.length > 0 
              ? images.find(img => img.is_primary)?.image_url || images[0].image_url 
              : null
          }
        })
      )

      return new Response(
        JSON.stringify(hotelsWithImages),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /admin/hotels/{id}/approve - Approve hotel
    if (req.method === 'PUT' && pathSegments.includes('approve')) {
      const hotelId = pathSegments[pathSegments.indexOf('hotels') + 1]
      const updateData = await req.json()

      const { error } = await supabaseClient
        .from('hotels')
        .update({
          status: 'valide',
          price_per_night: updateData.pricePerNight || 100.00,
          image: updateData.image || null
        })
        .eq('id', hotelId)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de l\'approbation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Hôtel approuvé avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /admin/hotels/{id}/reject - Reject hotel
    if (req.method === 'PUT' && pathSegments.includes('reject')) {
      const hotelId = pathSegments[pathSegments.indexOf('hotels') + 1]

      const { error } = await supabaseClient
        .from('hotels')
        .update({ status: 'refuse' })
        .eq('id', hotelId)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors du rejet' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Hôtel rejeté' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /admin/hotels/{id} - Delete hotel
    if (req.method === 'DELETE' && pathSegments.includes('hotels')) {
      const hotelId = pathSegments[pathSegments.indexOf('hotels') + 1]

      const { error } = await supabaseClient
        .from('hotels')
        .delete()
        .eq('id', hotelId)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la suppression' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Hôtel supprimé avec succès' }),
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