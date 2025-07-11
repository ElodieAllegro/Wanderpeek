import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    
    // GET /hotels - List hotels with filters
    if (req.method === 'GET' && pathSegments.length === 2) {
      const city = url.searchParams.get('city')
      const popular = url.searchParams.get('popular')
      const status = url.searchParams.get('status') || 'valide'

      let query = supabaseClient
        .from('hotels')
        .select('*')

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      if (city) {
        query = query.eq('city', city)
      }

      if (popular === 'true') {
        query = query.order('popularity', { ascending: false }).limit(3)
      } else {
        query = query.order('popularity', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la récupération des hôtels' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /hotels/{id} - Get specific hotel
    if (req.method === 'GET' && pathSegments.length === 3) {
      const hotelId = pathSegments[2]

      // Récupérer l'hôtel
      const { data: hotel, error: hotelError } = await supabaseClient
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .single()

      if (hotelError || !hotel) {
        return new Response(
          JSON.stringify({ error: 'Hôtel introuvable' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Récupérer les images de l'hôtel
      const { data: images } = await supabaseClient
        .from('hotel_images')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('display_order', { ascending: true })

      // Ajouter les images à l'objet hôtel
      const hotelWithImages = {
        ...hotel,
        images: images || [],
        image: images && images.length > 0 ? images.find(img => img.is_primary)?.image_url || images[0].image_url : null
      }

      return new Response(
        JSON.stringify(hotelWithImages),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /hotels/propose - Propose new hotel
    if (req.method === 'POST' && pathSegments.includes('propose')) {
      const hotelData = await req.json()

      const { data: hotel, error: hotelError } = await supabaseClient
        .from('hotels')
        .insert({
          name: hotelData.hotelName,
          description: hotelData.hotelDescription,
          city: hotelData.hotelCity,
          address: hotelData.hotelAddress,
          postal_code: hotelData.hotelPostal,
          type: hotelData.hotelType,
          rooms: parseInt(hotelData.hotelRooms),
          capacity: parseInt(hotelData.hotelCapacity),
          price_per_night: 100.00, // Default price, admin will set final price
          status: 'en_attente',
          popularity: 0,
          amenities: hotelData.amenities || [],
          contact_name: hotelData.contactName,
          contact_email: hotelData.contactEmail,
          contact_phone: hotelData.contactPhone,
          website: hotelData.contactWebsite,
          additional_info: hotelData.additionalInfo
        })
        .select()
        .single()

      if (hotelError) {
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la proposition d\'hôtel' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Ajouter les images si elles sont fournies
      if (hotelData.images && hotelData.images.length > 0) {
        const imageInserts = hotelData.images.map((imageUrl, index) => ({
          hotel_id: hotel.id,
          image_url: imageUrl,
          is_primary: index === 0, // La première image est l'image principale
          display_order: index,
          alt_text: `Photo ${index + 1} de ${hotelData.hotelName}`
        }))

        const { error: imageError } = await supabaseClient
          .from('hotel_images')
          .insert(imageInserts)

        if (imageError) {
          console.error('Erreur lors de l\'ajout des images:', imageError)
          // On continue même si les images échouent
        }
      }

      return new Response(
        JSON.stringify({
          message: 'Proposition d\'hôtel envoyée avec succès',
          id: hotel.id
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /hotels/{id}/approve - Approve hotel (admin only)
    if (req.method === 'PUT' && pathSegments.includes('approve')) {
      const hotelId = pathSegments[2]
      const updateData = await req.json()

      const { data, error } = await supabaseClient
        .from('hotels')
        .update({
          status: 'valide',
          price_per_night: updateData.pricePerNight || 100.00,
          image: updateData.image || null
        })
        .eq('id', hotelId)
        .select()
        .single()

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

    // PUT /hotels/{id}/reject - Reject hotel (admin only)
    if (req.method === 'PUT' && pathSegments.includes('reject')) {
      const hotelId = pathSegments[2]

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

    // DELETE /hotels/{id} - Delete hotel (admin only)
    if (req.method === 'DELETE' && pathSegments.length === 3) {
      const hotelId = pathSegments[2]

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