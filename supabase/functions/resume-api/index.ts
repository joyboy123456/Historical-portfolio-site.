Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const url = new URL(req.url);
        const pathParts = url.pathname.split('/').filter(Boolean);
        const sectionId = pathParts[pathParts.length - 1];

        // GET - 获取所有区域或单个区域
        if (req.method === 'GET') {
            let queryUrl = `${supabaseUrl}/rest/v1/resume_sections?order=display_order.asc,created_at.desc`;
            
            // 如果有ID，获取单个区域
            if (sectionId && sectionId !== 'resume-api') {
                queryUrl = `${supabaseUrl}/rest/v1/resume_sections?id=eq.${sectionId}`;
            }
            
            // 支持按类型筛选
            const sectionType = url.searchParams.get('section_type');
            if (sectionType) {
                queryUrl = `${supabaseUrl}/rest/v1/resume_sections?section_type=eq.${sectionType}`;
            }

            const response = await fetch(queryUrl, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch resume sections: ${errorText}`);
            }

            const data = await response.json();

            return new Response(JSON.stringify({
                data: sectionId && sectionId !== 'resume-api' ? (data[0] || null) : data
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // POST - 创建新区域
        if (req.method === 'POST') {
            const body = await req.json();

            const response = await fetch(`${supabaseUrl}/rest/v1/resume_sections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    section_type: body.section_type,
                    title: body.title,
                    content: body.content,
                    metadata: body.metadata || {},
                    display_order: body.display_order || 0
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create resume section: ${errorText}`);
            }

            const data = await response.json();

            return new Response(JSON.stringify({ data: data[0] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // PUT - 更新区域
        if (req.method === 'PUT') {
            if (!sectionId || sectionId === 'resume-api') {
                throw new Error('Section ID is required for update');
            }

            const body = await req.json();
            const updateData = {
                updated_at: new Date().toISOString()
            };

            // 只更新提供的字段
            if (body.section_type !== undefined) updateData.section_type = body.section_type;
            if (body.title !== undefined) updateData.title = body.title;
            if (body.content !== undefined) updateData.content = body.content;
            if (body.metadata !== undefined) updateData.metadata = body.metadata;
            if (body.display_order !== undefined) updateData.display_order = body.display_order;

            const response = await fetch(`${supabaseUrl}/rest/v1/resume_sections?id=eq.${sectionId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update resume section: ${errorText}`);
            }

            const data = await response.json();

            return new Response(JSON.stringify({ data: data[0] || null }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // DELETE - 删除区域
        if (req.method === 'DELETE') {
            if (!sectionId || sectionId === 'resume-api') {
                throw new Error('Section ID is required for delete');
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/resume_sections?id=eq.${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete resume section: ${errorText}`);
            }

            return new Response(JSON.stringify({ 
                data: { success: true, message: 'Resume section deleted successfully' }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Method not allowed');

    } catch (error) {
        console.error('Resume API error:', error);

        const errorResponse = {
            error: {
                code: 'RESUME_API_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
