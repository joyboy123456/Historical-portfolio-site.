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
        const { imageData, fileName } = await req.json();

        if (!imageData || !fileName) {
            throw new Error('Image data and filename are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // 提取base64数据和MIME类型
        const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (!base64Match) {
            throw new Error('Invalid image data format');
        }

        const mimeType = base64Match[1];
        const base64Data = base64Match[2];

        // 验证MIME类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(mimeType)) {
            throw new Error(`Invalid image type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        // 转换base64为二进制
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // 检查文件大小（10MB限制）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (binaryData.length > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        // 生成唯一文件名（使用时间戳 + 原始文件名）
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${timestamp}-${sanitizedFileName}`;

        // 上传到Supabase Storage
        const uploadResponse = await fetch(
            `${supabaseUrl}/storage/v1/object/portfolio-images/${storagePath}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': mimeType,
                    'x-upsert': 'true'
                },
                body: binaryData
            }
        );

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // 生成公开访问URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/portfolio-images/${storagePath}`;

        return new Response(JSON.stringify({
            data: {
                url: publicUrl,
                path: storagePath,
                size: binaryData.length,
                mimeType: mimeType
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Image upload error:', error);

        const errorResponse = {
            error: {
                code: 'IMAGE_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
