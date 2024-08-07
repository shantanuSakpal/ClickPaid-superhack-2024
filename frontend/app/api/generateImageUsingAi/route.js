import {NextResponse} from "next/server";

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
        /*
           body = {
            "topic": "Aiming for inclusive education via personalized learning",
            "text": "mumbai",
            "description": ""
        }
         */
        // Construct a more detailed prompt using the user's input
        const basePrompt = `Create a visually striking and professional thumbnail image for a topic titled "${body.topic}". 
        The image should prominently feature the text "${body.text}" in an eye-catching, easy-to-read font. 
        ${body.description ? `Incorporate elements that represent: ${body.description}. ` : ''}
        The overall style should be modern, vibrant, and attention-grabbing, suitable for social media and online content. 
        Use a balanced color scheme that complements the topic and text. 
        Ensure the composition is clean and uncluttered, with a clear focal point.`;

        const response = await fetch(
            `${apiHost}/v1/generation/${engineId}/text-to-image`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    text_prompts: [
                        {
                            text: basePrompt,
                            weight: 1
                        },
                        {
                            text: "blurry, low quality, distorted, unattractive, amateur",
                            weight: -1
                        }
                    ],
                    cfg_scale: 7,
                    height: 576,
                    width: 1024,
                    steps: 30,
                    samples: 1,
                }),
            }
        )

        const responseData = await response.json();

        // Extract the base64 image data
        const imageData = responseData.artifacts[0].base64;

        // Send only the necessary data to the frontend
        const frontendResponse = {
            imageData: imageData,
            // You can include other metadata if needed
            width: responseData.artifacts[0].width,
            height: responseData.artifacts[0].height,
        };

        return new NextResponse(JSON.stringify(frontendResponse), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
        });
    } catch (error) {
        console.error("Error generating image:", error);
        return new NextResponse('Failed to generate image', {status: 500});
    }
}