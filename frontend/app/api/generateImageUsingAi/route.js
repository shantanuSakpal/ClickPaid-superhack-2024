import { NextResponse } from "next/server";

export async function POST(request) {
    if (!request) {
        return new NextResponse('No request object', { status: 400 });
    }

    const apiKey = process.env.GETIMG_API_KEY;
    if(!apiKey)
        return new NextResponse('Api key not found', { status: 403 });

    try {
        const { body } = await request.json(); // Receive body from JSON
//userId = body.userId
        const basePrompt = `Create a visually striking and professional thumbnail image for a topic titled "${body.topic}". 
    The image should prominently feature the text "${body.text}" in an eye-catching, easy-to-read font. 
    ${body.description ? `Incorporate elements that represent: ${body.description}. ` : ''}
    The overall style should be modern, vibrant, and attention-grabbing, suitable for social media and online content. 
    Use a balanced color scheme that complements the topic and text. 
    Ensure the composition is clean and uncluttered, with a clear focal point.`;
        console.log("prompt", basePrompt);

        const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                response_format: 'b64',
                output_format: 'jpeg',
                prompt: basePrompt,
                width: 1024,
                height: 720,
                steps: 5
            })
        };

        const response = await fetch(url, options);
        const json = await response.json();

        if (response.ok) {
            const frontendResponse = {
                imageData: json.image, // Assuming the API returns the base64 image in the 'image' field

            };
            return new NextResponse(JSON.stringify(frontendResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            throw new Error(`${response.status}: ${JSON.stringify(json)}`);
        }
    } catch (error) {
        console.error("Error generating image:", error.message);
        return new NextResponse('Failed to generate image', { status: 500 });
    }
}