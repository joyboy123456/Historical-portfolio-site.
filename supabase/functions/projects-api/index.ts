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
        const projectId = pathParts[pathParts.length - 1];

        // GET - 获取所有作品或单个作品
        if (req.method === 'GET') {
            let queryUrl = `${supabaseUrl}/rest/v1/projects?order=display_order.asc,created_at.desc`;
            
            // 如果有ID，获取单个作品
            if (projectId && projectId !== 'projects-api') {
                queryUrl = `${supabaseUrl}/rest/v1/projects?id=eq.${projectId}`;
            }
            
            // 支持分类筛选
            const category = url.searchParams.get('category');
            if (category) {
                queryUrl += `&category=eq.${category}`;
            }

            // 支持精选筛选
            const featured = url.searchParams.get('featured');
            if (featured === 'true') {
                queryUrl += `&featured=eq.true`;
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
                throw new Error(`Failed to fetch projects: ${errorText}`);
            }

            const data = await response.json();

            return new Response(JSON.stringify({
                data: projectId && projectId !== 'projects-api' ? (data[0] || null) : data
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // POST - 创建新作品
        if (req.method === 'POST') {
            const body = await req.json();

            const response = await fetch(`${supabaseUrl}/rest/v1/projects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    title: body.title,
                    description: body.description,
                    image_url: body.image_url,
                    tags: body.tags || [],
                    category: body.category || '',
                    featured: body.featured || false,
                    display_order: body.display_order || 0
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create project: ${errorText}`);
            }

            const data = await response.json();

            return new Response(JSON.stringify({ data: data[0] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // PUT - 更新作品
        if (req.method === 'PUT') {
            if (!projectId || projectId === 'projects-api') {
                throw new Error('Project ID is required for update');
            }

            const body = await req.json();
            const updateData = {
                updated_at: new Date().toISOString()
            };

            // 只更新提供的字段
            if (body.title !== undefined) updateData.title = body.title;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.image_url !== undefined) updateData.image_url = body.image_url;
            if (body.tags !== undefined) updateData.tags = body.tags;
            if (body.category !== undefined) updateData.category = body.category;
            if (body.featured !== undefined) updateData.featured = body.featured;
            if (body.display_order !== undefined) updateData.display_order = body.display_order;

            const response = await fetch(`${supabaseUrl}/rest/v1/projects?id=eq.${projectId}`, {
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
                throw new Error(`Failed to update project: ${errorText}`);
            }

            const data = await response.json();

            return new Response(JSON.stringify({ data: data[0] || null }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // DELETE - 删除作品
        if (req.method === 'DELETE') {
            if (!projectId || projectId === 'projects-api') {
                throw new Error('Project ID is required for delete');
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/projects?id=eq.${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete project: ${errorText}`);
            }

            return new Response(JSON.stringify({ 
                data: { success: true, message: 'Project deleted successfully' }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Method not allowed');

    } catch (error) {
        console.error('Projects API error:', error);

        const errorResponse = {
            error: {
                code: 'PROJECTS_API_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
