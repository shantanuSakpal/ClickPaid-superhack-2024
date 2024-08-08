import {NextResponse} from "next/server";
import axios from "axios";
import FormData from "form-data";

export async function POST(request) {
    const engineId = 'stable-diffusion-v1-6'
    const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
    const apiKey = process.env.NEXT_PUBLIC_STABILITY_API_KEY

    if (!request) {
        return new NextResponse('No request object', {status: 400});
    }
    if (!apiKey) throw new Error('Missing Stability API key.')

    try {
        const {body} = await request.json(); // Receive body from JSON
        console.log("body", body)

        const basePrompt = `Create a visually striking and professional thumbnail image for a topic titled "${body.topic}". 
    The image should prominently feature the text "${body.text}" in an eye-catching, easy-to-read font. 
    ${body.description ? `Incorporate elements that represent: ${body.description}. ` : ''}
    The overall style should be modern, vibrant, and attention-grabbing, suitable for social media and online content. 
    Use a balanced color scheme that complements the topic and text. 
    Ensure the composition is clean and uncluttered, with a clear focal point.`;

        const payload = {
            prompt: basePrompt,
            output_format: "jpeg",
            aspect_ratio: "16:9",
        };

        const form = new FormData();
        Object.keys(payload).forEach(key => form.append(key, payload[key]));

        const response = await axios.post(
            `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
            form,
            {
                validateStatus: undefined,
                responseType: "arraybuffer",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: "image/*",
                    ...form.getHeaders()
                },
            },
        );

        if(response.status === 200) {
            const imageData = Buffer.from(response.data).toString('base64');
            const frontendResponse = {
                imageData: imageData,
                width: 1024, // default width
                height: 576, // default height
            };
            return new NextResponse(JSON.stringify(frontendResponse), {
                status: 200,
                headers: {'Content-Type': 'application/json'},
            });
        } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }
    } catch (error) {
        console.error("Error generating image:", error.message);
        return new NextResponse('Failed to generate image', {status: 500});
    }
}